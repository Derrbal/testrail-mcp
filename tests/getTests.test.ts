import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import nock from 'nock';
import { getTests } from '../src/services/testrailService';
import { config } from '../src/config';

describe('testrailService.getTests', () => {
  const baseApi = `${config.TESTRAIL_URL}`;
  const apiPath = '/index.php?/api/v2';

  beforeEach(() => {
    nock.disableNetConnect();
  });

  afterEach(() => {
    nock.cleanAll();
    nock.enableNetConnect();
  });

  it('returns normalized tests list with pagination', async () => {
    const runId = 42;
    const mockResponse = {
      offset: 0,
      limit: 250,
      size: 23,
      _links: {
        next: null,
        prev: null,
      },
      tests: [
        {
          id: 1,
          title: 'Test conditional formatting with basic value range',
        },
        {
          id: 2,
          title: 'Verify line spacing on multi-page document',
        },
      ],
    };

    nock(baseApi)
      .get(`${apiPath}/get_tests/${runId}`)
      .reply(200, mockResponse);

    const result = await getTests({ run_id: runId });

    expect(result).toEqual({
      offset: 0,
      limit: 250,
      size: 23,
      _links: {
        next: null,
        prev: null,
      },
      tests: [
        {
          id: 1,
          title: 'Test conditional formatting with basic value range',
          custom: undefined,
        },
        {
          id: 2,
          title: 'Verify line spacing on multi-page document',
          custom: undefined,
        },
      ],
    });
  });

  it('handles tests with custom fields', async () => {
    const runId = 123;
    const mockResponse = {
      offset: 0,
      limit: 250,
      size: 1,
      _links: {
        next: null,
        prev: null,
      },
      tests: [
        {
          id: 456,
          title: 'Custom Test Case',
          custom_field_1: 'custom value 1',
          custom_field_2: 'custom value 2',
          some_other_field: 42,
        },
      ],
    };

    nock(baseApi)
      .get(`${apiPath}/get_tests/${runId}`)
      .reply(200, mockResponse);

    const result = await getTests({ run_id: runId });

    expect(result.tests[0].id).toBe(456);
    expect(result.tests[0].title).toBe('Custom Test Case');
    expect(result.tests[0].custom).toEqual({
      custom_field_1: 'custom value 1',
      custom_field_2: 'custom value 2',
      some_other_field: 42,
    });
  });

  it('handles status_id filter', async () => {
    const runId = 42;
    const statusIds = [4, 5]; // Retest and Failed statuses

    nock(baseApi)
      .get(`${apiPath}/get_tests/${runId}&status_id=4,5`)
      .reply(200, {
        offset: 0,
        limit: 250,
        size: 2,
        _links: {
          next: null,
          prev: null,
        },
        tests: [
          {
            id: 1,
            title: 'Failed Test',
          },
          {
            id: 2,
            title: 'Retest Test',
          },
        ],
      });

    const result = await getTests({ run_id: runId, status_id: statusIds });

    expect(result.tests).toHaveLength(2);
    expect(result.tests[0].id).toBe(1);
    expect(result.tests[1].id).toBe(2);
  });

  it('handles pagination parameters', async () => {
    const runId = 42;
    const limit = 10;
    const offset = 20;

    nock(baseApi)
      .get(`${apiPath}/get_tests/${runId}&limit=10&offset=20`)
      .reply(200, {
        offset: 20,
        limit: 10,
        size: 30,
        _links: {
          next: null,
          prev: 'http://testrail.example.com/index.php?/api/v2/get_tests/42&limit=10&offset=10',
        },
        tests: [
          {
            id: 21,
            title: 'Test 21',
          },
        ],
      });

    const result = await getTests({ run_id: runId, limit, offset });

    expect(result.offset).toBe(20);
    expect(result.limit).toBe(10);
    expect(result.size).toBe(30);
    expect(result.tests).toHaveLength(1);
  });

  it('handles label_id filter', async () => {
    const runId = 42;
    const labelIds = [1, 2, 3];

    nock(baseApi)
      .get(`${apiPath}/get_tests/${runId}&label_id=1,2,3`)
      .reply(200, {
        offset: 0,
        limit: 250,
        size: 1,
        _links: {
          next: null,
          prev: null,
        },
        tests: [
          {
            id: 1,
            title: 'Labeled Test',
          },
        ],
      });

    const result = await getTests({ run_id: runId, label_id: labelIds });

    expect(result.tests).toHaveLength(1);
    expect(result.tests[0].title).toBe('Labeled Test');
  });

  it('handles empty tests list', async () => {
    const runId = 999;
    const mockResponse = {
      offset: 0,
      limit: 250,
      size: 0,
      _links: {
        next: null,
        prev: null,
      },
      tests: [],
    };

    nock(baseApi)
      .get(`${apiPath}/get_tests/${runId}`)
      .reply(200, mockResponse);

    const result = await getTests({ run_id: runId });

    expect(result.tests).toHaveLength(0);
    expect(result.size).toBe(0);
  });

  it('throws error for non-existent run', async () => {
    const runId = 999;

    nock(baseApi)
      .get(`${apiPath}/get_tests/${runId}`)
      .reply(400, { error: 'Invalid or unknown test run' });

    await expect(getTests({ run_id: runId })).rejects.toThrow();
  });

  it('throws error for network issues', async () => {
    const runId = 123;

    nock(baseApi)
      .get(`${apiPath}/get_tests/${runId}`)
      .replyWithError('Network error');

    await expect(getTests({ run_id: runId })).rejects.toThrow();
  });

  it('throws error for server errors', async () => {
    const runId = 123;

    nock(baseApi)
      .get(`${apiPath}/get_tests/${runId}`)
      .reply(500, { error: 'Internal server error' });

    await expect(getTests({ run_id: runId })).rejects.toThrow();
  });

  it('throws error for authentication issues', async () => {
    const runId = 123;

    nock(baseApi)
      .get(`${apiPath}/get_tests/${runId}`)
      .reply(403, { error: 'No access to the test run' });

    await expect(getTests({ run_id: runId })).rejects.toThrow();
  });
});
