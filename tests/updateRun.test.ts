import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import nock from 'nock';
import { updateRun } from '../src/services/testrailService';
import { config } from '../src/config';

describe('testrailService.updateRun', () => {
  const baseApi = `${config.TESTRAIL_URL}`;
  const apiPath = '/index.php?/api/v2';

  beforeEach(() => {
    nock.disableNetConnect();
  });

  afterEach(() => {
    nock.cleanAll();
    nock.enableNetConnect();
  });

  it('updates run with basic fields', async () => {
    const runId = 123;
    const updates = {
      name: 'Updated Test Run',
      description: 'Updated description for the test run',
      include_all: true,
    };

    const scope = nock(baseApi)
      .post(`${apiPath}/update_run/${runId}`, updates)
      .reply(200, {
        id: runId,
        name: 'Updated Test Run',
        description: 'Updated description for the test run',
        include_all: true,
        is_completed: false,
        project_id: 1,
        suite_id: 2,
        created_on: Date.now(),
        passed_count: 5,
        blocked_count: 0,
        untested_count: 10,
        retest_count: 0,
        failed_count: 0,
        custom_status1_count: 0,
        custom_status2_count: 0,
        custom_status3_count: 0,
        custom_status4_count: 0,
        custom_status5_count: 0,
        custom_status6_count: 0,
        custom_status7_count: 0,
        config_ids: [],
        url: 'https://testrail.io/index.php?/runs/view/123',
      });

    const result = await updateRun(runId, updates);
    expect(result).toEqual(
      expect.objectContaining({
        id: runId,
        name: 'Updated Test Run',
        description: 'Updated description for the test run',
        include_all: true,
      }),
    );
    scope.done();
  });

  it('updates run with case selection', async () => {
    const runId = 123;
    const updates = {
      include_all: false,
      case_ids: [1, 2, 3, 5, 8],
    };

    const scope = nock(baseApi)
      .post(`${apiPath}/update_run/${runId}`, updates)
      .reply(200, {
        id: runId,
        name: 'Test Run',
        include_all: false,
        is_completed: false,
        project_id: 1,
        suite_id: 2,
        created_on: Date.now(),
        passed_count: 2,
        blocked_count: 0,
        untested_count: 3,
        retest_count: 0,
        failed_count: 0,
        custom_status1_count: 0,
        custom_status2_count: 0,
        custom_status3_count: 0,
        custom_status4_count: 0,
        custom_status5_count: 0,
        custom_status6_count: 0,
        custom_status7_count: 0,
        config_ids: [],
        url: 'https://testrail.io/index.php?/runs/view/123',
      });

    const result = await updateRun(runId, updates);
    expect(result).toEqual(
      expect.objectContaining({
        id: runId,
        include_all: false,
      }),
    );
    scope.done();
  });

  it('updates run with milestone and dates', async () => {
    const runId = 123;
    const updates = {
      milestone_id: 5,
      start_on: 1640995200, // 2022-01-01
      due_on: 1643673600, // 2022-02-01
    };

    const scope = nock(baseApi)
      .post(`${apiPath}/update_run/${runId}`, updates)
      .reply(200, {
        id: runId,
        name: 'Test Run',
        milestone_id: 5,
        start_on: 1640995200,
        due_on: 1643673600,
        include_all: true,
        is_completed: false,
        project_id: 1,
        suite_id: 2,
        created_on: Date.now(),
        passed_count: 0,
        blocked_count: 0,
        untested_count: 10,
        retest_count: 0,
        failed_count: 0,
        custom_status1_count: 0,
        custom_status2_count: 0,
        custom_status3_count: 0,
        custom_status4_count: 0,
        custom_status5_count: 0,
        custom_status6_count: 0,
        custom_status7_count: 0,
        config_ids: [],
        url: 'https://testrail.io/index.php?/runs/view/123',
      });

    const result = await updateRun(runId, updates);
    expect(result).toEqual(
      expect.objectContaining({
        id: runId,
        milestone_id: 5,
        start_on: 1640995200,
        due_on: 1643673600,
      }),
    );
    scope.done();
  });

  it('updates run with configuration', async () => {
    const runId = 123;
    const updates = {
      config: '1,2,3',
      config_ids: [1, 2, 3],
    };

    const scope = nock(baseApi)
      .post(`${apiPath}/update_run/${runId}`, updates)
      .reply(200, {
        id: runId,
        name: 'Test Run',
        config: '1,2,3',
        config_ids: [1, 2, 3],
        include_all: true,
        is_completed: false,
        project_id: 1,
        suite_id: 2,
        created_on: Date.now(),
        passed_count: 0,
        blocked_count: 0,
        untested_count: 10,
        retest_count: 0,
        failed_count: 0,
        custom_status1_count: 0,
        custom_status2_count: 0,
        custom_status3_count: 0,
        custom_status4_count: 0,
        custom_status5_count: 0,
        custom_status6_count: 0,
        custom_status7_count: 0,
        url: 'https://testrail.io/index.php?/runs/view/123',
      });

    const result = await updateRun(runId, updates);
    expect(result).toEqual(
      expect.objectContaining({
        id: runId,
        config: '1,2,3',
        config_ids: [1, 2, 3],
      }),
    );
    scope.done();
  });

  it('updates run with custom fields', async () => {
    const runId = 123;
    const updates = {
      name: 'Test Run',
      custom: {
        custom_field1: 'value1',
        custom_field2: 'value2',
      },
    };

    const scope = nock(baseApi)
      .post(`${apiPath}/update_run/${runId}`, {
        name: 'Test Run',
        custom_field1: 'value1',
        custom_field2: 'value2',
      })
      .reply(200, {
        id: runId,
        name: 'Test Run',
        include_all: true,
        is_completed: false,
        project_id: 1,
        suite_id: 2,
        created_on: Date.now(),
        passed_count: 0,
        blocked_count: 0,
        untested_count: 10,
        retest_count: 0,
        failed_count: 0,
        custom_status1_count: 0,
        custom_status2_count: 0,
        custom_status3_count: 0,
        custom_status4_count: 0,
        custom_status5_count: 0,
        custom_status6_count: 0,
        custom_status7_count: 0,
        config_ids: [],
        custom_field1: 'value1',
        custom_field2: 'value2',
        url: 'https://testrail.io/index.php?/runs/view/123',
      });

    const result = await updateRun(runId, updates);
    expect(result).toEqual(
      expect.objectContaining({
        id: runId,
        custom: {
          custom_field1: 'value1',
          custom_field2: 'value2',
        },
      }),
    );
    scope.done();
  });

  it('handles partial updates with only name', async () => {
    const runId = 123;
    const updates = {
      name: 'Only Name Update',
    };

    const scope = nock(baseApi)
      .post(`${apiPath}/update_run/${runId}`, { name: 'Only Name Update' })
      .reply(200, {
        id: runId,
        name: 'Only Name Update',
        include_all: true,
        is_completed: false,
        project_id: 1,
        suite_id: 2,
        created_on: Date.now(),
        passed_count: 0,
        blocked_count: 0,
        untested_count: 10,
        retest_count: 0,
        failed_count: 0,
        custom_status1_count: 0,
        custom_status2_count: 0,
        custom_status3_count: 0,
        custom_status4_count: 0,
        custom_status5_count: 0,
        custom_status6_count: 0,
        custom_status7_count: 0,
        config_ids: [],
        url: 'https://testrail.io/index.php?/runs/view/123',
      });

    const result = await updateRun(runId, updates);
    expect(result).toEqual(
      expect.objectContaining({
        id: runId,
        name: 'Only Name Update',
      }),
    );
    scope.done();
  });

  it('throws on 404', async () => {
    const runId = 9999;
    const updates = { name: 'Non-existent Run' };
    
    const scope = nock(baseApi)
      .post(`${apiPath}/update_run/${runId}`)
      .reply(404, { error: 'not found' });

    await expect(updateRun(runId, updates)).rejects.toMatchObject({ type: 'not_found' });
    scope.done();
  });

  it('throws on authentication error', async () => {
    const runId = 123;
    const updates = { name: 'Unauthorized Update' };
    
    const scope = nock(baseApi)
      .post(`${apiPath}/update_run/${runId}`)
      .reply(401, { error: 'unauthorized' });

    await expect(updateRun(runId, updates)).rejects.toMatchObject({ type: 'auth' });
    scope.done();
  });

  it('throws on server error', async () => {
    const runId = 123;
    const updates = { name: 'Server Error' };
    
    const scope = nock(baseApi)
      .post(`${apiPath}/update_run/${runId}`)
      .reply(500, { error: 'internal server error' });

    await expect(updateRun(runId, updates)).rejects.toMatchObject({ type: 'server' });
    scope.done();
  });

  it('throws on permission error', async () => {
    const runId = 123;
    const updates = { name: 'Permission Error' };
    
    const scope = nock(baseApi)
      .post(`${apiPath}/update_run/${runId}`)
      .reply(403, { error: 'no permissions' });

    await expect(updateRun(runId, updates)).rejects.toMatchObject({ type: 'auth' });
    scope.done();
  });

  it('updates run with references', async () => {
    const runId = 123;
    const updates = {
      refs: 'REQ-123,REQ-456',
    };

    const scope = nock(baseApi)
      .post(`${apiPath}/update_run/${runId}`, updates)
      .reply(200, {
        id: runId,
        name: 'Test Run',
        refs: 'REQ-123,REQ-456',
        include_all: true,
        is_completed: false,
        project_id: 1,
        suite_id: 2,
        created_on: Date.now(),
        passed_count: 0,
        blocked_count: 0,
        untested_count: 10,
        retest_count: 0,
        failed_count: 0,
        custom_status1_count: 0,
        custom_status2_count: 0,
        custom_status3_count: 0,
        custom_status4_count: 0,
        custom_status5_count: 0,
        custom_status6_count: 0,
        custom_status7_count: 0,
        config_ids: [],
        url: 'https://testrail.io/index.php?/runs/view/123',
      });

    const result = await updateRun(runId, updates);
    expect(result).toEqual(
      expect.objectContaining({
        id: runId,
        refs: 'REQ-123,REQ-456',
      }),
    );
    scope.done();
  });
});
