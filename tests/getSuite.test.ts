import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import nock from 'nock';
import { getSuite } from '../src/services/testrailService';
import { config } from '../src/config';

describe('testrailService.getSuite', () => {
  const baseApi = `${config.TESTRAIL_URL}`;
  const apiPath = '/index.php?/api/v2';

  beforeEach(() => {
    nock.disableNetConnect();
  });

  afterEach(() => {
    nock.cleanAll();
    nock.enableNetConnect();
  });

  it('returns normalized suite details', async () => {
    const suiteId = 123;
    const mockSuite = {
      id: suiteId,
      name: 'Test Suite Alpha',
      description: 'This is a test suite for automated testing',
      project_id: 3,
      url: 'https://test.testrail.com/index.php?/suites/view/123',
      is_baseline: false,
      is_master: true,
      is_completed: false,
      completed_on: null,
      created_on: 1640995200,
      created_by: 1,
      updated_on: 1641081600,
      updated_by: 2,
      custom_priority: 'high',
      custom_team: 'QA Team',
    };

    const scope = nock(baseApi)
      .get(`${apiPath}/get_suite/${suiteId}`)
      .reply(200, mockSuite);

    const result = await getSuite(suiteId);
    expect(result).toEqual({
      id: suiteId,
      name: 'Test Suite Alpha',
      description: 'This is a test suite for automated testing',
      project_id: 3,
      url: 'https://test.testrail.com/index.php?/suites/view/123',
      is_baseline: false,
      is_master: true,
      is_completed: false,
      completed_on: null,
      created_on: 1640995200,
      created_by: 1,
      updated_on: 1641081600,
      updated_by: 2,
      custom: {
        custom_priority: 'high',
        custom_team: 'QA Team',
      },
    });
    scope.done();
  });

  it('handles suite with no custom fields', async () => {
    const suiteId = 456;
    const mockSuite = {
      id: suiteId,
      name: 'Test Suite Beta',
      description: null,
      project_id: 5,
      url: 'https://test.testrail.com/index.php?/suites/view/456',
      is_baseline: true,
      is_master: false,
      is_completed: false,
      completed_on: null,
      created_on: 1641081600,
      created_by: 2,
      updated_on: null,
      updated_by: null,
    };

    const scope = nock(baseApi)
      .get(`${apiPath}/get_suite/${suiteId}`)
      .reply(200, mockSuite);

    const result = await getSuite(suiteId);
    expect(result).toEqual({
      id: suiteId,
      name: 'Test Suite Beta',
      description: null,
      project_id: 5,
      url: 'https://test.testrail.com/index.php?/suites/view/456',
      is_baseline: true,
      is_master: false,
      is_completed: false,
      completed_on: null,
      created_on: 1641081600,
      created_by: 2,
      updated_on: null,
      updated_by: null,
      custom: undefined,
    });
    scope.done();
  });

  it('handles completed suite', async () => {
    const suiteId = 789;
    const mockSuite = {
      id: suiteId,
      name: 'Test Suite Gamma',
      description: 'This is a completed test suite',
      project_id: 7,
      url: 'https://test.testrail.com/index.php?/suites/view/789',
      is_baseline: false,
      is_master: false,
      is_completed: true,
      completed_on: 1721806363,
      created_on: 1640995200,
      created_by: 1,
      updated_on: 1721806363,
      updated_by: 1,
      custom_status: 'archived',
    };

    const scope = nock(baseApi)
      .get(`${apiPath}/get_suite/${suiteId}`)
      .reply(200, mockSuite);

    const result = await getSuite(suiteId);
    expect(result).toEqual({
      id: suiteId,
      name: 'Test Suite Gamma',
      description: 'This is a completed test suite',
      project_id: 7,
      url: 'https://test.testrail.com/index.php?/suites/view/789',
      is_baseline: false,
      is_master: false,
      is_completed: true,
      completed_on: 1721806363,
      created_on: 1640995200,
      created_by: 1,
      updated_on: 1721806363,
      updated_by: 1,
      custom: {
        custom_status: 'archived',
      },
    });
    scope.done();
  });

  it('handles suite with only custom fields', async () => {
    const suiteId = 999;
    const mockSuite = {
      id: suiteId,
      name: 'Custom Test Suite',
      description: null,
      project_id: 9,
      url: 'https://test.testrail.com/index.php?/suites/view/999',
      is_baseline: false,
      is_master: false,
      is_completed: false,
      completed_on: null,
      created_on: 1640995200,
      created_by: 1,
      updated_on: null,
      updated_by: null,
      custom_priority: 'critical',
      custom_budget: 50000,
      custom_owner: 'Test User',
    };

    const scope = nock(baseApi)
      .get(`${apiPath}/get_suite/${suiteId}`)
      .reply(200, mockSuite);

    const result = await getSuite(suiteId);
    expect(result).toEqual({
      id: suiteId,
      name: 'Custom Test Suite',
      description: null,
      project_id: 9,
      url: 'https://test.testrail.com/index.php?/suites/view/999',
      is_baseline: false,
      is_master: false,
      is_completed: false,
      completed_on: null,
      created_on: 1640995200,
      created_by: 1,
      updated_on: null,
      updated_by: null,
      custom: {
        custom_priority: 'critical',
        custom_budget: 50000,
        custom_owner: 'Test User',
      },
    });
    scope.done();
  });

  it('throws on 404', async () => {
    const suiteId = 9999;
    const scope = nock(baseApi)
      .get(`${apiPath}/get_suite/${suiteId}`)
      .reply(404, { error: 'not found' });

    await expect(getSuite(suiteId)).rejects.toMatchObject({ type: 'not_found' });
    scope.done();
  });

  it('throws on authentication error', async () => {
    const suiteId = 123;
    const scope = nock(baseApi)
      .get(`${apiPath}/get_suite/${suiteId}`)
      .reply(401, { error: 'unauthorized' });

    await expect(getSuite(suiteId)).rejects.toMatchObject({ type: 'auth' });
    scope.done();
  });

  it('throws on server error', async () => {
    const suiteId = 123;
    const scope = nock(baseApi)
      .get(`${apiPath}/get_suite/${suiteId}`)
      .reply(500, { error: 'server error' });

    await expect(getSuite(suiteId)).rejects.toMatchObject({ type: 'server' });
    scope.done();
  });

  it('throws on rate limiting', async () => {
    const suiteId = 123;
    const scope = nock(baseApi)
      .get(`${apiPath}/get_suite/${suiteId}`)
      .reply(429, { error: 'rate limited' });

    await expect(getSuite(suiteId)).rejects.toMatchObject({ type: 'rate_limited' });
    scope.done();
  });
});
