import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import nock from 'nock';
import { getTest } from '../src/services/testrailService';
import { config } from '../src/config';

describe('testrailService.getTest', () => {
  const baseApi = `${config.TESTRAIL_URL}`;
  const apiPath = '/index.php?/api/v2';

  beforeEach(() => {
    nock.disableNetConnect();
  });

  afterEach(() => {
    nock.cleanAll();
    nock.enableNetConnect();
  });

  it('returns normalized test details with all fields', async () => {
    const testId = 100;
    const mockResponse = {
      id: 100,
      title: 'Verify line spacing on multi-page document',
      assignedto_id: 1,
      case_id: 1,
      custom_expected: 'Expected result for the test',
      custom_preconds: 'Preconditions for the test',
      custom_steps_separated: [
        {
          content: 'Step 1',
          expected: 'Expected Result 1',
        },
        {
          content: 'Step 2',
          expected: 'Expected Result 2',
        },
      ],
      estimate: '1m 5s',
      estimate_forecast: null,
      priority_id: 2,
      run_id: 1,
      status_id: 5,
      type_id: 4,
      milestone_id: 7,
      refs: 'REF-123',
      labels: [
        {
          id: 1,
          title: 'label1',
        },
        {
          id: 2,
          title: 'label2',
        },
      ],
    };

    nock(baseApi)
      .get(`${apiPath}/get_test/${testId}`)
      .reply(200, mockResponse);

    const result = await getTest({ test_id: testId });

    expect(result).toEqual({
      id: 100,
      title: 'Verify line spacing on multi-page document',
      assignedto_id: 1,
      case_id: 1,
      custom_expected: 'Expected result for the test',
      custom_preconds: 'Preconditions for the test',
      custom_steps_separated: [
        {
          content: 'Step 1',
          expected: 'Expected Result 1',
        },
        {
          content: 'Step 2',
          expected: 'Expected Result 2',
        },
      ],
      estimate: '1m 5s',
      estimate_forecast: null,
      priority_id: 2,
      run_id: 1,
      status_id: 5,
      type_id: 4,
      milestone_id: 7,
      refs: 'REF-123',
      labels: [
        {
          id: 1,
          title: 'label1',
        },
        {
          id: 2,
          title: 'label2',
        },
      ],
      custom: undefined,
    });
  });

  it('handles test with custom fields', async () => {
    const testId = 200;
    const mockResponse = {
      id: 200,
      title: 'Custom Test Case',
      assignedto_id: 5,
      case_id: 50,
      custom_expected: null,
      custom_preconds: null,
      custom_steps_separated: null,
      estimate: '30s',
      estimate_forecast: '45s',
      priority_id: 1,
      run_id: 10,
      status_id: 3,
      type_id: 2,
      milestone_id: null,
      refs: null,
      labels: [],
      custom_field_1: 'custom value 1',
      custom_field_2: 'custom value 2',
      some_other_field: 42,
    };

    nock(baseApi)
      .get(`${apiPath}/get_test/${testId}`)
      .reply(200, mockResponse);

    const result = await getTest({ test_id: testId });

    expect(result.id).toBe(200);
    expect(result.title).toBe('Custom Test Case');
    expect(result.custom).toEqual({
      custom_field_1: 'custom value 1',
      custom_field_2: 'custom value 2',
      some_other_field: 42,
    });
  });

  it('handles test with with_data parameter', async () => {
    const testId = 300;
    const withData = 'additional_data';

    nock(baseApi)
      .get(new RegExp(`${apiPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}/get_test/${testId}.*`))
      .reply(200, {
        id: 300,
        title: 'Test with additional data',
        assignedto_id: 1,
        case_id: 100,
        custom_expected: null,
        custom_preconds: null,
        custom_steps_separated: null,
        estimate: null,
        estimate_forecast: null,
        priority_id: 3,
        run_id: 5,
        status_id: 1,
        type_id: 1,
        milestone_id: null,
        refs: null,
        labels: [],
      });

    const result = await getTest({ test_id: testId, with_data: withData });

    expect(result.id).toBe(300);
    expect(result.title).toBe('Test with additional data');
    expect(result.custom).toBeUndefined();
  });

  it('handles test with minimal fields', async () => {
    const testId = 400;
    const mockResponse = {
      id: 400,
      title: 'Minimal Test',
      assignedto_id: 1,
      case_id: 200,
      custom_expected: null,
      custom_preconds: null,
      custom_steps_separated: null,
      estimate: null,
      estimate_forecast: null,
      priority_id: 3,
      run_id: 8,
      status_id: 1,
      type_id: 1,
      milestone_id: null,
      refs: null,
      labels: [],
    };

    nock(baseApi)
      .get(`${apiPath}/get_test/${testId}`)
      .reply(200, mockResponse);

    const result = await getTest({ test_id: testId });

    expect(result.id).toBe(400);
    expect(result.title).toBe('Minimal Test');
    expect(result.custom_expected).toBeNull();
    expect(result.custom_preconds).toBeNull();
    expect(result.custom_steps_separated).toBeNull();
    expect(result.estimate).toBeNull();
    expect(result.estimate_forecast).toBeNull();
    expect(result.milestone_id).toBeNull();
    expect(result.refs).toBeNull();
    expect(result.labels).toEqual([]);
    expect(result.custom).toBeUndefined();
  });

  it('handles test with complex custom steps', async () => {
    const testId = 500;
    const mockResponse = {
      id: 500,
      title: 'Complex Test Steps',
      assignedto_id: 2,
      case_id: 300,
      custom_expected: 'Complex expected result',
      custom_preconds: 'Complex preconditions',
      custom_steps_separated: [
        {
          content: 'Navigate to the login page',
          expected: 'Login page is displayed',
        },
        {
          content: 'Enter valid credentials',
          expected: 'User is authenticated',
        },
        {
          content: 'Click on submit button',
          expected: 'User is redirected to dashboard',
        },
      ],
      estimate: '2m 30s',
      estimate_forecast: '3m',
      priority_id: 1,
      run_id: 15,
      status_id: 3,
      type_id: 3,
      milestone_id: 10,
      refs: 'REQ-456,REQ-789',
      labels: [
        {
          id: 5,
          title: 'critical',
        },
        {
          id: 6,
          title: 'regression',
        },
      ],
    };

    nock(baseApi)
      .get(`${apiPath}/get_test/${testId}`)
      .reply(200, mockResponse);

    const result = await getTest({ test_id: testId });

    expect(result.id).toBe(500);
    expect(result.title).toBe('Complex Test Steps');
    expect(result.custom_steps_separated).toHaveLength(3);
    expect(result.custom_steps_separated![0].content).toBe('Navigate to the login page');
    expect(result.custom_steps_separated![0].expected).toBe('Login page is displayed');
    expect(result.labels).toHaveLength(2);
    expect(result.labels![0].title).toBe('critical');
    expect(result.labels![1].title).toBe('regression');
  });

  it('throws error for non-existent test', async () => {
    const testId = 999;

    nock(baseApi)
      .get(`${apiPath}/get_test/${testId}`)
      .reply(400, { error: 'Invalid or unknown test' });

    await expect(getTest({ test_id: testId })).rejects.toThrow();
  });

  it('throws error for network issues', async () => {
    const testId = 123;

    nock(baseApi)
      .get(`${apiPath}/get_test/${testId}`)
      .replyWithError('Network error');

    await expect(getTest({ test_id: testId })).rejects.toThrow();
  });

  it('throws error for server errors', async () => {
    const testId = 123;

    nock(baseApi)
      .get(`${apiPath}/get_test/${testId}`)
      .reply(500, { error: 'Internal server error' });

    await expect(getTest({ test_id: testId })).rejects.toThrow();
  });

  it('throws error for authentication issues', async () => {
    const testId = 123;

    nock(baseApi)
      .get(`${apiPath}/get_test/${testId}`)
      .reply(403, { error: 'No access to the test' });

    await expect(getTest({ test_id: testId })).rejects.toThrow();
  });

  it('throws error for rate limiting', async () => {
    const testId = 123;

    nock(baseApi)
      .get(`${apiPath}/get_test/${testId}`)
      .reply(429, { error: 'Too many requests' });

    await expect(getTest({ test_id: testId })).rejects.toThrow();
  });
});
