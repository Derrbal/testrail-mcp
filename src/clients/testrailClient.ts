import axios, { AxiosError, AxiosInstance } from 'axios';
import axiosRetry from 'axios-retry';
import { config } from '../config';
import { logger } from '../logger';

export interface TestRailError {
  type: 'auth' | 'not_found' | 'rate_limited' | 'server' | 'network' | 'unknown';
  status?: number;
  message: string;
}

export interface TestRailCaseDto {
  id: number;
  title: string;
  section_id?: number;
  type_id?: number;
  priority_id?: number;
  refs?: string | null;
  created_on?: number;
  updated_on?: number;
  // Allow passthrough of unknown fields without typing them all for now
  [key: string]: unknown;
}

export interface TestRailCaseUpdateDto {
  title?: string;
  section_id?: number;
  type_id?: number;
  priority_id?: number;
  refs?: string | null;
  // Support for custom fields - any field starting with 'custom_'
  [key: string]: unknown;
}

export interface TestRailCaseCreateDto {
  title: string;
  section_id: number;
  type_id?: number;
  priority_id?: number;
  refs?: string | null;
  // Support for custom fields - any field starting with 'custom_'
  [key: string]: unknown;
}

export interface TestRailProjectDto {
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
  // Allow passthrough of unknown fields for customizations
  [key: string]: unknown;
}

export interface TestRailSuiteDto {
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
  // Allow passthrough of unknown fields for customizations
  [key: string]: unknown;
}

export interface TestRailProjectsResponse {
  offset?: number;
  limit?: number;
  size?: number;
  _links?: {
    next: string | null;
    prev: string | null;
  };
  projects: TestRailProjectDto[];
}

export interface TestRailCasesResponse {
  offset?: number;
  limit?: number;
  size?: number;
  _links?: {
    next: string | null;
    prev: string | null;
  };
  cases: TestRailCaseDto[];
}

export interface TestRailAttachmentResponse {
  attachment_id: number;
}

export interface TestRailSectionDto {
  depth: number;
  display_order: number;
  id: number;
  name: string;
  parent_id: number | null;
  suite_id: number;
  // Allow passthrough of unknown fields for customizations
  [key: string]: unknown;
}

export interface TestRailSectionsResponse {
  offset?: number;
  limit?: number;
  size?: number;
  _links?: {
    next: string | null;
    prev: string | null;
  };
  sections: TestRailSectionDto[];
}

export interface TestRailRunDto {
  id: number;
  name: string;
  // Allow passthrough of unknown fields for customizations
  [key: string]: unknown;
}

export interface TestRailRunsResponse {
  offset?: number;
  limit?: number;
  size?: number;
  _links?: {
    next: string | null;
    prev: string | null;
  };
  runs: TestRailRunDto[];
}

export interface TestRailRunDetailDto {
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
  // Allow passthrough of unknown fields for customizations
  [key: string]: unknown;
}

export interface TestRailRunUpdateDto {
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
  // Support for custom fields - any field starting with 'custom_'
  [key: string]: unknown;
}

export interface TestRailTestDto {
  id: number;
  title: string;
  // Allow passthrough of unknown fields for customizations
  [key: string]: unknown;
}

export interface TestRailTestDetailDto {
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
  // Allow passthrough of unknown fields for customizations
  [key: string]: unknown;
}

export interface TestRailStepResultDto {
  content: string;
  expected: string;
  actual: string;
  status_id: number;
}

export interface TestRailResultDto {
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
  custom_step_results?: TestRailStepResultDto[];
  // Allow passthrough of unknown fields for customizations
  [key: string]: unknown;
}

export interface AddResultParams {
  test_id: number;
  status_id: number;
  comment?: string;
  version?: string;
  elapsed?: string;
  defects?: string;
  assignedto_id?: number;
  custom_step_results?: TestRailStepResultDto[];
  custom?: Record<string, unknown>;
}

export interface TestRailTestUpdateDto {
  labels?: Array<number | string>;
  // Support for custom fields - any field starting with 'custom_'
  [key: string]: unknown;
}

export interface TestRailTestsResponse {
  offset?: number;
  limit?: number;
  size?: number;
  _links?: {
    next: string | null;
    prev: string | null;
  };
  tests: TestRailTestDto[];
}

export interface TestRailCaseFieldDto {
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
  description?: string;
  display_order: number;
  id: number;
  label: string;
  name: string;
  system_name: string;
  type_id: number;
}

export interface GetCasesParams {
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

export interface GetSectionsParams {
  project_id: number;
  suite_id?: number;
  limit?: number;
  offset?: number;
}

export interface GetRunsParams {
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

export interface GetTestsParams {
  run_id: number;
  status_id?: number[];
  limit?: number;
  offset?: number;
  label_id?: number[];
}

export interface GetTestParams {
  test_id: number;
  with_data?: string;
}



export class TestRailClient {
  private readonly http: AxiosInstance;

  constructor() {
    this.http = axios.create({
      baseURL: `${config.TESTRAIL_URL}/index.php?/api/v2`,
      timeout: config.TESTRAIL_TIMEOUT_MS,
      auth: {
        username: config.TESTRAIL_USERNAME,
        password: config.TESTRAIL_API_KEY,
      },
      headers: {
        'Content-Type': 'application/json',
      },
      validateStatus: () => true,
    });

    axiosRetry(this.http, {
      retries: 3,
      retryDelay: axiosRetry.exponentialDelay,
      shouldResetTimeout: true,
      retryCondition: (error) => {
        const status = error.response?.status;
        // Retry on 429 or 5xx, and network errors (no response)
        return !status || status === 429 || (status >= 500 && status < 600);
      },
      onRetry: (retryCount, error) => {
        const status = (error as AxiosError).response?.status;
        logger.warn({ retryCount, status }, 'Retrying TestRail request');
      },
    });
  }

  private normalizeError(error: unknown): TestRailError {
    // Support both AxiosError and manually thrown errors with a response/status
    const anyErr = error as { response?: { status?: number }; message?: string } | undefined;
    const status = anyErr?.response?.status;

    if (axios.isAxiosError(error)) {
      if (status === 401 || status === 403) return { type: 'auth', status, message: 'Unauthorized' };
      if (status === 404) return { type: 'not_found', status, message: 'Not found' };
      if (status === 429) return { type: 'rate_limited', status, message: 'Rate limited' };
      if (status && status >= 500) return { type: 'server', status, message: 'Server error' };
      if (!status) return { type: 'network', message: (error as AxiosError).message ?? 'Network error' };
      return { type: 'unknown', status, message: (error as AxiosError).message ?? 'Unknown error' };
    }

    if (typeof status === 'number') {
      if (status === 401 || status === 403) return { type: 'auth', status, message: 'Unauthorized' };
      if (status === 404) return { type: 'not_found', status, message: 'Not found' };
      if (status === 429) return { type: 'rate_limited', status, message: 'Rate limited' };
      if (status >= 500) return { type: 'server', status, message: 'Server error' };
      return { type: 'unknown', status, message: anyErr?.message ?? 'Unknown error' };
    }

    return { type: 'unknown', message: (error as Error)?.message ?? 'Unknown error' };
  }

  private getSafeErrorDetails(error: unknown): Record<string, unknown> {
    if (axios.isAxiosError(error)) {
      // Only log safe fields to prevent sensitive data leakage
      return {
        status: error.response?.status,
        statusText: error.response?.statusText,
        url: error.config?.url,
        method: error.config?.method,
        // Avoid logging response data, headers, or request data
        message: error.message
      };
    }
    
    const anyErr = error as { response?: { status?: number; data?: unknown } } | undefined;
    return {
      status: anyErr?.response?.status,
      message: (error as Error)?.message
    };
  }

  async getCase(caseId: number): Promise<TestRailCaseDto> {
    try {
      const res = await this.http.get(`/get_case/${caseId}`);
      if (res.status >= 200 && res.status < 300) {
        return res.data as TestRailCaseDto;
      }
      throw Object.assign(new Error(`HTTP ${res.status}`), { response: res });
    } catch (err) {
      const normalized = this.normalizeError(err);
      const safeDetails = this.getSafeErrorDetails(err);
      logger.error({ err: normalized, details: safeDetails }, 'TestRail getCase failed');
      throw normalized;
    }
  }

  async updateCase(caseId: number, updates: TestRailCaseUpdateDto): Promise<TestRailCaseDto> {
    try {
      const res = await this.http.post(`/update_case/${caseId}`, updates);
      if (res.status >= 200 && res.status < 300) {
        return res.data as TestRailCaseDto;
      }
      throw Object.assign(new Error(`HTTP ${res.status}`), { response: res });
    } catch (err) {
      const normalized = this.normalizeError(err);
      const safeDetails = this.getSafeErrorDetails(err);
      logger.error({ err: normalized, details: safeDetails }, 'TestRail updateCase failed');
      throw normalized;
    }
  }

  async addCase(sectionId: number, caseData: TestRailCaseCreateDto): Promise<TestRailCaseDto> {
    try {
      const res = await this.http.post(`/add_case/${sectionId}`, caseData);
      if (res.status >= 200 && res.status < 300) {
        logger.info({
          message: 'Successfully created test case',
          sectionId,
          caseId: res.data.id,
          responseSize: JSON.stringify(res.data).length,
        });
        return res.data as TestRailCaseDto;
      }
      throw Object.assign(new Error(`HTTP ${res.status}`), { response: res });
    } catch (err) {
      const normalized = this.normalizeError(err);
      const safeDetails = this.getSafeErrorDetails(err);
      logger.error({ err: normalized, details: safeDetails, sectionId }, 'TestRail addCase failed');
      throw normalized;
    }
  }

  async updateTest(testId: number, updates: TestRailTestUpdateDto): Promise<TestRailTestDetailDto> {
    try {
      const res = await this.http.post(`/update_test/${testId}`, updates);
      if (res.status >= 200 && res.status < 300) {
        return res.data as TestRailTestDetailDto;
      }
      throw Object.assign(new Error(`HTTP ${res.status}`), { response: res });
    } catch (err) {
      const normalized = this.normalizeError(err);
      const safeDetails = this.getSafeErrorDetails(err);
      logger.error({ err: normalized, details: safeDetails }, 'TestRail updateTest failed');
      throw normalized;
    }
  }

  async getProjects(): Promise<TestRailProjectDto[]> {
    try {
      const res = await this.http.get('/get_projects');
      logger.info({ 
        status: res.status, 
        dataType: typeof res.data, 
        dataIsArray: Array.isArray(res.data),
        hasProjectsProperty: res.data && typeof res.data === 'object' && 'projects' in res.data
      }, 'TestRail getProjects response info');
      
      if (res.status >= 200 && res.status < 300) {
        // Handle both direct array and paginated response formats
        let projects: TestRailProjectDto[];
        
        if (Array.isArray(res.data)) {
          // Direct array format (some TestRail versions)
          projects = res.data as TestRailProjectDto[];
        } else if (res.data && typeof res.data === 'object' && 'projects' in res.data) {
          // Paginated format (newer TestRail versions)
          const paginatedResponse = res.data as TestRailProjectsResponse;
          if (!Array.isArray(paginatedResponse.projects)) {
            throw Object.assign(new Error('API returned paginated response with non-array projects field'), {
              response: { status: 200 } // Make it look like a server error
            });
          }
          projects = paginatedResponse.projects;
          logger.info({ 
            totalProjects: paginatedResponse.size,
            returnedProjects: projects.length,
            offset: paginatedResponse.offset,
            limit: paginatedResponse.limit
          }, 'TestRail paginated projects response');
        } else {
          logger.error({ 
            status: res.status, 
            responseData: res.data,
            dataType: typeof res.data 
          }, 'TestRail getProjects returned unexpected response format');
          throw Object.assign(new Error('API returned unexpected response format'), { 
            response: { status: 200 } // Make it look like a server error
          });
        }
        
        return projects;
      }
      throw Object.assign(new Error(`HTTP ${res.status}`), { response: res });
    } catch (err) {
      const normalized = this.normalizeError(err);
      const safeDetails = this.getSafeErrorDetails(err);
      logger.error({ err: normalized, details: safeDetails }, 'TestRail getProjects failed');
      throw normalized;
    }
  }

  async getProject(projectId: number): Promise<TestRailProjectDto> {
    try {
      const res = await this.http.get(`/get_project/${projectId}`);
      logger.info({ 
        status: res.status, 
        dataType: typeof res.data,
        projectId 
      }, 'TestRail getProject response info');
      
      if (res.status >= 200 && res.status < 300) {
        return res.data as TestRailProjectDto;
      }
      throw Object.assign(new Error(`HTTP ${res.status}`), { response: res });
    } catch (err) {
      const normalized = this.normalizeError(err);
      const safeDetails = this.getSafeErrorDetails(err);
      logger.error({ err: normalized, details: safeDetails, projectId }, 'TestRail getProject failed');
      throw normalized;
    }
  }

  async getSuite(suiteId: number): Promise<TestRailSuiteDto> {
    try {
      const res = await this.http.get(`/get_suite/${suiteId}`);
      logger.info({ 
        status: res.status, 
        dataType: typeof res.data,
        suiteId 
      }, 'TestRail getSuite response info');
      
      if (res.status >= 200 && res.status < 300) {
        return res.data as TestRailSuiteDto;
      }
      throw Object.assign(new Error(`HTTP ${res.status}`), { response: res });
    } catch (err) {
      const normalized = this.normalizeError(err);
      const safeDetails = this.getSafeErrorDetails(err);
      logger.error({ err: normalized, details: safeDetails, suiteId }, 'TestRail getSuite failed');
      throw normalized;
    }
  }

  async getSuites(projectId: number): Promise<TestRailSuiteDto[]> {
    try {
      const res = await this.http.get(`/get_suites/${projectId}`);
      logger.info({ 
        status: res.status, 
        dataType: typeof res.data,
        dataIsArray: Array.isArray(res.data),
        projectId 
      }, 'TestRail getSuites response info');
      
      if (res.status >= 200 && res.status < 300) {
        // Handle both direct array and paginated response formats
        let suites: TestRailSuiteDto[];
        
        if (Array.isArray(res.data)) {
          // Direct array format (most common)
          suites = res.data as TestRailSuiteDto[];
        } else if (res.data && typeof res.data === 'object' && 'suites' in res.data) {
          // Paginated format (if TestRail supports it)
          const paginatedResponse = res.data as { suites: TestRailSuiteDto[] };
          if (!Array.isArray(paginatedResponse.suites)) {
            throw Object.assign(new Error('API returned paginated response with non-array suites field'), {
              response: { status: 200 } // Make it look like a server error
            });
          }
          suites = paginatedResponse.suites;
          logger.info({ 
            returnedSuites: suites.length
          }, 'TestRail paginated suites response');
        } else {
          logger.error({ 
            status: res.status, 
            responseData: res.data,
            dataType: typeof res.data 
          }, 'TestRail getSuites returned unexpected response format');
          throw Object.assign(new Error('API returned unexpected response format'), { 
            response: { status: 200 } // Make it look like a server error
          });
        }
        
        return suites;
      }
      throw Object.assign(new Error(`HTTP ${res.status}`), { response: res });
    } catch (err) {
      const normalized = this.normalizeError(err);
      const safeDetails = this.getSafeErrorDetails(err);
      logger.error({ err: normalized, details: safeDetails, projectId }, 'TestRail getSuites failed');
      throw normalized;
    }
  }

  async getCaseFields(): Promise<TestRailCaseFieldDto[]> {
    try {
      const res = await this.http.get('/get_case_fields');
      logger.info({ 
        status: res.status, 
        dataType: typeof res.data,
        dataIsArray: Array.isArray(res.data)
      }, 'TestRail getCaseFields response info');
      
      if (res.status >= 200 && res.status < 300) {
        if (Array.isArray(res.data)) {
          return res.data as TestRailCaseFieldDto[];
        } else {
          logger.error({ 
            status: res.status, 
            responseData: res.data,
            dataType: typeof res.data 
          }, 'TestRail getCaseFields returned non-array response');
          throw Object.assign(new Error('API returned non-array response'), { 
            response: { status: 200 } // Make it look like a server error
          });
        }
      }
      throw Object.assign(new Error(`HTTP ${res.status}`), { response: res });
    } catch (err) {
      const normalized = this.normalizeError(err);
      const safeDetails = this.getSafeErrorDetails(err);
      logger.error({ err: normalized, details: safeDetails }, 'TestRail getCaseFields failed');
      throw normalized;
    }
  }

  async getCases(params: GetCasesParams): Promise<TestRailCasesResponse> {
    try {
      // Build query parameters
      const queryParams = new URLSearchParams();
      
      // Handle suite_id parameter
      if (params.suite_id !== undefined) {
        queryParams.append('suite_id', params.suite_id.toString());
      }
      
      // Handle filtering parameters
      if (params.created_after !== undefined) {
        queryParams.append('created_after', params.created_after.toString());
      }
      if (params.created_before !== undefined) {
        queryParams.append('created_before', params.created_before.toString());
      }
      if (params.created_by && params.created_by.length > 0) {
        queryParams.append('created_by', params.created_by.join(','));
      }
      if (params.filter !== undefined) {
        queryParams.append('filter', params.filter);
      }
      if (params.milestone_id && params.milestone_id.length > 0) {
        queryParams.append('milestone_id', params.milestone_id.join(','));
      }
      if (params.priority_id && params.priority_id.length > 0) {
        queryParams.append('priority_id', params.priority_id.join(','));
      }
      if (params.refs !== undefined) {
        queryParams.append('refs', params.refs);
      }
      if (params.section_id !== undefined) {
        queryParams.append('section_id', params.section_id.toString());
      }
      if (params.template_id && params.template_id.length > 0) {
        queryParams.append('template_id', params.template_id.join(','));
      }
      if (params.type_id && params.type_id.length > 0) {
        queryParams.append('type_id', params.type_id.join(','));
      }
      if (params.updated_after !== undefined) {
        queryParams.append('updated_after', params.updated_after.toString());
      }
      if (params.updated_before !== undefined) {
        queryParams.append('updated_before', params.updated_before.toString());
      }
      if (params.updated_by !== undefined) {
        queryParams.append('updated_by', params.updated_by.toString());
      }
      if (params.label_id && params.label_id.length > 0) {
        queryParams.append('label_id', params.label_id.join(','));
      }
      
      // Handle pagination parameters
      if (params.limit !== undefined) {
        queryParams.append('limit', params.limit.toString());
      }
      if (params.offset !== undefined) {
        queryParams.append('offset', params.offset.toString());
      }
      
      const queryString = queryParams.toString();
      const url = `/get_cases/${params.project_id}${queryString ? `&${queryString}` : ''}`;
      
      const res = await this.http.get(url);
      logger.info({ 
        status: res.status, 
        dataType: typeof res.data,
        hasCasesProperty: res.data && typeof res.data === 'object' && 'cases' in res.data,
        projectId: params.project_id,
        suiteId: params.suite_id,
        queryParams: Object.fromEntries(queryParams)
      }, 'TestRail getCases response info');
      
      if (res.status >= 200 && res.status < 300) {
        // TestRail get_cases always returns paginated format
        if (res.data && typeof res.data === 'object' && 'cases' in res.data) {
          const paginatedResponse = res.data as TestRailCasesResponse;
          if (!Array.isArray(paginatedResponse.cases)) {
            throw Object.assign(new Error('API returned response with non-array cases field'), {
              response: { status: 200 } // Make it look like a server error
            });
          }
          logger.info({ 
            totalCases: paginatedResponse.size,
            returnedCases: paginatedResponse.cases.length,
            offset: paginatedResponse.offset,
            limit: paginatedResponse.limit,
            hasNext: paginatedResponse._links?.next !== null,
            hasPrev: paginatedResponse._links?.prev !== null
          }, 'TestRail getCases paginated response');
          
          return paginatedResponse;
        } else {
          logger.error({ 
            status: res.status, 
            responseData: res.data,
            dataType: typeof res.data 
          }, 'TestRail getCases returned unexpected response format');
          throw Object.assign(new Error('API returned unexpected response format'), { 
            response: { status: 200 } // Make it look like a server error
          });
        }
      }
      throw Object.assign(new Error(`HTTP ${res.status}`), { response: res });
    } catch (err) {
      const normalized = this.normalizeError(err);
      const safeDetails = this.getSafeErrorDetails(err);
      logger.error({ err: normalized, details: safeDetails, params }, 'TestRail getCases failed');
      throw normalized;
    }
  }

  async addAttachmentToCase(caseId: number, filePath: string): Promise<TestRailAttachmentResponse> {
    try {
      // Import FormData dynamically to avoid issues in Node.js environment
      const FormData = (await import('form-data')).default;
      const fs = await import('fs');
      
      const formData = new FormData();
      const fileStream = fs.createReadStream(filePath);
      const fileName = filePath.split(/[/\\]/).pop() || 'attachment';
      
      formData.append('attachment', fileStream, fileName);
      
      // Create a new axios instance for multipart upload
      const uploadClient = axios.create({
        baseURL: `${config.TESTRAIL_URL}/index.php?/api/v2`,
        timeout: config.TESTRAIL_TIMEOUT_MS,
        auth: {
          username: config.TESTRAIL_USERNAME,
          password: config.TESTRAIL_API_KEY,
        },
        headers: {
          ...formData.getHeaders(),
        },
        validateStatus: () => true,
      });

      const res = await uploadClient.post(`/add_attachment_to_case/${caseId}`, formData);
      
      if (res.status >= 200 && res.status < 300) {
        return res.data as TestRailAttachmentResponse;
      }
      throw Object.assign(new Error(`HTTP ${res.status}`), { response: res });
    } catch (err) {
      const normalized = this.normalizeError(err);
      const safeDetails = this.getSafeErrorDetails(err);
      logger.error({ err: normalized, details: safeDetails, caseId, filePath }, 'TestRail addAttachmentToCase failed');
      throw normalized;
    }
  }

  async getSections(params: GetSectionsParams): Promise<TestRailSectionsResponse> {
    try {
      // Build query parameters
      const queryParams = new URLSearchParams();
      
      // Handle suite_id parameter
      if (params.suite_id !== undefined) {
        queryParams.append('suite_id', params.suite_id.toString());
      }
      
      // Handle pagination parameters
      if (params.limit !== undefined) {
        queryParams.append('limit', params.limit.toString());
      }
      if (params.offset !== undefined) {
        queryParams.append('offset', params.offset.toString());
      }
      
      const queryString = queryParams.toString();
      const url = `/get_sections/${params.project_id}${queryString ? `&${queryString}` : ''}`;
      
      const res = await this.http.get(url);
      logger.info({ 
        status: res.status, 
        dataType: typeof res.data,
        hasSectionsProperty: res.data && typeof res.data === 'object' && 'sections' in res.data,
        projectId: params.project_id,
        suiteId: params.suite_id,
        queryParams: Object.fromEntries(queryParams)
      }, 'TestRail getSections response info');
      
      if (res.status >= 200 && res.status < 300) {
        // TestRail get_sections always returns paginated format
        if (res.data && typeof res.data === 'object' && 'sections' in res.data) {
          const paginatedResponse = res.data as TestRailSectionsResponse;
          if (!Array.isArray(paginatedResponse.sections)) {
            throw Object.assign(new Error('API returned response with non-array sections field'), {
              response: { status: 200 } // Make it look like a server error
            });
          }
          logger.info({ 
            totalSections: paginatedResponse.size,
            returnedSections: paginatedResponse.sections.length,
            offset: paginatedResponse.offset,
            limit: paginatedResponse.limit,
            hasNext: paginatedResponse._links?.next !== null,
            hasPrev: paginatedResponse._links?.prev !== null
          }, 'TestRail getSections paginated response');
          
          return paginatedResponse;
        } else {
          logger.error({ 
            status: res.status, 
            responseData: res.data,
            dataType: typeof res.data 
          }, 'TestRail getSections returned unexpected response format');
          throw Object.assign(new Error('API returned unexpected response format'), { 
            response: { status: 200 } // Make it look like a server error
          });
        }
      }
      throw Object.assign(new Error(`HTTP ${res.status}`), { response: res });
    } catch (err) {
      const normalized = this.normalizeError(err);
      const safeDetails = this.getSafeErrorDetails(err);
      logger.error({ err: normalized, details: safeDetails, params }, 'TestRail getSections failed');
      throw normalized;
    }
  }

  async getRuns(params: GetRunsParams): Promise<TestRailRunsResponse> {
    try {
      // Build query parameters
      const queryParams = new URLSearchParams();
      
      // Handle date filters
      if (params.created_after !== undefined) {
        queryParams.append('created_after', params.created_after.toString());
      }
      if (params.created_before !== undefined) {
        queryParams.append('created_before', params.created_before.toString());
      }
      
      // Handle created_by filter (comma-separated list)
      if (params.created_by && params.created_by.length > 0) {
        queryParams.append('created_by', params.created_by.join(','));
      }
      
      // Handle completion status
      if (params.is_completed !== undefined) {
        queryParams.append('is_completed', params.is_completed ? '1' : '0');
      }
      
      // Handle pagination parameters
      if (params.limit !== undefined) {
        queryParams.append('limit', params.limit.toString());
      }
      if (params.offset !== undefined) {
        queryParams.append('offset', params.offset.toString());
      }
      
      // Handle milestone filter (comma-separated list)
      if (params.milestone_id && params.milestone_id.length > 0) {
        queryParams.append('milestone_id', params.milestone_id.join(','));
      }
      
      // Handle refs filter
      if (params.refs_filter) {
        queryParams.append('refs_filter', params.refs_filter);
      }
      
      // Handle suite filter (comma-separated list)
      if (params.suite_id && params.suite_id.length > 0) {
        queryParams.append('suite_id', params.suite_id.join(','));
      }
      
      const queryString = queryParams.toString();
      const url = `/get_runs/${params.project_id}${queryString ? `&${queryString}` : ''}`;
      
      const res = await this.http.get(url);
      logger.info({
        message: 'Successfully retrieved test runs',
        projectId: params.project_id,
        filters: params,
        responseSize: res.data.runs?.length || 0,
      });
      
      return res.data;
    } catch (error) {
      const normalized = this.normalizeError(error);
      const safeDetails = this.getSafeErrorDetails(error);
      logger.error({
        message: 'Failed to retrieve test runs',
        projectId: params.project_id,
        filters: params,
        error: normalized,
        details: safeDetails,
      });
      throw normalized;
    }
  }

  async getRun(runId: number): Promise<TestRailRunDetailDto> {
    try {
      const res = await this.http.get(`/get_run/${runId}`);
      if (res.status >= 200 && res.status < 300) {
        logger.info({
          message: 'Successfully retrieved test run',
          runId,
          responseSize: JSON.stringify(res.data).length,
        });
        return res.data as TestRailRunDetailDto;
      }
      throw Object.assign(new Error(`HTTP ${res.status}`), { response: res });
    } catch (error) {
      const normalized = this.normalizeError(error);
      const safeDetails = this.getSafeErrorDetails(error);
      logger.error({
        message: 'Failed to retrieve test run',
        runId,
        error: normalized,
        details: safeDetails,
      });
      throw normalized;
    }
  }

  async updateRun(runId: number, updates: TestRailRunUpdateDto): Promise<TestRailRunDetailDto> {
    try {
      const res = await this.http.post(`/update_run/${runId}`, updates);
      if (res.status >= 200 && res.status < 300) {
        logger.info({
          message: 'Successfully updated test run',
          runId,
          responseSize: JSON.stringify(res.data).length,
        });
        return res.data as TestRailRunDetailDto;
      }
      throw Object.assign(new Error(`HTTP ${res.status}`), { response: res });
    } catch (error) {
      const normalized = this.normalizeError(error);
      const safeDetails = this.getSafeErrorDetails(error);
      logger.error({
        message: 'Failed to update test run',
        runId,
        error: normalized,
        details: safeDetails,
      });
      throw normalized;
    }
  }

  async getTests(params: GetTestsParams): Promise<TestRailTestsResponse> {
    try {
      // Build query parameters
      const queryParams = new URLSearchParams();
      
      // Handle status_id filter (comma-separated list)
      if (params.status_id && params.status_id.length > 0) {
        queryParams.append('status_id', params.status_id.join(','));
      }
      
      // Handle pagination parameters
      if (params.limit !== undefined) {
        queryParams.append('limit', params.limit.toString());
      }
      if (params.offset !== undefined) {
        queryParams.append('offset', params.offset.toString());
      }
      
      // Handle label_id filter (comma-separated list)
      if (params.label_id && params.label_id.length > 0) {
        queryParams.append('label_id', params.label_id.join(','));
      }
      
      const queryString = queryParams.toString();
      const url = `/get_tests/${params.run_id}${queryString ? `&${queryString}` : ''}`;
      
      const res = await this.http.get(url);
      if (res.status >= 200 && res.status < 300) {
        logger.info({
          message: 'Successfully retrieved tests for run',
          runId: params.run_id,
          testCount: res.data.tests?.length || 0,
          responseSize: JSON.stringify(res.data).length,
        });
        return res.data;
      } else {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
    } catch (error) {
      const normalized = this.normalizeError(error);
      const safeDetails = this.getSafeErrorDetails(error);
      logger.error({
        message: 'Failed to retrieve tests for run',
        runId: params.run_id,
        error: normalized,
        details: safeDetails,
      });
      throw normalized;
    }
  }

  async getTest(params: GetTestParams): Promise<TestRailTestDetailDto> {
    try {
      // Build query parameters
      const queryParams = new URLSearchParams();
      
      // Handle with_data parameter
      if (params.with_data !== undefined) {
        queryParams.append('with_data', params.with_data);
      }
      
      const queryString = queryParams.toString();
      const url = `/get_test/${params.test_id}${queryString ? `?${queryString}` : ''}`;
      
      const res = await this.http.get(url);
      if (res.status >= 200 && res.status < 300) {
        logger.info({
          message: 'Successfully retrieved test details',
          testId: params.test_id,
          responseSize: JSON.stringify(res.data).length,
        });
        return res.data;
      } else {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
    } catch (error) {
      const normalized = this.normalizeError(error);
      logger.error({
        message: 'Failed to retrieve test details',
        testId: params.test_id,
        error: normalized,
      });
      throw normalized;
    }
  }

  async addResult(params: AddResultParams): Promise<TestRailResultDto> {
    try {
      // Build request body
      const requestBody: Record<string, unknown> = {
        status_id: params.status_id,
      };

      // Add optional fields if provided
      if (params.comment !== undefined) {
        requestBody.comment = params.comment;
      }
      if (params.version !== undefined) {
        requestBody.version = params.version;
      }
      if (params.elapsed !== undefined) {
        requestBody.elapsed = params.elapsed;
      }
      if (params.defects !== undefined) {
        requestBody.defects = params.defects;
      }
      if (params.assignedto_id !== undefined) {
        requestBody.assignedto_id = params.assignedto_id;
      }
      if (params.custom_step_results !== undefined) {
        requestBody.custom_step_results = params.custom_step_results;
      }

      // Add custom fields if provided
      if (params.custom) {
        Object.assign(requestBody, params.custom);
      }

      const res = await this.http.post(`/add_result/${params.test_id}`, requestBody);
      if (res.status >= 200 && res.status < 300) {
        logger.info({
          message: 'Successfully added test result',
          testId: params.test_id,
          statusId: params.status_id,
          responseSize: JSON.stringify(res.data).length,
        });
        return res.data;
      } else {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
    } catch (error) {
      const normalized = this.normalizeError(error);
      logger.error({
        message: 'Failed to add test result',
        testId: params.test_id,
        statusId: params.status_id,
        error: normalized,
      });
      throw normalized;
    }
  }
}

export const testRailClient = new TestRailClient();


