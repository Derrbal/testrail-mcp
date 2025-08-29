#!/usr/bin/env node

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { getCase, updateCase, getProjects, getProject, getSuites, getSuite, getCases, addAttachmentToCase, getSections, getRuns, getRun, getTests, getTest, updateTest, updateRun, addResult, getCaseFields } from './services/testrailService';

async function main(): Promise<void> {
  console.log('Starting TestRail MCP server...');
  
  const server = new McpServer({
    name: 'testrail-mcp',
    version: '0.1.0',
  });

  console.log('Registering get_case tool...');
  
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
      console.log(`Tool called with case_id: ${case_id}`);
      try {
        const result = await getCase(case_id);
        console.log(`Tool completed successfully for case_id: ${case_id}`);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      } catch (err) {
        console.log(`Tool failed for case_id: ${case_id}`, err);
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

  console.log('Registering update_case tool...');
  
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
      console.log(`Update case tool called with case_id: ${case_id}`);
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
        console.log(`Update case tool completed successfully for case_id: ${case_id}`);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      } catch (err) {
        console.log(`Update case tool failed for case_id: ${case_id}`, err);
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

  console.log('Registering get_projects tool...');
  
  server.registerTool(
    'get_projects',
    {
      title: 'Get TestRail Projects',
      description: 'List all TestRail projects.',
      inputSchema: {}, // No parameters required
    },
    async () => {
      console.log('Get projects tool called');
      try {
        const result = await getProjects();
        console.log(`Get projects tool completed successfully. Found ${result.length} projects`);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      } catch (err) {
        console.log('Get projects tool failed', err);
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

  console.log('Registering get_project tool...');
  
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
      console.log(`Get project tool called with project_id: ${project_id}`);
      try {
        const result = await getProject(project_id);
        console.log(`Get project tool completed successfully for project_id: ${project_id}`);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      } catch (err) {
        console.log(`Get project tool failed for project_id: ${project_id}`, err);
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

  console.log('Registering get_suites tool...');
  
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
      console.log(`Get suites tool called with project_id: ${project_id}`);
      try {
        const result = await getSuites(project_id);
        console.log(`Get suites tool completed successfully for project_id: ${project_id}. Found ${result.length} suites`);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      } catch (err) {
        console.log(`Get suites tool failed for project_id: ${project_id}`, err);
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

  console.log('Registering get_suite tool...');
  
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
      console.log(`Get suite tool called with suite_id: ${suite_id}`);
      try {
        const result = await getSuite(suite_id);
        console.log(`Get suite tool completed successfully for suite_id: ${suite_id}`);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      } catch (err) {
        console.log(`Get suite tool failed for suite_id: ${suite_id}`, err);
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

  console.log('Registering get_cases tool...');
  
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
      console.log(`Get cases tool called with project_id: ${project_id}, suite_id: ${suite_id}`);
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
        console.log(`Get cases tool completed successfully for project_id: ${project_id}. Found ${result.cases.length} cases (total: ${result.size})`);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      } catch (err) {
        console.log(`Get cases tool failed for project_id: ${project_id}`, err);
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

  console.log('Registering add_attachment_to_case tool...');
  
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
      console.log(`Add attachment tool called with case_id: ${case_id}, file_path: ${file_path}`);
      try {
        const result = await addAttachmentToCase(case_id, file_path);
        console.log(`Add attachment tool completed successfully for case_id: ${case_id}, attachment_id: ${result.attachment_id}`);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      } catch (err) {
        console.log(`Add attachment tool failed for case_id: ${case_id}, file_path: ${file_path}`, err);
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

  console.log('Registering get_sections tool...');
  
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
      console.log(`Get sections tool called with project_id: ${project_id}, suite_id: ${suite_id}`);
      try {
        const filters = {
          project_id,
          ...(suite_id !== undefined && { suite_id }),
          ...(limit !== undefined && { limit }),
          ...(offset !== undefined && { offset }),
        };
        
        const result = await getSections(filters);
        console.log(`Get sections tool completed successfully for project_id: ${project_id}. Found ${result.sections.length} sections (total: ${result.size})`);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      } catch (err) {
        console.log(`Get sections tool failed for project_id: ${project_id}`, err);
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

  console.log('Registering get_runs tool...');
  
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
      console.log(`Get runs tool called with project_id: ${project_id}`);
      
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
      console.log(`Get runs tool completed. Found ${result.runs.length} runs.`);
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

  console.log('Registering get_run tool...');
  
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
      console.log(`Get run tool called with run_id: ${run_id}`);
      const result = await getRun(run_id);
      console.log(`Get run tool completed. Retrieved run: ${result.name}`);
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

  console.log('Registering update_run tool...');
  
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
      console.log(`Update run tool called with run_id: ${run_id}`);
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
        console.log(`Update run tool completed successfully for run_id: ${run_id}`);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      } catch (err) {
        console.log(`Update run tool failed for run_id: ${run_id}`, err);
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

  console.log('Registering get_tests tool...');
  
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
      console.log(`Get tests tool called with run_id: ${run_id}`);
      const filters = {
        run_id,
        status_id,
        limit,
        offset,
        label_id,
      };
      const result = await getTests(filters);
      console.log(`Get tests tool completed. Found ${result.tests.length} tests.`);
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

  console.log('Registering get_test tool...');
  
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
      console.log(`Get test tool called with test_id: ${test_id}`);
      const filters = {
        test_id,
        with_data,
      };
      const result = await getTest(filters);
      console.log(`Get test tool completed. Retrieved test: ${result.title}`);
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

  console.log('Registering update_test tool...');
  
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
      console.log(`Update test tool called with test_id: ${test_id}`);
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
        console.log(`Update test tool completed successfully for test_id: ${test_id}`);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      } catch (err) {
        console.log(`Update test tool failed for test_id: ${test_id}`, err);
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

  console.log('Registering add_result tool...');
  
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
      console.log(`Add result tool called with test_id: ${test_id}, status_id: ${status_id}`);
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
      console.log(`Add result tool completed. Result ID: ${result.id}`);
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

  console.log('Registering get_case_fields tool...');
  
  server.registerTool(
    'get_case_fields',
    {
      title: 'Get TestRail Case Fields',
      description: 'Returns a list of available test case custom fields.',
      inputSchema: {},
    },
    async () => {
      console.log('Get case fields tool called');
      try {
        const result = await getCaseFields();
        console.log(`Get case fields tool completed successfully. Found ${result.length} fields`);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      } catch (err) {
        console.log('Get case fields tool failed', err);
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

  console.log('Creating stdio transport...');
  const transport = new StdioServerTransport();
  
  console.log('Connecting to transport...');
  await server.connect(transport);
  
  console.log('MCP server connected and ready!');
}

main().catch((error: unknown) => {
  const err = error as Error;
  console.error('Failed to start MCP server:', err.message);
  console.error('Stack trace:', err.stack);
  process.exit(1);
});

process.on('exit', (code) => {
  console.log(`MCP server exiting with code: ${code}`);
});

process.on('SIGINT', () => {
  console.log('MCP server received SIGINT, shutting down...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('MCP server received SIGTERM, shutting down...');
  process.exit(0);
});


