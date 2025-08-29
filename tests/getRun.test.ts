import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import nock from 'nock';
import { getRun } from '../src/services/testrailService';
import { config } from '../src/config';

describe('testrailService.getRun', () => {
  const baseApi = `${config.TESTRAIL_URL}`;
  const apiPath = '/index.php?/api/v2';

  beforeEach(() => {
    nock.disableNetConnect();
  });

  afterEach(() => {
    nock.cleanAll();
    nock.enableNetConnect();
  });

  it('returns normalized run details with all fields', async () => {
    const runId = 42;
    const mockResponse = {
      id: 42,
      name: 'File Formats',
      description: 'Test run for file format validation',
      suite_id: 4,
      milestone_id: 7,
      assignedto_id: 6,
      include_all: false,
      is_completed: false,
      completed_on: null,
      config: 'Firefox, Ubuntu 12',
      config_ids: [2, 6],
      passed_count: 2,
      blocked_count: 0,
      untested_count: 3,
      retest_count: 1,
      failed_count: 2,
      custom_status1_count: 0,
      custom_status2_count: 0,
      custom_status3_count: 0,
      custom_status4_count: 0,
      custom_status5_count: 0,
      custom_status6_count: 0,
      custom_status7_count: 0,
      project_id: 1,
      plan_id: 80,
      created_on: 1393845644,
      updated_on: null,
      refs: 'SAN-1',
      start_on: null,
      due_on: null,
      url: 'http://testrail.example.com/index.php?/runs/view/42',
    };

    nock(baseApi)
      .get(`${apiPath}/get_run/${runId}`)
      .reply(200, mockResponse);

    const result = await getRun(runId);

    expect(result).toEqual({
      id: 42,
      name: 'File Formats',
      description: 'Test run for file format validation',
      suite_id: 4,
      milestone_id: 7,
      assignedto_id: 6,
      include_all: false,
      is_completed: false,
      completed_on: null,
      config: 'Firefox, Ubuntu 12',
      config_ids: [2, 6],
      passed_count: 2,
      blocked_count: 0,
      untested_count: 3,
      retest_count: 1,
      failed_count: 2,
      custom_status1_count: 0,
      custom_status2_count: 0,
      custom_status3_count: 0,
      custom_status4_count: 0,
      custom_status5_count: 0,
      custom_status6_count: 0,
      custom_status7_count: 0,
      project_id: 1,
      plan_id: 80,
      created_on: 1393845644,
      updated_on: null,
      refs: 'SAN-1',
      start_on: null,
      due_on: null,
      url: 'http://testrail.example.com/index.php?/runs/view/42',
      custom: undefined,
    });
  });

  it('handles run with custom fields', async () => {
    const runId = 123;
    const mockResponse = {
      id: 123,
      name: 'Custom Test Run',
      suite_id: 5,
      include_all: true,
      is_completed: true,
      completed_on: 1393846000,
      config: null,
      config_ids: [],
      passed_count: 10,
      blocked_count: 0,
      untested_count: 0,
      retest_count: 0,
      failed_count: 0,
      custom_status1_count: 0,
      custom_status2_count: 0,
      custom_status3_count: 0,
      custom_status4_count: 0,
      custom_status5_count: 0,
      custom_status6_count: 0,
      custom_status7_count: 0,
      project_id: 2,
      plan_id: null,
      created_on: 1393845644,
      updated_on: 1393846000,
      refs: null,
      start_on: null,
      due_on: null,
      url: 'http://testrail.example.com/index.php?/runs/view/123',
      custom_field_1: 'custom value 1',
      custom_field_2: 'custom value 2',
      some_other_field: 42,
    };

    nock(baseApi)
      .get(`${apiPath}/get_run/${runId}`)
      .reply(200, mockResponse);

    const result = await getRun(runId);

    expect(result.id).toBe(123);
    expect(result.name).toBe('Custom Test Run');
    expect(result.custom).toEqual({
      custom_field_1: 'custom value 1',
      custom_field_2: 'custom value 2',
      some_other_field: 42,
    });
  });

  it('handles run with minimal fields', async () => {
    const runId = 456;
    const mockResponse = {
      id: 456,
      name: 'Minimal Run',
      suite_id: 1,
      include_all: false,
      is_completed: false,
      config: null,
      config_ids: [],
      passed_count: 0,
      blocked_count: 0,
      untested_count: 5,
      retest_count: 0,
      failed_count: 0,
      custom_status1_count: 0,
      custom_status2_count: 0,
      custom_status3_count: 0,
      custom_status4_count: 0,
      custom_status5_count: 0,
      custom_status6_count: 0,
      custom_status7_count: 0,
      project_id: 1,
      plan_id: null,
      created_on: 1393845644,
      updated_on: null,
      refs: null,
      start_on: null,
      due_on: null,
      url: 'http://testrail.example.com/index.php?/runs/view/456',
    };

    nock(baseApi)
      .get(`${apiPath}/get_run/${runId}`)
      .reply(200, mockResponse);

    const result = await getRun(runId);

    expect(result.id).toBe(456);
    expect(result.name).toBe('Minimal Run');
    expect(result.description).toBeUndefined();
    expect(result.milestone_id).toBeUndefined();
    expect(result.assignedto_id).toBeUndefined();
    expect(result.completed_on).toBeUndefined();
    expect(result.custom).toBeUndefined();
  });

  it('throws error for non-existent run', async () => {
    const runId = 999;

    nock(baseApi)
      .get(`${apiPath}/get_run/${runId}`)
      .reply(400, { error: 'Invalid or unknown test run' });

    await expect(getRun(runId)).rejects.toThrow();
  });

  it('throws error for network issues', async () => {
    const runId = 123;

    nock(baseApi)
      .get(`${apiPath}/get_run/${runId}`)
      .replyWithError('Network error');

    await expect(getRun(runId)).rejects.toThrow();
  });

  it('throws error for server errors', async () => {
    const runId = 123;

    nock(baseApi)
      .get(`${apiPath}/get_run/${runId}`)
      .reply(500, { error: 'Internal server error' });

    await expect(getRun(runId)).rejects.toThrow();
  });

  it('throws error for authentication issues', async () => {
    const runId = 123;

    nock(baseApi)
      .get(`${apiPath}/get_run/${runId}`)
      .reply(403, { error: 'No access to the project' });

    await expect(getRun(runId)).rejects.toThrow();
  });
});
