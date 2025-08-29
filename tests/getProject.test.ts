import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import nock from 'nock';
import { getProject } from '../src/services/testrailService';
import { config } from '../src/config';

describe('testrailService.getProject', () => {
  const baseApi = `${config.TESTRAIL_URL}`;
  const apiPath = '/index.php?/api/v2';

  beforeEach(() => {
    nock.disableNetConnect();
  });

  afterEach(() => {
    nock.cleanAll();
    nock.enableNetConnect();
  });

  it('returns normalized project details', async () => {
    const projectId = 3;
    const mockProject = {
      id: projectId,
      name: 'Test Project Alpha',
      announcement: 'This is a test project for automated testing',
      show_announcement: true,
      is_completed: false,
      completed_on: null,
      suite_mode: 3,
      url: 'https://test.testrail.com/index.php?/projects/overview/3',
      created_on: 1640995200,
      created_by: 1,
      custom_priority: 'high',
      custom_team: 'QA Team',
    };

    const scope = nock(baseApi)
      .get(`${apiPath}/get_project/${projectId}`)
      .reply(200, mockProject);

    const result = await getProject(projectId);
    expect(result).toEqual({
      id: projectId,
      name: 'Test Project Alpha',
      announcement: 'This is a test project for automated testing',
      show_announcement: true,
      is_completed: false,
      completed_on: null,
      suite_mode: 3,
      url: 'https://test.testrail.com/index.php?/projects/overview/3',
      created_on: 1640995200,
      created_by: 1,
      custom: {
        custom_priority: 'high',
        custom_team: 'QA Team',
      },
    });
    scope.done();
  });

  it('handles project with no custom fields', async () => {
    const projectId = 51;
    const mockProject = {
      id: projectId,
      name: 'Test Project Beta',
      announcement: null,
      show_announcement: false,
      is_completed: false,
      completed_on: null,
      suite_mode: 3,
      url: 'https://test.testrail.com/index.php?/projects/overview/51',
      created_on: 1641081600,
      created_by: 2,
    };

    const scope = nock(baseApi)
      .get(`${apiPath}/get_project/${projectId}`)
      .reply(200, mockProject);

    const result = await getProject(projectId);
    expect(result).toEqual({
      id: projectId,
      name: 'Test Project Beta',
      announcement: null,
      show_announcement: false,
      is_completed: false,
      completed_on: null,
      suite_mode: 3,
      url: 'https://test.testrail.com/index.php?/projects/overview/51',
      created_on: 1641081600,
      created_by: 2,
      custom: undefined,
    });
    scope.done();
  });

  it('handles completed project', async () => {
    const projectId = 16;
    const mockProject = {
      id: projectId,
      name: 'Test Project Gamma',
      announcement: 'This is a completed test project',
      show_announcement: true,
      is_completed: true,
      completed_on: 1721806363,
      suite_mode: 3,
      url: 'https://test.testrail.com/index.php?/projects/overview/16',
      created_on: 1640995200,
      created_by: 1,
      custom_status: 'archived',
    };

    const scope = nock(baseApi)
      .get(`${apiPath}/get_project/${projectId}`)
      .reply(200, mockProject);

    const result = await getProject(projectId);
    expect(result).toEqual({
      id: projectId,
      name: 'Test Project Gamma',
      announcement: 'This is a completed test project',
      show_announcement: true,
      is_completed: true,
      completed_on: 1721806363,
      suite_mode: 3,
      url: 'https://test.testrail.com/index.php?/projects/overview/16',
      created_on: 1640995200,
      created_by: 1,
      custom: {
        custom_status: 'archived',
      },
    });
    scope.done();
  });

  it('handles project with only custom fields', async () => {
    const projectId = 99;
    const mockProject = {
      id: projectId,
      name: 'Custom Test Project',
      announcement: null,
      show_announcement: false,
      is_completed: false,
      completed_on: null,
      suite_mode: 1,
      url: 'https://test.testrail.com/index.php?/projects/overview/99',
      custom_priority: 'critical',
      custom_budget: 100000,
      custom_owner: 'Test User',
    };

    const scope = nock(baseApi)
      .get(`${apiPath}/get_project/${projectId}`)
      .reply(200, mockProject);

    const result = await getProject(projectId);
    expect(result).toEqual({
      id: projectId,
      name: 'Custom Test Project',
      announcement: null,
      show_announcement: false,
      is_completed: false,
      completed_on: null,
      suite_mode: 1,
      url: 'https://test.testrail.com/index.php?/projects/overview/99',
      custom: {
        custom_priority: 'critical',
        custom_budget: 100000,
        custom_owner: 'Test User',
      },
    });
    scope.done();
  });

  it('throws on 404', async () => {
    const projectId = 9999;
    const scope = nock(baseApi)
      .get(`${apiPath}/get_project/${projectId}`)
      .reply(404, { error: 'not found' });

    await expect(getProject(projectId)).rejects.toMatchObject({ type: 'not_found' });
    scope.done();
  });

  it('throws on authentication error', async () => {
    const projectId = 3;
    const scope = nock(baseApi)
      .get(`${apiPath}/get_project/${projectId}`)
      .reply(401, { error: 'unauthorized' });

    await expect(getProject(projectId)).rejects.toMatchObject({ type: 'auth' });
    scope.done();
  });

  it('throws on server error', async () => {
    const projectId = 3;
    const scope = nock(baseApi)
      .get(`${apiPath}/get_project/${projectId}`)
      .reply(500, { error: 'server error' });

    await expect(getProject(projectId)).rejects.toMatchObject({ type: 'server' });
    scope.done();
  });

  it('throws on rate limiting', async () => {
    const projectId = 3;
    const scope = nock(baseApi)
      .get(`${apiPath}/get_project/${projectId}`)
      .reply(429, { error: 'rate limited' });

    await expect(getProject(projectId)).rejects.toMatchObject({ type: 'rate_limited' });
    scope.done();
  });
});
