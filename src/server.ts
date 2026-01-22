#!/usr/bin/env node

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { getCase, updateCase, addCase, getProjects, getProject, getSuites, getSuite, getCases, addAttachmentToCase, getSections, getRuns, getRun, getTests, getTest, updateTest, updateRun, addResult, getCaseFields, CaseCreatePayload } from './services/testrailService';
import { logger } from './logger';

async function main(): Promise<void> {
  logger.info('Starting TestRail MCP server...');
  
  const server = new McpServer({
    name: 'testrail-mcp',
    version: '0.1.0',
  });

  logger.debug('Registering get_case tool...');
  
  server.registerTool(
    'get_case',
    {
      title: 'Get TestRail Case',
      description: 'Fetch a TestRail test case by ID.',
      inputSchema: {
        case_id: z.number().int().positive().describe('TestRail case ID'),
      },
    },
    async ({ case_id }) => {
      logger.debug(`Tool called with case_id: ${case_id}`);
      try {
        const result = await getCase(case_id);
        logger.debug(`Tool completed successfully for case_id: ${case_id}`);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      } catch (err) {
        logger.error({ err }, `Tool failed for case_id: ${case_id}`);
        const e = err as { type?: string; status?: number; message?: string };
        let message = 'Unexpected error';
        if (e?.type === 'auth') message = 'Authentication failed: check TESTRAIL_USER/API_KEY';
        else if (e?.type === 'not_found') message = `Case ${case_id} not found`;
        else if (e?.type === 'rate_limited') message = 'Rate limited by TestRail; try again later';
        else if (e?.type === 'server') message = 'TestRail server error';
        else if (e?.type === 'network') message = 'Network error contacting TestRail';
        else if (e?.message) message = e.message;

        return {
          content: [
            { type: 'text', text: message },
          ],
          isError: true,
        };
      }
    },
  );

  logger.debug('Registering add_case tool...');
  
  server.registerTool(
    'add_case',
    {
      title: 'Add TestRail Case',
      description: `Create a new TestRail test case.

REQUIRED WORKFLOW (follow exactly to avoid errors):
1. Call get_cases with section_id and limit=1 to see an existing case's field format
2. Call get_case_fields to find ALL required fields (configs[].options.is_required=true)
3. Include ALL required custom fields matching the format from step 1

REQUIRED CUSTOM FIELDS (vary by project - check is_required flag):
- custom_automation_type: integer (e.g., 0=None, 1=Automated)
- custom_case_complexity: integer (e.g., 0=Simple, 1=Medium, 2=Complex)  
- custom_version: integer (project-specific version ID)

TEST STEPS - Two mutually exclusive formats exist (check existing cases to see which one the project uses):

Format A - Separated steps (type_id=10, most common):
"custom_steps_separated": [
  { "content": "Step 1 action", "expected": "Step 1 expected result" },
  { "content": "Step 2 action", "expected": "Step 2 expected result" }
]

Format B - Simple text fields (type_id=3):
"custom_steps": "Step 1\\nStep 2\\nStep 3"
"custom_expected": "Expected result text"

IMPORTANT: Do NOT mix formats. Check an existing case in the target section to see which format is used.

HTTP 400 ERROR: Means missing required fields OR wrong field format. Check existing cases first.

Section resolution: Provide section_id directly, or project_id (+ suite_id for multi-suite projects) to auto-resolve.`,
      inputSchema: {
        title: z.string().min(1).describe('Test case title - should be descriptive and unique within the section'),
        section_id: z.number().int().positive().optional().describe('Section ID where the case will be created. If not provided, project_id must be provided to auto-resolve the section.'),
        project_id: z.number().int().positive().optional().describe('Project ID. Required if section_id is not provided. Used to auto-resolve section and to identify required custom fields.'),
        suite_id: z.number().int().positive().optional().describe('Suite ID. Required for multi-suite projects (suite_mode=3) if section_id is not provided.'),
        type_id: z.number().int().positive().optional().describe('Test case type ID (e.g., 1=Acceptance, 6=Functional, 7=Other, 9=Regression). Use get_cases to see values used in existing cases.'),
        priority_id: z.number().int().positive().optional().describe('Priority ID (1=Low, 2=Medium, 3=High, 4=Critical).'),
        refs: z.string().nullable().optional().describe('References (e.g., JIRA tickets). Comma-separated for multiple.'),
        custom: z.record(z.string(), z.unknown()).optional().describe('CRITICAL: Custom fields object. MUST include ALL required fields (check is_required=true in get_case_fields). MUST match format used in existing cases (check with get_cases). Example with separated steps: { "custom_automation_type": 0, "custom_case_complexity": 0, "custom_version": 11, "custom_steps_separated": [{"content": "Do X", "expected": "Y happens"}] }'),
      },
    },
    async ({ title, section_id, project_id, suite_id, type_id, priority_id, refs, custom }) => {
      logger.debug(`Add case tool called with section_id: ${section_id}, project_id: ${project_id}, suite_id: ${suite_id}, title: ${title}`);
      try {
        let resolvedSectionId = section_id;
        
        // If section_id is not provided, resolve it from project_id
        if (!resolvedSectionId) {
          if (!project_id) {
            return {
              content: [
                { 
                  type: 'text', 
                  text: 'Either section_id or project_id must be provided. If project_id is provided, the tool will automatically find a suitable section. If you need to find sections first, use get_projects and get_sections tools.' 
                },
              ],
              isError: true,
            };
          }
          
          // Fetch sections for the project
          logger.debug(`Resolving section_id from project_id: ${project_id}, suite_id: ${suite_id}`);
          const sectionsResult = await getSections({
            project_id,
            ...(suite_id !== undefined && { suite_id }),
          });
          
          if (!sectionsResult.sections || sectionsResult.sections.length === 0) {
            return {
              content: [
                { 
                  type: 'text', 
                  text: `No sections found for project ${project_id}${suite_id ? ` and suite ${suite_id}` : ''}. Please create a section first or use get_sections tool to verify available sections.` 
                },
              ],
              isError: true,
            };
          }
          
          // Find the first root-level section (depth=0, parent_id=null)
          const rootSection = sectionsResult.sections.find(s => s.depth === 0 && s.parent_id === null);
          
          if (rootSection) {
            resolvedSectionId = rootSection.id;
            logger.debug(`Auto-resolved section_id: ${resolvedSectionId} (${rootSection.name})`);
          } else {
            // If no root section found, use the first section
            resolvedSectionId = sectionsResult.sections[0].id;
            logger.debug(`Auto-resolved section_id: ${resolvedSectionId} (${sectionsResult.sections[0].name}) - using first available section`);
          }
        }
        
        const payload: CaseCreatePayload = {
          title,
          section_id: resolvedSectionId,
          type_id,
          priority_id,
          refs,
          custom,
        };
        
        const result = await addCase(payload);
        logger.debug(`Add case tool completed successfully. Case ID: ${result.id}, Section ID: ${resolvedSectionId}`);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      } catch (err) {
        logger.error({ err }, `Add case tool failed for section_id: ${section_id}, project_id: ${project_id}`);
        const e = err as { type?: string; status?: number; message?: string };
        let message = 'Unexpected error';
        if (e?.type === 'auth') message = 'Authentication failed: check TESTRAIL_USER/API_KEY';
        else if (e?.type === 'not_found') {
          if (section_id) {
            message = `Section ${section_id} not found. Use get_sections tool to find valid section IDs for your project.`;
          } else {
            message = `Project ${project_id}${suite_id ? ` or suite ${suite_id}` : ''} not found. Use get_projects and get_suites tools to find valid IDs.`;
          }
        }
        else if (e?.type === 'validation_error') {
          message = `Validation error (HTTP 400): ${e.message}. This usually means MISSING REQUIRED CUSTOM FIELDS. ` +
            `SOLUTION: 1) Call get_case_fields tool, 2) Find fields where configs[].options.is_required=true, ` +
            `3) Include ALL required fields in the "custom" parameter. ` +
            `Common required fields: custom_automation_type, custom_case_complexity, custom_version.`;
        }
        else if (e?.type === 'permission_denied') message = `Permission denied. Try a different project or section using get_projects and get_sections tools.`;
        else if (e?.type === 'rate_limited') message = 'Rate limited by TestRail; try again later';
        else if (e?.type === 'server') message = 'TestRail server error';
        else if (e?.type === 'network') message = 'Network error contacting TestRail';
        else if (e?.message) message = e.message;

        return {
          content: [
            { type: 'text', text: message },
          ],
          isError: true,
        };
      }
    },
  );

  logger.debug('Registering update_case tool...');
  
  server.registerTool(
    'update_case',
    {
      title: 'Update TestRail Case',
      description: 'Update a TestRail test case by ID with new field values.',
      inputSchema: {
        case_id: z.number().int().positive().describe('TestRail case ID'),
        title: z.string().min(1).optional().describe('Test case title'),
        section_id: z.number().int().positive().optional().describe('Section ID'),
        type_id: z.number().int().positive().optional().describe('Test case type ID'),
        priority_id: z.number().int().positive().optional().describe('Priority ID'),
        refs: z.string().nullable().optional().describe('References (e.g., requirement IDs)'),
        custom: z.record(z.string(), z.unknown()).optional().describe('Custom fields (key-value pairs)'),
      },
    },
    async ({ case_id, title, section_id, type_id, priority_id, refs, custom }) => {
      logger.debug(`Update case tool called with case_id: ${case_id}`);
      try {
        const updates = {
          title,
          section_id,
          type_id,
          priority_id,
          refs,
          custom,
        };
        
        // Remove undefined values to avoid sending empty fields
        const cleanUpdates = Object.fromEntries(
          Object.entries(updates).filter(([, value]) => value !== undefined)
        );
        
        const result = await updateCase(case_id, cleanUpdates);
        logger.debug(`Update case tool completed successfully for case_id: ${case_id}`);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      } catch (err) {
        logger.error({ err }, `Update case tool failed for case_id: ${case_id}`);
        const e = err as { type?: string; status?: number; message?: string };
        let message = 'Unexpected error';
        if (e?.type === 'auth') message = 'Authentication failed: check TESTRAIL_USER/API_KEY';
        else if (e?.type === 'not_found') message = `Case ${case_id} not found`;
        else if (e?.type === 'rate_limited') message = 'Rate limited by TestRail; try again later';
        else if (e?.type === 'server') message = 'TestRail server error';
        else if (e?.type === 'network') message = 'Network error contacting TestRail';
        else if (e?.message) message = e.message;

        return {
          content: [
            { type: 'text', text: message },
          ],
          isError: true,
        };
      }
    },
  );

  logger.debug('Registering get_projects tool...');
  
  server.registerTool(
    'get_projects',
    {
      title: 'Get TestRail Projects',
      description: 'List all TestRail projects.',
      inputSchema: {}, // No parameters required
    },
    async () => {
      logger.debug('Get projects tool called');
      try {
        const result = await getProjects();
        logger.debug(`Get projects tool completed successfully. Found ${result.length} projects`);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      } catch (err) {
        logger.error({ err }, 'Get projects tool failed');
        const e = err as { type?: string; status?: number; message?: string };
        let message = 'Unexpected error';
        if (e?.type === 'auth') message = 'Authentication failed: check TESTRAIL_USER/API_KEY';
        else if (e?.type === 'rate_limited') message = 'Rate limited by TestRail; try again later';
        else if (e?.type === 'server') message = 'TestRail server error';
        else if (e?.type === 'network') message = 'Network error contacting TestRail';
        else if (e?.message) message = e.message;

        return {
          content: [
            { type: 'text', text: message },
          ],
          isError: true,
        };
      }
    },
  );

  logger.debug('Registering get_project tool...');
  
  server.registerTool(
    'get_project',
    {
      title: 'Get TestRail Project',
      description: 'Get details for a specific TestRail project by ID.',
      inputSchema: {
        project_id: z.number().int().positive().describe('TestRail project ID'),
      },
    },
    async ({ project_id }) => {
      logger.debug(`Get project tool called with project_id: ${project_id}`);
      try {
        const result = await getProject(project_id);
        logger.debug(`Get project tool completed successfully for project_id: ${project_id}`);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      } catch (err) {
        logger.error({ err }, `Get project tool failed for project_id: ${project_id}`);
        const e = err as { type?: string; status?: number; message?: string };
        let message = 'Unexpected error';
        if (e?.type === 'auth') message = 'Authentication failed: check TESTRAIL_USER/API_KEY';
        else if (e?.type === 'not_found') message = `Project ${project_id} not found`;
        else if (e?.type === 'rate_limited') message = 'Rate limited by TestRail; try again later';
        else if (e?.type === 'server') message = 'TestRail server error';
        else if (e?.type === 'network') message = 'Network error contacting TestRail';
        else if (e?.message) message = e.message;

        return {
          content: [
            { type: 'text', text: message },
          ],
          isError: true,
        };
      }
    },
  );

  logger.debug('Registering get_suites tool...');
  
  server.registerTool(
    'get_suites',
    {
      title: 'Get TestRail Suites',
      description: 'Get all test suites for a specific TestRail project by ID.',
      inputSchema: {
        project_id: z.number().int().positive().describe('TestRail project ID'),
      },
    },
    async ({ project_id }) => {
      logger.debug(`Get suites tool called with project_id: ${project_id}`);
      try {
        const result = await getSuites(project_id);
        logger.debug(`Get suites tool completed successfully for project_id: ${project_id}. Found ${result.length} suites`);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      } catch (err) {
        logger.error({ err }, `Get suites tool failed for project_id: ${project_id}`);
        const e = err as { type?: string; status?: number; message?: string };
        let message = 'Unexpected error';
        if (e?.type === 'auth') message = 'Authentication failed: check TESTRAIL_USER/API_KEY';
        else if (e?.type === 'not_found') message = `Project ${project_id} not found`;
        else if (e?.type === 'rate_limited') message = 'Rate limited by TestRail; try again later';
        else if (e?.type === 'server') message = 'TestRail server error';
        else if (e?.type === 'network') message = 'Network error contacting TestRail';
        else if (e?.message) message = e.message;

        return {
          content: [
            { type: 'text', text: message },
          ],
          isError: true,
        };
      }
    },
  );

  logger.debug('Registering get_suite tool...');
  
  server.registerTool(
    'get_suite',
    {
      title: 'Get TestRail Suite',
      description: 'Get details for a specific TestRail test suite by ID.',
      inputSchema: {
        suite_id: z.number().int().positive().describe('TestRail suite ID'),
      },
    },
    async ({ suite_id }) => {
      logger.debug(`Get suite tool called with suite_id: ${suite_id}`);
      try {
        const result = await getSuite(suite_id);
        logger.debug(`Get suite tool completed successfully for suite_id: ${suite_id}`);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      } catch (err) {
        logger.error({ err }, `Get suite tool failed for suite_id: ${suite_id}`);
        const e = err as { type?: string; status?: number; message?: string };
        let message = 'Unexpected error';
        if (e?.type === 'auth') message = 'Authentication failed: check TESTRAIL_USER/API_KEY';
        else if (e?.type === 'not_found') message = `Suite ${suite_id} not found`;
        else if (e?.type === 'rate_limited') message = 'Rate limited by TestRail; try again later';
        else if (e?.type === 'server') message = 'TestRail server error';
        else if (e?.type === 'network') message = 'Network error contacting TestRail';
        else if (e?.message) message = e.message;

        return {
          content: [
            { type: 'text', text: message },
          ],
          isError: true,
        };
      }
    },
  );

  logger.debug('Registering get_cases tool...');
  
  server.registerTool(
    'get_cases',
    {
      title: 'Get TestRail Cases',
      description: 'Get a list of test cases for a project or specific test suite with optional filtering and pagination.',
      inputSchema: {
        project_id: z.number().int().positive().describe('TestRail project ID'),
        suite_id: z.number().int().positive().optional().describe('TestRail suite ID (optional if project is in single suite mode)'),
        created_after: z.number().int().optional().describe('Only return test cases created after this date (as UNIX timestamp)'),
        created_before: z.number().int().optional().describe('Only return test cases created before this date (as UNIX timestamp)'),
        created_by: z.array(z.number().int().positive()).optional().describe('A list of creator user IDs to filter by'),
        filter: z.string().optional().describe('Only return cases with matching filter string in the case title'),
        limit: z.number().int().positive().max(250).optional().describe('The number of test cases to return (max 250, default 250)'),
        milestone_id: z.array(z.number().int().positive()).optional().describe('A list of milestone IDs to filter by'),
        offset: z.number().int().min(0).optional().describe('Where to start counting the test cases from (pagination offset)'),
        priority_id: z.array(z.number().int().positive()).optional().describe('A list of priority IDs to filter by'),
        refs: z.string().optional().describe('A single Reference ID (e.g. TR-1, 4291, etc.)'),
        section_id: z.number().int().positive().optional().describe('The ID of a test case section'),
        template_id: z.array(z.number().int().positive()).optional().describe('A list of template IDs to filter by'),
        type_id: z.array(z.number().int().positive()).optional().describe('A list of case type IDs to filter by'),
        updated_after: z.number().int().optional().describe('Only return test cases updated after this date (as UNIX timestamp)'),
        updated_before: z.number().int().optional().describe('Only return test cases updated before this date (as UNIX timestamp)'),
        updated_by: z.number().int().positive().optional().describe('A user ID who updated test cases to filter by'),
        label_id: z.array(z.number().int().positive()).optional().describe('A list of label IDs to filter by'),
      },
    },
    async ({ 
      project_id, 
      suite_id, 
      created_after, 
      created_before, 
      created_by, 
      filter, 
      limit, 
      milestone_id, 
      offset, 
      priority_id, 
      refs, 
      section_id, 
      template_id, 
      type_id, 
      updated_after, 
      updated_before, 
      updated_by, 
      label_id 
    }) => {
      logger.debug(`Get cases tool called with project_id: ${project_id}, suite_id: ${suite_id}`);
      try {
        const filters = {
          project_id,
          ...(suite_id !== undefined && { suite_id }),
          ...(created_after !== undefined && { created_after }),
          ...(created_before !== undefined && { created_before }),
          ...(created_by !== undefined && { created_by }),
          ...(filter !== undefined && { filter }),
          ...(limit !== undefined && { limit }),
          ...(milestone_id !== undefined && { milestone_id }),
          ...(offset !== undefined && { offset }),
          ...(priority_id !== undefined && { priority_id }),
          ...(refs !== undefined && { refs }),
          ...(section_id !== undefined && { section_id }),
          ...(template_id !== undefined && { template_id }),
          ...(type_id !== undefined && { type_id }),
          ...(updated_after !== undefined && { updated_after }),
          ...(updated_before !== undefined && { updated_before }),
          ...(updated_by !== undefined && { updated_by }),
          ...(label_id !== undefined && { label_id }),
        };
        
        const result = await getCases(filters);
        logger.debug(`Get cases tool completed successfully for project_id: ${project_id}. Found ${result.cases.length} cases (total: ${result.size})`);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      } catch (err) {
        logger.error({ err }, `Get cases tool failed for project_id: ${project_id}`);
        const e = err as { type?: string; status?: number; message?: string };
        let message = 'Unexpected error';
        if (e?.type === 'auth') message = 'Authentication failed: check TESTRAIL_USER/API_KEY';
        else if (e?.type === 'not_found') message = `Project ${project_id} or suite ${suite_id} not found`;
        else if (e?.type === 'rate_limited') message = 'Rate limited by TestRail; try again later';
        else if (e?.type === 'server') message = 'TestRail server error';
        else if (e?.type === 'network') message = 'Network error contacting TestRail';
        else if (e?.message) message = e.message;

        return {
          content: [
            { type: 'text', text: message },
          ],
          isError: true,
        };
      }
    },
  );

  logger.debug('Registering add_attachment_to_case tool...');
  
  server.registerTool(
    'add_attachment_to_case',
    {
      title: 'Add Attachment to TestRail Case',
      description: 'Upload a file attachment to a TestRail test case.',
      inputSchema: {
        case_id: z.number().int().positive().describe('TestRail case ID'),
        file_path: z.string().min(1).describe('Path to the file to upload as attachment'),
      },
    },
    async ({ case_id, file_path }) => {
      logger.debug(`Add attachment tool called with case_id: ${case_id}, file_path: ${file_path}`);
      try {
        const result = await addAttachmentToCase(case_id, file_path);
        logger.debug(`Add attachment tool completed successfully for case_id: ${case_id}, attachment_id: ${result.attachment_id}`);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      } catch (err) {
        logger.error({ err }, `Add attachment tool failed for case_id: ${case_id}, file_path: ${file_path}`);
        const e = err as { type?: string; status?: number; message?: string };
        let message = 'Unexpected error';
        if (e?.type === 'auth') message = 'Authentication failed: check TESTRAIL_USER/API_KEY';
        else if (e?.type === 'not_found') message = `Case ${case_id} not found`;
        else if (e?.type === 'rate_limited') message = 'Rate limited by TestRail; try again later';
        else if (e?.type === 'server') message = 'TestRail server error';
        else if (e?.type === 'network') message = 'Network error contacting TestRail';
        else if (e?.message) message = e.message;

        return {
          content: [
            { type: 'text', text: message },
          ],
          isError: true,
        };
      }
    },
  );

  logger.debug('Registering get_sections tool...');
  
  server.registerTool(
    'get_sections',
    {
      title: 'Get TestRail Sections',
      description: 'Get a list of sections for a project and test suite with optional pagination.',
      inputSchema: {
        project_id: z.number().int().positive().describe('TestRail project ID'),
        suite_id: z.number().int().positive().optional().describe('TestRail suite ID (optional if project is in single suite mode)'),
        limit: z.number().int().positive().optional().describe('The number of sections to return (max 250, default 250)'),
        offset: z.number().int().min(0).optional().describe('Where to start counting the sections from (pagination offset)'),
      },
    },
    async ({ project_id, suite_id, limit, offset }) => {
      logger.debug(`Get sections tool called with project_id: ${project_id}, suite_id: ${suite_id}`);
      try {
        const filters = {
          project_id,
          ...(suite_id !== undefined && { suite_id }),
          ...(limit !== undefined && { limit }),
          ...(offset !== undefined && { offset }),
        };
        
        const result = await getSections(filters);
        logger.debug(`Get sections tool completed successfully for project_id: ${project_id}. Found ${result.sections.length} sections (total: ${result.size})`);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      } catch (err) {
        logger.error({ err }, `Get sections tool failed for project_id: ${project_id}`);
        const e = err as { type?: string; status?: number; message?: string };
        let message = 'Unexpected error';
        if (e?.type === 'auth') message = 'Authentication failed: check TESTRAIL_USER/API_KEY';
        else if (e?.type === 'not_found') message = `Project ${project_id} or suite ${suite_id} not found`;
        else if (e?.type === 'rate_limited') message = 'Rate limited by TestRail; try again later';
        else if (e?.type === 'server') message = 'TestRail server error';
        else if (e?.type === 'network') message = 'Network error contacting TestRail';
        else if (e?.message) message = e.message;

        return {
          content: [
            { type: 'text', text: message },
          ],
          isError: true,
        };
      }
    },
  );

  logger.debug('Registering get_runs tool...');
  
  server.registerTool(
    'get_runs',
    {
      title: 'Get TestRail Runs',
      description: 'Get a list of test runs for a project with optional filtering and pagination. Only returns test runs that are not part of a test plan.',
      inputSchema: {
        project_id: z.number().int().positive().describe('TestRail project ID'),
        created_after: z.number().int().optional().describe('Only return test runs created after this date (as UNIX timestamp)'),
        created_before: z.number().int().optional().describe('Only return test runs created before this date (as UNIX timestamp)'),
        created_by: z.array(z.number().int().positive()).optional().describe('A comma-separated list of creators (user IDs) to filter by'),
        is_completed: z.boolean().optional().describe('1 to return completed test runs only. 0 to return active test runs only'),
        limit: z.number().int().positive().optional().describe('The number of test runs to return (max 250, default 250)'),
        milestone_id: z.array(z.number().int().positive()).optional().describe('A comma-separated list of milestone IDs to filter by'),
        offset: z.number().int().min(0).optional().describe('Where to start counting the test runs from (pagination offset)'),
        refs_filter: z.string().optional().describe('A single Reference ID (e.g. TR-a, 4291, etc.)'),
        suite_id: z.array(z.number().int().positive()).optional().describe('A comma-separated list of test suite IDs to filter by'),
      },
    },
    async ({ project_id, created_after, created_before, created_by, is_completed, limit, milestone_id, offset, refs_filter, suite_id }) => {
      logger.debug(`Get runs tool called with project_id: ${project_id}`);
      
      const filters = {
        project_id,
        created_after,
        created_before,
        created_by,
        is_completed,
        limit,
        milestone_id,
        offset,
        refs_filter,
        suite_id,
      };

      const result = await getRuns(filters);
      logger.debug(`Get runs tool completed. Found ${result.runs.length} runs.`);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    },
  );

  logger.debug('Registering get_run tool...');
  
  server.registerTool(
    'get_run',
    {
      title: 'Get TestRail Run',
      description: 'Returns an existing test run. Please see get tests for the list of included tests in this run.',
      inputSchema: {
        run_id: z.number().int().positive().describe('The ID of the test run'),
      },
    },
    async ({ run_id }) => {
      logger.debug(`Get run tool called with run_id: ${run_id}`);
      const result = await getRun(run_id);
      logger.debug(`Get run tool completed. Retrieved run: ${result.name}`);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    },
  );

  logger.debug('Registering update_run tool...');
  
  server.registerTool(
    'update_run',
    {
      title: 'Update TestRail Run',
      description: 'Updates an existing test run. Partial updates are supported.',
      inputSchema: {
        run_id: z.number().int().positive().describe('The ID of the test run to be updated'),
        name: z.string().min(1).optional().describe('The name of the test run'),
        description: z.string().optional().describe('The description of the test run'),
        milestone_id: z.number().int().positive().optional().describe('The ID of the milestone'),
        include_all: z.boolean().optional().describe('True for including all test cases and false for a custom case selection'),
        case_ids: z.array(z.number().int().positive()).optional().describe('An array of case IDs for the custom case selection'),
        config: z.string().optional().describe('A comma-separated list of configuration IDs'),
        config_ids: z.array(z.number().int().positive()).optional().describe('An array of configuration IDs'),
        refs: z.string().optional().describe('A string of external requirements'),
        start_on: z.number().int().optional().describe('The start date (Unix timestamp)'),
        due_on: z.number().int().optional().describe('The due date (Unix timestamp)'),
        custom: z.record(z.string(), z.unknown()).optional().describe('Custom fields (key-value pairs)'),
      },
    },
    async ({ run_id, name, description, milestone_id, include_all, case_ids, config, config_ids, refs, start_on, due_on, custom }) => {
      logger.debug(`Update run tool called with run_id: ${run_id}`);
      try {
        const updates = {
          name,
          description,
          milestone_id,
          include_all,
          case_ids,
          config,
          config_ids,
          refs,
          start_on,
          due_on,
          custom,
        };
        
        // Remove undefined values to avoid sending empty fields
        const cleanUpdates = Object.fromEntries(
          Object.entries(updates).filter(([, value]) => value !== undefined)
        );
        
        const result = await updateRun(run_id, cleanUpdates);
        logger.debug(`Update run tool completed successfully for run_id: ${run_id}`);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      } catch (err) {
        logger.error({ err }, `Update run tool failed for run_id: ${run_id}`);
        const e = err as { type?: string; status?: number; message?: string };
        let message = 'Unexpected error';
        if (e?.type === 'auth') message = 'Authentication failed: check TESTRAIL_USER/API_KEY';
        else if (e?.type === 'not_found') message = `Run ${run_id} not found`;
        else if (e?.type === 'rate_limited') message = 'Rate limited by TestRail; try again later';
        else if (e?.type === 'server') message = 'TestRail server error';
        else if (e?.type === 'network') message = 'Network error contacting TestRail';
        else if (e?.message) message = e.message;

        return {
          content: [
            { type: 'text', text: message },
          ],
          isError: true,
        };
      }
    },
  );

  logger.debug('Registering get_tests tool...');
  
  server.registerTool(
    'get_tests',
    {
      title: 'Get TestRail Tests',
      description: 'Returns a list of tests for a test run.',
      inputSchema: {
        run_id: z.number().int().positive().describe('The ID of the test run'),
        status_id: z.array(z.number().int().positive()).optional().describe('A comma-separated list of status IDs to filter by'),
        limit: z.number().int().positive().optional().describe('The number that sets the limit of tests to be shown on the response (max 250, default 250)'),
        offset: z.number().int().min(0).optional().describe('The number that sets the position where the response should start from (pagination offset)'),
        label_id: z.array(z.number().int().positive()).optional().describe('IDs of labels as comma separated values to filter by'),
      },
    },
    async ({ run_id, status_id, limit, offset, label_id }) => {
      logger.debug(`Get tests tool called with run_id: ${run_id}`);
      const filters = {
        run_id,
        status_id,
        limit,
        offset,
        label_id,
      };
      const result = await getTests(filters);
      logger.debug(`Get tests tool completed. Found ${result.tests.length} tests.`);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    },
  );

  logger.debug('Registering get_test tool...');
  
  server.registerTool(
    'get_test',
    {
      title: 'Get TestRail Test',
      description: 'Returns an existing test.',
      inputSchema: {
        test_id: z.number().int().positive().describe('The ID of the test'),
        with_data: z.string().optional().describe('The parameter to get data'),
      },
    },
    async ({ test_id, with_data }) => {
      logger.debug(`Get test tool called with test_id: ${test_id}`);
      const filters = {
        test_id,
        with_data,
      };
      const result = await getTest(filters);
      logger.debug(`Get test tool completed. Retrieved test: ${result.title}`);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    },
  );

  logger.debug('Registering update_test tool...');
  
  server.registerTool(
    'update_test',
    {
      title: 'Update TestRail Test',
      description: 'Updates the labels assigned to an existing test.',
      inputSchema: {
        test_id: z.number().int().positive().describe('The ID of the test to be updated'),
        labels: z.array(z.union([z.number().int().positive(), z.string()])).optional().describe('The ID of a label, the title of a label or both, in array form'),
        custom: z.record(z.string(), z.unknown()).optional().describe('Custom fields (key-value pairs)'),
      },
    },
    async ({ test_id, labels, custom }) => {
      logger.debug(`Update test tool called with test_id: ${test_id}`);
      try {
        const updates = {
          labels,
          custom,
        };
        
        // Remove undefined values to avoid sending empty fields
        const cleanUpdates = Object.fromEntries(
          Object.entries(updates).filter(([, value]) => value !== undefined)
        );
        
        const result = await updateTest(test_id, cleanUpdates);
        logger.debug(`Update test tool completed successfully for test_id: ${test_id}`);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      } catch (err) {
        logger.error({ err }, `Update test tool failed for test_id: ${test_id}`);
        const e = err as { type?: string; status?: number; message?: string };
        let message = 'Unexpected error';
        if (e?.type === 'auth') message = 'Authentication failed: check TESTRAIL_USER/API_KEY';
        else if (e?.type === 'not_found') message = `Test ${test_id} not found`;
        else if (e?.type === 'rate_limited') message = 'Rate limited by TestRail; try again later';
        else if (e?.type === 'server') message = 'TestRail server error';
        else if (e?.type === 'network') message = 'Network error contacting TestRail';
        else if (e?.message) message = e.message;

        return {
          content: [
            { type: 'text', text: message },
          ],
          isError: true,
        };
      }
    },
  );

  logger.debug('Registering add_result tool...');
  
  server.registerTool(
    'add_result',
    {
      title: 'Add TestRail Result',
      description: 'Adds a new test result, comment, or assigns a test.',
      inputSchema: {
        test_id: z.number().int().positive().describe('The ID of the test to which the result should be added'),
        status_id: z.number().int().positive().describe('The ID of the test status (1=Passed, 2=Blocked, 4=Retest, 5=Failed)'),
        comment: z.string().optional().describe('The comment or description for the test result'),
        version: z.string().optional().describe('The version or build against which the test was executed'),
        elapsed: z.string().optional().describe('The time it took to execute the test (e.g., "30s" or "1m 45s")'),
        defects: z.string().optional().describe('A comma-separated list of defects to link to the test result'),
        assignedto_id: z.number().int().positive().optional().describe('The ID of a user to whom the test should be assigned'),
        custom_step_results: z.array(z.object({
          content: z.string().describe('The test step content'),
          expected: z.string().describe('The expected result for the step'),
          actual: z.string().describe('The actual result for the step'),
          status_id: z.number().int().positive().describe('The status ID for the step (1=Passed, 2=Blocked, 4=Retest, 5=Failed)')
        })).optional().describe('Array of step results for structured testing'),
        custom: z.record(z.unknown()).optional().describe('Custom fields with custom_ prefix'),
      },
    },
    async ({ test_id, status_id, comment, version, elapsed, defects, assignedto_id, custom_step_results, custom }) => {
      logger.debug(`Add result tool called with test_id: ${test_id}, status_id: ${status_id}`);
      const filters = {
        test_id,
        status_id,
        comment,
        version,
        elapsed,
        defects,
        assignedto_id,
        custom_step_results,
        custom,
      };
      const result = await addResult(filters);
      logger.debug(`Add result tool completed. Result ID: ${result.id}`);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    },
  );

  logger.debug('Registering get_case_fields tool...');
  
  server.registerTool(
    'get_case_fields',
    {
      title: 'Get TestRail Case Fields',
      description: 'Returns a list of available test case custom fields.',
      inputSchema: {},
    },
    async () => {
      logger.debug('Get case fields tool called');
      try {
        const result = await getCaseFields();
        logger.debug(`Get case fields tool completed successfully. Found ${result.length} fields`);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      } catch (err) {
        logger.error({ err }, 'Get case fields tool failed');
        const e = err as { type?: string; status?: number; message?: string };
        let message = 'Unexpected error';
        if (e?.type === 'auth') message = 'Authentication failed: check TESTRAIL_USER/API_KEY';
        else if (e?.type === 'rate_limited') message = 'Rate limited by TestRail; try again later';
        else if (e?.type === 'server') message = 'TestRail server error';
        else if (e?.type === 'network') message = 'Network error contacting TestRail';
        else if (e?.message) message = e.message;

        return {
          content: [
            { type: 'text', text: message },
          ],
          isError: true,
        };
      }
    },
  );

  logger.debug('Creating stdio transport...');
  const transport = new StdioServerTransport();
  
  logger.debug('Connecting to transport...');
  await server.connect(transport);
  
  logger.info('MCP server connected and ready!');
}

main().catch((error: unknown) => {
  const err = error as Error;
  logger.error({ err }, 'Failed to start MCP server');
  process.exit(1);
});

process.on('exit', (code) => {
  logger.info(`MCP server exiting with code: ${code}`);
});

process.on('SIGINT', () => {
  logger.info('MCP server received SIGINT, shutting down...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  logger.info('MCP server received SIGTERM, shutting down...');
  process.exit(0);
});


