import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import nock from 'nock';
import { getRuns } from '../src/services/testrailService';
import { config } from '../src/config';

describe('testrailService.getRuns', () => {
  const baseApi = `${config.TESTRAIL_URL}`;
  const apiPath = '/index.php?/api/v2';

  beforeEach(() => {
    nock.disableNetConnect();
  });

  afterEach(() => {
    nock.cleanAll();
    nock.enableNetConnect();
  });

  it('returns normalized runs list with pagination', async () => {
    const projectId = 1;
    const mockResponse = {
      offset: 0,
      limit: 250,
      size: 23,
      _links: {
        next: null,
        prev: null,
      },
      runs: [
        {
          id: 1,
          name: 'Test run 1',
          custom_field_1: 'value1',
        },
        {
          id: 2,
          name: 'Test run 2',
          custom_field_2: 'value2',
        },
      ],
    };

    nock(baseApi)
      .get(`${apiPath}/get_runs/${projectId}`)
      .reply(200, mockResponse);

    const result = await getRuns({ project_id: projectId });

    expect(result).toEqual({
      offset: 0,
      limit: 250,
      size: 23,
      _links: {
        next: null,
        prev: null,
      },
      runs: [
        {
          id: 1,
          name: 'Test run 1',
          custom: {
            custom_field_1: 'value1',
          },
        },
        {
          id: 2,
          name: 'Test run 2',
          custom: {
            custom_field_2: 'value2',
          },
        },
      ],
    });
  });

  it('handles runs without custom fields', async () => {
    const projectId = 1;
    const mockResponse = {
      offset: 0,
      limit: 250,
      size: 1,
      _links: {
        next: null,
        prev: null,
      },
      runs: [
        {
          id: 1,
          name: 'Test run 1',
        },
      ],
    };

    nock(baseApi)
      .get(`${apiPath}/get_runs/${projectId}`)
      .reply(200, mockResponse);

    const result = await getRuns({ project_id: projectId });

    expect(result.runs[0]).toEqual({
      id: 1,
      name: 'Test run 1',
      custom: undefined,
    });
  });

  it('handles all filter parameters correctly', async () => {
    const projectId = 1;
    const filters = {
      project_id: projectId,
      created_after: 1640995200, // 2022-01-01
      created_before: 1672531200, // 2023-01-01
      created_by: [1, 2],
      is_completed: true,
      limit: 100,
      milestone_id: [5, 6],
      offset: 50,
      refs_filter: 'TR-123',
      suite_id: [10, 11],
    };

    const mockResponse = {
      offset: 50,
      limit: 100,
      size: 5,
      _links: {
        next: null,
        prev: '/api/v2/get_runs/1&limit=100&offset=0',
      },
      runs: [
        {
          id: 51,
          name: 'Filtered test run',
        },
      ],
    };

    nock(baseApi)
      .get(`${apiPath}/get_runs/${projectId}&created_after=1640995200&created_before=1672531200&created_by=1,2&is_completed=1&limit=100&milestone_id=5,6&offset=50&refs_filter=TR-123&suite_id=10,11`)
      .reply(200, mockResponse);

    const result = await getRuns(filters);

    expect(result).toEqual({
      offset: 50,
      limit: 100,
      size: 5,
      _links: {
        next: null,
        prev: '/api/v2/get_runs/1&limit=100&offset=0',
      },
      runs: [
        {
          id: 51,
          name: 'Filtered test run',
          custom: undefined,
        },
      ],
    });
  });

  it('handles empty runs list', async () => {
    const projectId = 1;
    const mockResponse = {
      offset: 0,
      limit: 250,
      size: 0,
      _links: {
        next: null,
        prev: null,
      },
      runs: [],
    };

    nock(baseApi)
      .get(`${apiPath}/get_runs/${projectId}`)
      .reply(200, mockResponse);

    const result = await getRuns({ project_id: projectId });

    expect(result).toEqual({
      offset: 0,
      limit: 250,
      size: 0,
      _links: {
        next: null,
        prev: null,
      },
      runs: [],
    });
  });

  it('handles is_completed=false correctly', async () => {
    const projectId = 1;
    const filters = {
      project_id: projectId,
      is_completed: false,
    };

    const mockResponse = {
      offset: 0,
      limit: 250,
      size: 1,
      _links: {
        next: null,
        prev: null,
      },
      runs: [
        {
          id: 1,
          name: 'Active test run',
        },
      ],
    };

    nock(baseApi)
      .get(`${apiPath}/get_runs/${projectId}&is_completed=0`)
      .reply(200, mockResponse);

    const result = await getRuns(filters);

    expect(result.runs).toHaveLength(1);
    expect(result.runs[0].name).toBe('Active test run');
  });

  it('handles single array values correctly', async () => {
    const projectId = 1;
    const filters = {
      project_id: projectId,
      created_by: [1],
      milestone_id: [5],
      suite_id: [10],
    };

    const mockResponse = {
      offset: 0,
      limit: 250,
      size: 1,
      _links: {
        next: null,
        prev: null,
      },
      runs: [
        {
          id: 1,
          name: 'Single filter test run',
        },
      ],
    };

    nock(baseApi)
      .get(`${apiPath}/get_runs/${projectId}&created_by=1&milestone_id=5&suite_id=10`)
      .reply(200, mockResponse);

    const result = await getRuns(filters);

    expect(result.runs).toHaveLength(1);
    expect(result.runs[0].name).toBe('Single filter test run');
  });

  it('handles API errors correctly', async () => {
    const projectId = 999;
    const errorResponse = {
      error: 'Project not found',
    };

    nock(baseApi)
      .get(`${apiPath}/get_runs/${projectId}`)
      .reply(404, errorResponse);

    await expect(getRuns({ project_id: projectId })).rejects.toThrow();
  });

  it('handles network errors correctly', async () => {
    const projectId = 1;

    nock(baseApi)
      .get(`${apiPath}/get_runs/${projectId}`)
      .replyWithError('Network error');

    await expect(getRuns({ project_id: projectId })).rejects.toThrow();
  });
});
