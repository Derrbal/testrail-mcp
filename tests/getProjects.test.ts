import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import nock from 'nock';
import { getProjects } from '../src/services/testrailService';
import { config } from '../src/config';

describe('testrailService.getProjects', () => {
  const baseApi = `${config.TESTRAIL_URL}`;
  const apiPath = '/index.php?/api/v2';

  beforeEach(() => {
    nock.disableNetConnect();
  });

  afterEach(() => {
    nock.cleanAll();
    nock.enableNetConnect();
  });

  it('returns normalized projects list (direct array format)', async () => {
    const mockProjects = [
      {
        id: 1,
        name: 'Project Alpha',
        announcement: 'Welcome to Alpha',
        show_announcement: true,
        is_completed: false,
        completed_on: null,
        suite_mode: 1,
        url: 'https://test.testrail.com/index.php?/projects/overview/1',
        created_on: 1640995200,
        created_by: 1,
        custom_field_example: 'test_value',
      },
      {
        id: 2,
        name: 'Project Beta',
        is_completed: true,
        completed_on: 1672531199,
        suite_mode: 2,
        url: 'https://test.testrail.com/index.php?/projects/overview/2',
        created_on: 1641081600,
        created_by: 2,
      },
    ];

    const scope = nock(baseApi).get(`${apiPath}/get_projects`).reply(200, mockProjects);

    const result = await getProjects();
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual(
      expect.objectContaining({
        id: 1,
        name: 'Project Alpha',
        announcement: 'Welcome to Alpha',
        show_announcement: true,
        is_completed: false,
        completed_on: null,
        suite_mode: 1,
        url: 'https://test.testrail.com/index.php?/projects/overview/1',
        created_on: 1640995200,
        created_by: 1,
        custom: { custom_field_example: 'test_value' },
      }),
    );
    expect(result[1]).toEqual(
      expect.objectContaining({
        id: 2,
        name: 'Project Beta',
        is_completed: true,
        completed_on: 1672531199,
        suite_mode: 2,
        url: 'https://test.testrail.com/index.php?/projects/overview/2',
        created_on: 1641081600,
        created_by: 2,
        custom: undefined, // No custom fields
      }),
    );
    scope.done();
  });

  it('returns normalized projects list (paginated format)', async () => {
    const mockProjectsResponse = {
      offset: 0,
      limit: 250,
      size: 2,
      _links: {
        next: null,
        prev: null,
      },
      projects: [
        {
          id: 3,
          name: 'Project Gamma',
          announcement: 'Test announcement',
          show_announcement: true,
          is_completed: false,
          completed_on: null,
          suite_mode: 3,
          url: 'https://test.testrail.com/index.php?/projects/overview/3',
          custom_priority: 'high',
        },
        {
          id: 51,
          name: 'Project Delta',
          announcement: null,
          show_announcement: false,
          is_completed: false,
          completed_on: null,
          suite_mode: 3,
          url: 'https://test.testrail.com/index.php?/projects/overview/51',
        },
      ],
    };

    const scope = nock(baseApi).get(`${apiPath}/get_projects`).reply(200, mockProjectsResponse);

    const result = await getProjects();
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual(
      expect.objectContaining({
        id: 3,
        name: 'Project Gamma',
        announcement: 'Test announcement',
        show_announcement: true,
        is_completed: false,
        completed_on: null,
        suite_mode: 3,
        url: 'https://test.testrail.com/index.php?/projects/overview/3',
        custom: { custom_priority: 'high' },
      }),
    );
    expect(result[1]).toEqual(
      expect.objectContaining({
        id: 51,
        name: 'Project Delta',
        announcement: null,
        show_announcement: false,
        is_completed: false,
        completed_on: null,
        suite_mode: 3,
        url: 'https://test.testrail.com/index.php?/projects/overview/51',
        custom: undefined,
      }),
    );
    scope.done();
  });

  it('handles projects with only custom fields (paginated format)', async () => {
    const mockProjectsResponse = {
      offset: 0,
      limit: 250,
      size: 1,
      _links: { next: null, prev: null },
      projects: [
        {
          id: 3,
          name: 'Project Custom',
          is_completed: false,
          suite_mode: 1,
          url: 'https://test.testrail.com/index.php?/projects/overview/3',
          custom_priority: 'high',
          custom_team: 'QA Team',
          custom_budget: 50000,
        },
      ],
    };

    const scope = nock(baseApi).get(`${apiPath}/get_projects`).reply(200, mockProjectsResponse);

    const result = await getProjects();
    expect(result).toHaveLength(1);
    expect(result[0].custom).toEqual({
      custom_priority: 'high',
      custom_team: 'QA Team',
      custom_budget: 50000,
    });
    scope.done();
  });

  it('returns empty array when no projects exist (direct array)', async () => {
    const scope = nock(baseApi).get(`${apiPath}/get_projects`).reply(200, []);

    const result = await getProjects();
    expect(result).toEqual([]);
    scope.done();
  });

  it('returns empty array when no projects exist (paginated format)', async () => {
    const mockResponse = {
      offset: 0,
      limit: 250,
      size: 0,
      _links: { next: null, prev: null },
      projects: [],
    };

    const scope = nock(baseApi).get(`${apiPath}/get_projects`).reply(200, mockResponse);

    const result = await getProjects();
    expect(result).toEqual([]);
    scope.done();
  });

  it('throws on authentication error', async () => {
    const scope = nock(baseApi).get(`${apiPath}/get_projects`).reply(401, { error: 'unauthorized' });

    await expect(getProjects()).rejects.toMatchObject({ type: 'auth' });
    scope.done();
  });

  it('throws on server error', async () => {
    const scope = nock(baseApi).get(`${apiPath}/get_projects`).reply(500, { error: 'server error' });

    await expect(getProjects()).rejects.toMatchObject({ type: 'server' });
    scope.done();
  });

  it('throws on rate limiting', async () => {
    const scope = nock(baseApi).get(`${apiPath}/get_projects`).reply(429, { error: 'rate limited' });

    await expect(getProjects()).rejects.toMatchObject({ type: 'rate_limited' });
    scope.done();
  });

  it('throws on invalid paginated response (projects not an array)', async () => {
    const invalidResponse = {
      offset: 0,
      limit: 250,
      size: 1,
      _links: { next: null, prev: null },
      projects: "invalid", // Should be an array
    };

    const scope = nock(baseApi).get(`${apiPath}/get_projects`).reply(200, invalidResponse);

    await expect(getProjects()).rejects.toMatchObject({ type: 'unknown' });
    scope.done();
  });

  it('throws on completely unexpected response format', async () => {
    const invalidResponse = { unexpected: 'format' };

    const scope = nock(baseApi).get(`${apiPath}/get_projects`).reply(200, invalidResponse);

    await expect(getProjects()).rejects.toMatchObject({ type: 'unknown' });
    scope.done();
  });
});
