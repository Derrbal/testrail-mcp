import { 
  testRailClient, 
  TestRailCaseDto, 
  TestRailCaseUpdateDto, 
  TestRailCaseCreateDto,
  TestRailProjectDto, 
  TestRailSuiteDto, 
  TestRailCasesResponse, 
  TestRailAttachmentResponse, 
  TestRailSectionDto, 
  TestRailSectionsResponse, 
  TestRailRunDto, 
  TestRailRunsResponse, 
  TestRailRunDetailDto, 
  TestRailRunUpdateDto,
  TestRailTestDto, 
  TestRailTestsResponse, 
  TestRailTestDetailDto, 
  TestRailTestUpdateDto,
  TestRailStepResultDto,
  TestRailResultDto,
  TestRailCaseFieldDto,
  GetCasesParams, 
  GetSectionsParams, 
  GetRunsParams, 
  GetTestsParams,
  GetTestParams,
  AddResultParams
} from '../clients/testrailClient';

export interface CaseSummary {
  id: number;
  title: string;
  section_id?: number;
  type_id?: number;
  priority_id?: number;
  refs?: string | null;
  created_on?: number;
  updated_on?: number;
  custom?: Record<string, unknown> | undefined;
}

export interface CaseUpdatePayload {
  title?: string;
  section_id?: number;
  type_id?: number;
  priority_id?: number;
  refs?: string | null;
  custom?: Record<string, unknown>;
}

export interface CaseCreatePayload {
  title: string;
  section_id: number;
  type_id?: number;
  priority_id?: number;
  refs?: string | null;
  custom?: Record<string, unknown>;
}

export interface TestUpdatePayload {
  labels?: Array<number | string>;
  custom?: Record<string, unknown>;
}

export interface RunUpdatePayload {
  name?: string;
  description?: string;
  milestone_id?: number;
  include_all?: boolean;
  case_ids?: number[];
  config?: string;
  config_ids?: number[];
  refs?: string;
  start_on?: number;
  due_on?: number;
  custom?: Record<string, unknown>;
}

export interface ProjectSummary {
  id: number;
  name: string;
  announcement?: string;
  show_announcement?: boolean;
  is_completed: boolean;
  completed_on?: number | null;
  suite_mode: number;
  url: string;
  created_on?: number;
  created_by?: number;
  custom?: Record<string, unknown> | undefined;
}

export interface SuiteSummary {
  id: number;
  name: string;
  description?: string;
  project_id: number;
  url: string;
  is_baseline?: boolean;
  is_master?: boolean;
  is_completed?: boolean;
  completed_on?: number | null;
  created_on?: number;
  created_by?: number;
  updated_on?: number;
  updated_by?: number;
  custom?: Record<string, unknown> | undefined;
}

export interface CasesResponse {
  offset?: number;
  limit?: number;
  size?: number;
  _links?: {
    next: string | null;
    prev: string | null;
  };
  cases: CaseSummary[];
}

export interface GetCasesFilters {
  project_id: number;
  suite_id?: number;
  created_after?: number;
  created_before?: number;
  created_by?: number[];
  filter?: string;
  limit?: number;
  milestone_id?: number[];
  offset?: number;
  priority_id?: number[];
  refs?: string;
  section_id?: number;
  template_id?: number[];
  type_id?: number[];
  updated_after?: number;
  updated_before?: number;
  updated_by?: number;
  label_id?: number[];
}

export interface AttachmentResponse {
  attachment_id: number;
}

export interface SectionSummary {
  depth: number;
  display_order: number;
  id: number;
  name: string;
  parent_id: number | null;
  suite_id: number;
  custom?: Record<string, unknown> | undefined;
}

export interface SectionsResponse {
  offset?: number;
  limit?: number;
  size?: number;
  _links?: {
    next: string | null;
    prev: string | null;
  };
  sections: SectionSummary[];
}

export interface GetSectionsFilters {
  project_id: number;
  suite_id?: number;
  limit?: number;
  offset?: number;
}

export interface RunSummary {
  id: number;
  name: string;
  custom?: Record<string, unknown> | undefined;
}

export interface RunsResponse {
  offset?: number;
  limit?: number;
  size?: number;
  _links?: {
    next: string | null;
    prev: string | null;
  };
  runs: RunSummary[];
}

export interface GetRunsFilters {
  project_id: number;
  created_after?: number;
  created_before?: number;
  created_by?: number[];
  is_completed?: boolean;
  limit?: number;
  milestone_id?: number[];
  offset?: number;
  refs_filter?: string;
  suite_id?: number[];
}

export interface TestSummary {
  id: number;
  title: string;
  custom?: Record<string, unknown> | undefined;
}

export interface TestsResponse {
  offset?: number;
  limit?: number;
  size?: number;
  _links?: {
    next: string | null;
    prev: string | null;
  };
  tests: TestSummary[];
}

export interface GetTestsFilters {
  run_id: number;
  status_id?: number[];
  limit?: number;
  offset?: number;
  label_id?: number[];
}

export interface TestDetailSummary {
  id: number;
  title: string;
  assignedto_id: number;
  case_id: number;
  custom_expected?: string;
  custom_preconds?: string;
  custom_steps_separated?: Array<{
    content: string;
    expected: string;
  }>;
  estimate?: string;
  estimate_forecast?: string;
  priority_id: number;
  run_id: number;
  status_id: number;
  type_id: number;
  milestone_id?: number;
  refs?: string;
  labels?: Array<{
    id: number;
    title: string;
  }>;
  custom?: Record<string, unknown> | undefined;
}

export interface GetTestFilters {
  test_id: number;
  with_data?: string;
}

export interface RunDetailSummary {
  id: number;
  name: string;
  description?: string;
  suite_id: number;
  milestone_id?: number;
  assignedto_id?: number;
  include_all: boolean;
  is_completed: boolean;
  completed_on?: number;
  config?: string;
  config_ids: number[];
  passed_count: number;
  blocked_count: number;
  untested_count: number;
  retest_count: number;
  failed_count: number;
  custom_status1_count: number;
  custom_status2_count: number;
  custom_status3_count: number;
  custom_status4_count: number;
  custom_status5_count: number;
  custom_status6_count: number;
  custom_status7_count: number;
  project_id: number;
  plan_id?: number;
  created_on: number;
  updated_on?: number;
  refs?: string;
  start_on?: number;
  due_on?: number;
  url: string;
  custom?: Record<string, unknown> | undefined;
}

export async function getCase(caseId: number): Promise<CaseSummary> {
  const data: TestRailCaseDto = await testRailClient.getCase(caseId);
  const {
    id,
    title,
    section_id,
    type_id,
    priority_id,
    refs,
    created_on,
    updated_on,
    ...rest
  } = data;

  const custom: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(rest)) {
    if (key.startsWith('custom_')) custom[key] = value;
  }

  return {
    id,
    title,
    section_id,
    type_id,
    priority_id,
    refs: refs ?? null,
    created_on,
    updated_on,
    custom: Object.keys(custom).length ? custom : undefined,
  };
}

export async function addCase(payload: CaseCreatePayload): Promise<CaseSummary> {
  // Transform the payload to match TestRail API format
  const createPayload: TestRailCaseCreateDto = {
    title: payload.title,
    section_id: payload.section_id,
    type_id: payload.type_id,
    priority_id: payload.priority_id,
    refs: payload.refs,
  };

  // Add custom fields with proper naming convention
  if (payload.custom) {
    for (const [key, value] of Object.entries(payload.custom)) {
      // Ensure custom field keys have the 'custom_' prefix
      const fieldKey = key.startsWith('custom_') ? key : `custom_${key}`;
      createPayload[fieldKey] = value;
    }
  }

  const data: TestRailCaseDto = await testRailClient.addCase(payload.section_id, createPayload);
  
  // Normalize the response using the same logic as getCase
  const {
    id,
    title,
    section_id,
    type_id,
    priority_id,
    refs,
    created_on,
    updated_on,
    ...rest
  } = data;

  const custom: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(rest)) {
    if (key.startsWith('custom_')) custom[key] = value;
  }

  return {
    id,
    title,
    section_id,
    type_id,
    priority_id,
    refs: refs ?? null,
    created_on,
    updated_on,
    custom: Object.keys(custom).length ? custom : undefined,
  };
}

export async function updateCase(caseId: number, updates: CaseUpdatePayload): Promise<CaseSummary> {
  // Transform the payload to match TestRail API format
  const updatePayload: TestRailCaseUpdateDto = {
    title: updates.title,
    section_id: updates.section_id,
    type_id: updates.type_id,
    priority_id: updates.priority_id,
    refs: updates.refs,
  };

  // Add custom fields with proper naming convention
  if (updates.custom) {
    for (const [key, value] of Object.entries(updates.custom)) {
      // Ensure custom field keys have the 'custom_' prefix
      const fieldKey = key.startsWith('custom_') ? key : `custom_${key}`;
      updatePayload[fieldKey] = value;
    }
  }

  const data: TestRailCaseDto = await testRailClient.updateCase(caseId, updatePayload);
  
  // Normalize the response using the same logic as getCase
  const {
    id,
    title,
    section_id,
    type_id,
    priority_id,
    refs,
    created_on,
    updated_on,
    ...rest
  } = data;

  const custom: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(rest)) {
    if (key.startsWith('custom_')) custom[key] = value;
  }

  return {
    id,
    title,
    section_id,
    type_id,
    priority_id,
    refs: refs ?? null,
    created_on,
    updated_on,
    custom: Object.keys(custom).length ? custom : undefined,
  };
}

export async function getProjects(): Promise<ProjectSummary[]> {
  const projects: TestRailProjectDto[] = await testRailClient.getProjects();
  
  return projects.map((project) => {
    const {
      id,
      name,
      announcement,
      show_announcement,
      is_completed,
      completed_on,
      suite_mode,
      url,
      created_on,
      created_by,
      ...rest
    } = project;

    const custom: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(rest)) {
      if (key.startsWith('custom_')) custom[key] = value;
    }

    return {
      id,
      name,
      announcement,
      show_announcement,
      is_completed,
      completed_on,
      suite_mode,
      url,
      created_on,
      created_by,
      custom: Object.keys(custom).length ? custom : undefined,
    };
  });
}

export async function getProject(projectId: number): Promise<ProjectSummary> {
  const project: TestRailProjectDto = await testRailClient.getProject(projectId);
  
  const {
    id,
    name,
    announcement,
    show_announcement,
    is_completed,
    completed_on,
    suite_mode,
    url,
    created_on,
    created_by,
    ...rest
  } = project;

  const custom: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(rest)) {
    if (key.startsWith('custom_')) custom[key] = value;
  }

  return {
    id,
    name,
    announcement,
    show_announcement,
    is_completed,
    completed_on,
    suite_mode,
    url,
    created_on,
    created_by,
    custom: Object.keys(custom).length ? custom : undefined,
  };
}

export async function getSuite(suiteId: number): Promise<SuiteSummary> {
  const suite: TestRailSuiteDto = await testRailClient.getSuite(suiteId);
  
  const {
    id,
    name,
    description,
    project_id,
    url,
    is_baseline,
    is_master,
    is_completed,
    completed_on,
    created_on,
    created_by,
    updated_on,
    updated_by,
    ...rest
  } = suite;

  const custom: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(rest)) {
    if (key.startsWith('custom_')) custom[key] = value;
  }

  return {
    id,
    name,
    description,
    project_id,
    url,
    is_baseline,
    is_master,
    is_completed,
    completed_on,
    created_on,
    created_by,
    updated_on,
    updated_by,
    custom: Object.keys(custom).length ? custom : undefined,
  };
}

export async function getSuites(projectId: number): Promise<SuiteSummary[]> {
  const suites: TestRailSuiteDto[] = await testRailClient.getSuites(projectId);
  
  return suites.map((suite) => {
    const {
      id,
      name,
      description,
      project_id,
      url,
      is_baseline,
      is_master,
      is_completed,
      completed_on,
      created_on,
      created_by,
      updated_on,
      updated_by,
      ...rest
    } = suite;

    const custom: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(rest)) {
      if (key.startsWith('custom_')) custom[key] = value;
    }

    return {
      id,
      name,
      description,
      project_id,
      url,
      is_baseline,
      is_master,
      is_completed,
      completed_on,
      created_on,
      created_by,
      updated_on,
      updated_by,
      custom: Object.keys(custom).length ? custom : undefined,
    };
  });
}

export async function getCases(filters: GetCasesFilters): Promise<CasesResponse> {
  // Transform service filters to client parameters
  const clientParams: GetCasesParams = {
    project_id: filters.project_id,
    suite_id: filters.suite_id,
    created_after: filters.created_after,
    created_before: filters.created_before,
    created_by: filters.created_by,
    filter: filters.filter,
    limit: filters.limit,
    milestone_id: filters.milestone_id,
    offset: filters.offset,
    priority_id: filters.priority_id,
    refs: filters.refs,
    section_id: filters.section_id,
    template_id: filters.template_id,
    type_id: filters.type_id,
    updated_after: filters.updated_after,
    updated_before: filters.updated_before,
    updated_by: filters.updated_by,
    label_id: filters.label_id,
  };

  const response: TestRailCasesResponse = await testRailClient.getCases(clientParams);
  
  // Transform each case using the same logic as getCase
  const transformedCases: CaseSummary[] = response.cases.map((caseData) => {
    const {
      id,
      title,
      section_id,
      type_id,
      priority_id,
      refs,
      created_on,
      updated_on,
      ...rest
    } = caseData;

    const custom: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(rest)) {
      if (key.startsWith('custom_')) custom[key] = value;
    }

    return {
      id,
      title,
      section_id,
      type_id,
      priority_id,
      refs: refs ?? null,
      created_on,
      updated_on,
      custom: Object.keys(custom).length ? custom : undefined,
    };
  });

  return {
    offset: response.offset,
    limit: response.limit,
    size: response.size,
    _links: response._links,
    cases: transformedCases,
  };
}

export async function addAttachmentToCase(caseId: number, filePath: string): Promise<AttachmentResponse> {
  const response: TestRailAttachmentResponse = await testRailClient.addAttachmentToCase(caseId, filePath);
  
  return {
    attachment_id: response.attachment_id,
  };
}

export async function getSections(filters: GetSectionsFilters): Promise<SectionsResponse> {
  // Transform service filters to client parameters
  const clientParams: GetSectionsParams = {
    project_id: filters.project_id,
    suite_id: filters.suite_id,
    limit: filters.limit,
    offset: filters.offset,
  };

  const response: TestRailSectionsResponse = await testRailClient.getSections(clientParams);
  
  // Transform each section using the same pattern as other entities
  const transformedSections: SectionSummary[] = response.sections.map((sectionData) => {
    const {
      depth,
      display_order,
      id,
      name,
      parent_id,
      suite_id,
      ...rest
    } = sectionData;

    const custom: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(rest)) {
      if (key.startsWith('custom_')) custom[key] = value;
    }

    return {
      depth,
      display_order,
      id,
      name,
      parent_id,
      suite_id,
      custom: Object.keys(custom).length ? custom : undefined,
    };
  });

  return {
    offset: response.offset,
    limit: response.limit,
    size: response.size,
    _links: response._links,
    sections: transformedSections,
  };
}

export async function getRuns(filters: GetRunsFilters): Promise<RunsResponse> {
  // Transform service filters to client parameters
  const clientParams: GetRunsParams = {
    project_id: filters.project_id,
    created_after: filters.created_after,
    created_before: filters.created_before,
    created_by: filters.created_by,
    is_completed: filters.is_completed,
    limit: filters.limit,
    milestone_id: filters.milestone_id,
    offset: filters.offset,
    refs_filter: filters.refs_filter,
    suite_id: filters.suite_id,
  };

  const response: TestRailRunsResponse = await testRailClient.getRuns(clientParams);

  // Transform the response to normalize custom fields
  const transformedRuns: RunSummary[] = response.runs.map((run: TestRailRunDto) => {
    const { id, name, ...customFields } = run;
    return {
      id,
      name,
      custom: Object.keys(customFields).length > 0 ? customFields : undefined,
    };
  });

  return {
    offset: response.offset,
    limit: response.limit,
    size: response.size,
    _links: response._links,
    runs: transformedRuns,
  };
}

export async function getTests(filters: GetTestsFilters): Promise<TestsResponse> {
  // Transform service filters to client parameters
  const clientParams: GetTestsParams = {
    run_id: filters.run_id,
    status_id: filters.status_id,
    limit: filters.limit,
    offset: filters.offset,
    label_id: filters.label_id,
  };

  const response: TestRailTestsResponse = await testRailClient.getTests(clientParams);
  
  // Transform tests to normalized format
  const transformedTests: TestSummary[] = response.tests.map((test) => {
    // Extract custom fields (any fields not in the standard interface)
    const standardFields = ['id', 'title'];
    const custom: Record<string, unknown> = {};
    
    Object.keys(test).forEach((key) => {
      if (!standardFields.includes(key)) {
        custom[key] = test[key];
      }
    });

    return {
      id: test.id,
      title: test.title,
      custom: Object.keys(custom).length > 0 ? custom : undefined,
    };
  });

  return {
    offset: response.offset,
    limit: response.limit,
    size: response.size,
    _links: response._links,
    tests: transformedTests,
  };
}

export async function getTest(filters: GetTestFilters): Promise<TestDetailSummary> {
  // Transform service filters to client parameters
  const clientParams: GetTestParams = {
    test_id: filters.test_id,
    with_data: filters.with_data,
  };

  const response: TestRailTestDetailDto = await testRailClient.getTest(clientParams);
  
  // Extract custom fields (any fields not in the standard interface)
  const standardFields = [
    'id', 'title', 'assignedto_id', 'case_id', 'custom_expected', 'custom_preconds',
    'custom_steps_separated', 'estimate', 'estimate_forecast', 'priority_id',
    'run_id', 'status_id', 'type_id', 'milestone_id', 'refs', 'labels'
  ];
  const custom: Record<string, unknown> = {};
  
  Object.keys(response).forEach((key) => {
    if (!standardFields.includes(key)) {
      custom[key] = response[key];
    }
  });

  return {
    id: response.id,
    title: response.title,
    assignedto_id: response.assignedto_id,
    case_id: response.case_id,
    custom_expected: response.custom_expected,
    custom_preconds: response.custom_preconds,
    custom_steps_separated: response.custom_steps_separated,
    estimate: response.estimate,
    estimate_forecast: response.estimate_forecast,
    priority_id: response.priority_id,
    run_id: response.run_id,
    status_id: response.status_id,
    type_id: response.type_id,
    milestone_id: response.milestone_id,
    refs: response.refs,
    labels: response.labels,
    custom: Object.keys(custom).length > 0 ? custom : undefined,
  };
}

export async function updateTest(testId: number, updates: TestUpdatePayload): Promise<TestDetailSummary> {
  // Transform the payload to match TestRail API format
  const updatePayload: TestRailTestUpdateDto = {
    labels: updates.labels,
  };

  // Add custom fields with proper naming convention
  if (updates.custom) {
    for (const [key, value] of Object.entries(updates.custom)) {
      // Ensure custom field keys have the 'custom_' prefix
      const fieldKey = key.startsWith('custom_') ? key : `custom_${key}`;
      updatePayload[fieldKey] = value;
    }
  }

  const data: TestRailTestDetailDto = await testRailClient.updateTest(testId, updatePayload);
  
  // Normalize the response using the same logic as getTest
  const standardFields = [
    'id', 'title', 'assignedto_id', 'case_id', 'custom_expected', 'custom_preconds',
    'custom_steps_separated', 'estimate', 'estimate_forecast', 'priority_id',
    'run_id', 'status_id', 'type_id', 'milestone_id', 'refs', 'labels'
  ];
  const custom: Record<string, unknown> = {};
  
  Object.keys(data).forEach((key) => {
    if (!standardFields.includes(key)) {
      custom[key] = data[key];
    }
  });

  return {
    id: data.id,
    title: data.title,
    assignedto_id: data.assignedto_id,
    case_id: data.case_id,
    custom_expected: data.custom_expected,
    custom_preconds: data.custom_preconds,
    custom_steps_separated: data.custom_steps_separated,
    estimate: data.estimate,
    estimate_forecast: data.estimate_forecast,
    priority_id: data.priority_id,
    run_id: data.run_id,
    status_id: data.status_id,
    type_id: data.type_id,
    milestone_id: data.milestone_id,
    refs: data.refs,
    labels: data.labels,
    custom: Object.keys(custom).length > 0 ? custom : undefined,
  };
}

export async function getRun(runId: number): Promise<RunDetailSummary> {
  const response: TestRailRunDetailDto = await testRailClient.getRun(runId);
  
  // Extract custom fields (any fields not in the standard interface)
  const standardFields = [
    'id', 'name', 'description', 'suite_id', 'milestone_id', 'assignedto_id',
    'include_all', 'is_completed', 'completed_on', 'config', 'config_ids',
    'passed_count', 'blocked_count', 'untested_count', 'retest_count',
    'failed_count', 'custom_status1_count', 'custom_status2_count',
    'custom_status3_count', 'custom_status4_count', 'custom_status5_count',
    'custom_status6_count', 'custom_status7_count', 'project_id', 'plan_id',
    'created_on', 'updated_on', 'refs', 'start_on', 'due_on', 'url'
  ];
  
  const custom: Record<string, unknown> = {};
  Object.keys(response).forEach(key => {
    if (!standardFields.includes(key)) {
      custom[key] = response[key];
    }
  });

  return {
    id: response.id,
    name: response.name,
    description: response.description,
    suite_id: response.suite_id,
    milestone_id: response.milestone_id,
    assignedto_id: response.assignedto_id,
    include_all: response.include_all,
    is_completed: response.is_completed,
    completed_on: response.completed_on,
    config: response.config,
    config_ids: response.config_ids,
    passed_count: response.passed_count,
    blocked_count: response.blocked_count,
    untested_count: response.untested_count,
    retest_count: response.retest_count,
    failed_count: response.failed_count,
    custom_status1_count: response.custom_status1_count,
    custom_status2_count: response.custom_status2_count,
    custom_status3_count: response.custom_status3_count,
    custom_status4_count: response.custom_status4_count,
    custom_status5_count: response.custom_status5_count,
    custom_status6_count: response.custom_status6_count,
    custom_status7_count: response.custom_status7_count,
    project_id: response.project_id,
    plan_id: response.plan_id,
    created_on: response.created_on,
    updated_on: response.updated_on,
    refs: response.refs,
    start_on: response.start_on,
    due_on: response.due_on,
    url: response.url,
    custom: Object.keys(custom).length > 0 ? custom : undefined,
  };
}

export async function updateRun(runId: number, updates: RunUpdatePayload): Promise<RunDetailSummary> {
  // Transform the payload to match TestRail API format
  const updatePayload: TestRailRunUpdateDto = {
    name: updates.name,
    description: updates.description,
    milestone_id: updates.milestone_id,
    include_all: updates.include_all,
    case_ids: updates.case_ids,
    config: updates.config,
    config_ids: updates.config_ids,
    refs: updates.refs,
    start_on: updates.start_on,
    due_on: updates.due_on,
  };

  // Add custom fields with proper naming convention
  if (updates.custom) {
    for (const [key, value] of Object.entries(updates.custom)) {
      // Ensure custom field keys have the 'custom_' prefix
      const fieldKey = key.startsWith('custom_') ? key : `custom_${key}`;
      updatePayload[fieldKey] = value;
    }
  }

  const data: TestRailRunDetailDto = await testRailClient.updateRun(runId, updatePayload);
  
  // Normalize the response using the same logic as getRun
  const standardFields = [
    'id', 'name', 'description', 'suite_id', 'milestone_id', 'assignedto_id',
    'include_all', 'is_completed', 'completed_on', 'config', 'config_ids',
    'passed_count', 'blocked_count', 'untested_count', 'retest_count',
    'failed_count', 'custom_status1_count', 'custom_status2_count',
    'custom_status3_count', 'custom_status4_count', 'custom_status5_count',
    'custom_status6_count', 'custom_status7_count', 'project_id', 'plan_id',
    'created_on', 'updated_on', 'refs', 'start_on', 'due_on', 'url'
  ];
  
  const custom: Record<string, unknown> = {};
  Object.keys(data).forEach(key => {
    if (!standardFields.includes(key)) {
      custom[key] = data[key];
    }
  });

  return {
    id: data.id,
    name: data.name,
    description: data.description,
    suite_id: data.suite_id,
    milestone_id: data.milestone_id,
    assignedto_id: data.assignedto_id,
    include_all: data.include_all,
    is_completed: data.is_completed,
    completed_on: data.completed_on,
    config: data.config,
    config_ids: data.config_ids,
    passed_count: data.passed_count,
    blocked_count: data.blocked_count,
    untested_count: data.untested_count,
    retest_count: data.retest_count,
    failed_count: data.failed_count,
    custom_status1_count: data.custom_status1_count,
    custom_status2_count: data.custom_status2_count,
    custom_status3_count: data.custom_status3_count,
    custom_status4_count: data.custom_status4_count,
    custom_status5_count: data.custom_status5_count,
    custom_status6_count: data.custom_status6_count,
    custom_status7_count: data.custom_status7_count,
    project_id: data.project_id,
    plan_id: data.plan_id,
    created_on: data.created_on,
    updated_on: data.updated_on,
    refs: data.refs,
    start_on: data.start_on,
    due_on: data.due_on,
    url: data.url,
    custom: Object.keys(custom).length > 0 ? custom : undefined,
  };
}

export interface StepResultSummary {
  content: string;
  expected: string;
  actual: string;
  status_id: number;
}

export interface ResultSummary {
  id: number;
  test_id: number;
  status_id: number;
  created_by: number;
  created_on: number;
  assignedto_id?: number;
  comment?: string;
  version?: string;
  elapsed?: string;
  defects?: string;
  custom_step_results?: StepResultSummary[];
  custom?: Record<string, unknown> | undefined;
}

export interface AddResultFilters {
  test_id: number;
  status_id: number;
  comment?: string;
  version?: string;
  elapsed?: string;
  defects?: string;
  assignedto_id?: number;
  custom_step_results?: StepResultSummary[];
  custom?: Record<string, unknown>;
}

export interface CaseFieldSummary {
  id: number;
  label: string;
  name: string;
  system_name: string;
  type_id: number;
  description?: string;
  display_order: number;
  configs: Array<{
    context: {
      is_global: boolean;
      project_ids: number[] | null;
    };
    id: string;
    options: {
      default_value?: string;
      format?: string;
      is_required?: boolean;
      rows?: string;
      [key: string]: unknown;
    };
  }>;
}

export async function addResult(filters: AddResultFilters): Promise<ResultSummary> {
  // Transform service filters to client parameters
  const clientParams: AddResultParams = {
    test_id: filters.test_id,
    status_id: filters.status_id,
    comment: filters.comment,
    version: filters.version,
    elapsed: filters.elapsed,
    defects: filters.defects,
    assignedto_id: filters.assignedto_id,
    custom_step_results: filters.custom_step_results,
    custom: filters.custom,
  };

  const response: TestRailResultDto = await testRailClient.addResult(clientParams);
  
  // Extract custom fields (any fields not in the standard interface)
  const standardFields = [
    'id', 'test_id', 'status_id', 'created_by', 'created_on', 'assignedto_id',
    'comment', 'version', 'elapsed', 'defects', 'custom_step_results'
  ];
  const custom: Record<string, unknown> = {};
  Object.keys(response).forEach((key) => {
    if (!standardFields.includes(key)) {
      custom[key] = response[key];
    }
  });

  return {
    id: response.id,
    test_id: response.test_id,
    status_id: response.status_id,
    created_by: response.created_by,
    created_on: response.created_on,
    assignedto_id: response.assignedto_id,
    comment: response.comment,
    version: response.version,
    elapsed: response.elapsed,
    defects: response.defects,
    custom_step_results: response.custom_step_results,
    custom: Object.keys(custom).length > 0 ? custom : undefined,
  };
}

export async function getCaseFields(): Promise<CaseFieldSummary[]> {
  const fields: TestRailCaseFieldDto[] = await testRailClient.getCaseFields();
  
  return fields.map((field) => ({
    id: field.id,
    label: field.label,
    name: field.name,
    system_name: field.system_name,
    type_id: field.type_id,
    description: field.description,
    display_order: field.display_order,
    configs: field.configs,
  }));
}


