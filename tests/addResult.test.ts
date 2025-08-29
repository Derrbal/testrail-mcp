import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import nock from 'nock';
import { addResult } from '../src/services/testrailService';
import { config } from '../src/config';

describe('testrailService.addResult', () => {
  const baseApi = `${config.TESTRAIL_URL}`;
  const apiPath = '/index.php?/api/v2';

  beforeEach(() => {
    nock.disableNetConnect();
  });

  afterEach(() => {
    nock.cleanAll();
    nock.enableNetConnect();
  });

  it('adds basic test result successfully', async () => {
    const testId = 100;
    const mockResponse = {
      id: 12345,
      test_id: 100,
      status_id: 1,
      created_by: 15,
      created_on: 1752680592,
      comment: 'Test passed successfully',
      version: '1.0.0',
      elapsed: '30s',
    };

    nock(baseApi)
      .post(`${apiPath}/add_result/${testId}`)
      .reply(200, mockResponse);

    const result = await addResult({
      test_id: testId,
      status_id: 1,
      comment: 'Test passed successfully',
      version: '1.0.0',
      elapsed: '30s',
    });

    expect(result).toEqual({
      id: 12345,
      test_id: 100,
      status_id: 1,
      created_by: 15,
      created_on: 1752680592,
      comment: 'Test passed successfully',
      version: '1.0.0',
      elapsed: '30s',
      custom: undefined,
    });
  });

  it('adds test result with step results', async () => {
    const testId = 200;
    const mockResponse = {
      id: 12346,
      test_id: 200,
      status_id: 5,
      created_by: 15,
      created_on: 1752680592,
      comment: 'Test failed with step details',
      custom_step_results: [
        {
          content: 'Step 1: Navigate to home page',
          expected: 'User should be redirected to /home',
          actual: 'User was redirected to /home',
          status_id: 1,
        },
        {
          content: 'Step 2: Verify menu state',
          expected: 'All menus should be collapsed by default',
          actual: 'Menus were expanded by default',
          status_id: 5,
        },
      ],
    };

    nock(baseApi)
      .post(`${apiPath}/add_result/${testId}`)
      .reply(200, mockResponse);

    const result = await addResult({
      test_id: testId,
      status_id: 5,
      comment: 'Test failed with step details',
      custom_step_results: [
        {
          content: 'Step 1: Navigate to home page',
          expected: 'User should be redirected to /home',
          actual: 'User was redirected to /home',
          status_id: 1,
        },
        {
          content: 'Step 2: Verify menu state',
          expected: 'All menus should be collapsed by default',
          actual: 'Menus were expanded by default',
          status_id: 5,
        },
      ],
    });

    expect(result).toEqual({
      id: 12346,
      test_id: 200,
      status_id: 5,
      created_by: 15,
      created_on: 1752680592,
      comment: 'Test failed with step details',
      custom_step_results: [
        {
          content: 'Step 1: Navigate to home page',
          expected: 'User should be redirected to /home',
          actual: 'User was redirected to /home',
          status_id: 1,
        },
        {
          content: 'Step 2: Verify menu state',
          expected: 'All menus should be collapsed by default',
          actual: 'Menus were expanded by default',
          status_id: 5,
        },
      ],
      custom: undefined,
    });
  });

  it('adds test result with defects', async () => {
    const testId = 300;
    const mockResponse = {
      id: 12347,
      test_id: 300,
      status_id: 5,
      created_by: 15,
      created_on: 1752680592,
      comment: 'Test failed due to UI issues',
      defects: 'TR-123,TR-456',
      assignedto_id: 20,
    };

    nock(baseApi)
      .post(`${apiPath}/add_result/${testId}`)
      .reply(200, mockResponse);

    const result = await addResult({
      test_id: testId,
      status_id: 5,
      comment: 'Test failed due to UI issues',
      defects: 'TR-123,TR-456',
      assignedto_id: 20,
    });

    expect(result).toEqual({
      id: 12347,
      test_id: 300,
      status_id: 5,
      created_by: 15,
      created_on: 1752680592,
      comment: 'Test failed due to UI issues',
      defects: 'TR-123,TR-456',
      assignedto_id: 20,
      custom: undefined,
    });
  });

  it('adds test result with custom fields', async () => {
    const testId = 400;
    const mockResponse = {
      id: 12348,
      test_id: 400,
      status_id: 1,
      created_by: 15,
      created_on: 1752680592,
      comment: 'Test passed with custom data',
      custom_browser: 'Chrome',
      custom_environment: 'QA',
      custom_automation: true,
    };

    nock(baseApi)
      .post(`${apiPath}/add_result/${testId}`)
      .reply(200, mockResponse);

    const result = await addResult({
      test_id: testId,
      status_id: 1,
      comment: 'Test passed with custom data',
      custom: {
        custom_browser: 'Chrome',
        custom_environment: 'QA',
        custom_automation: true,
      },
    });

    expect(result).toEqual({
      id: 12348,
      test_id: 400,
      status_id: 1,
      created_by: 15,
      created_on: 1752680592,
      comment: 'Test passed with custom data',
      custom: {
        custom_browser: 'Chrome',
        custom_environment: 'QA',
        custom_automation: true,
      },
    });
  });

  it('handles minimal test result (only required fields)', async () => {
    const testId = 500;
    const mockResponse = {
      id: 12349,
      test_id: 500,
      status_id: 4,
      created_by: 15,
      created_on: 1752680592,
    };

    nock(baseApi)
      .post(`${apiPath}/add_result/${testId}`)
      .reply(200, mockResponse);

    const result = await addResult({
      test_id: testId,
      status_id: 4,
    });

    expect(result).toEqual({
      id: 12349,
      test_id: 500,
      status_id: 4,
      created_by: 15,
      created_on: 1752680592,
      custom: undefined,
    });
  });

  it('handles API error responses', async () => {
    const testId = 999;
    const errorResponse = {
      error: 'Invalid or unknown test.',
    };

    nock(baseApi)
      .post(`${apiPath}/add_result/${testId}`)
      .reply(400, errorResponse);

    await expect(
      addResult({
        test_id: testId,
        status_id: 1,
        comment: 'This should fail',
      })
    ).rejects.toThrow('HTTP 400: null');
  });

  it('handles network errors', async () => {
    const testId = 1000;

    nock(baseApi)
      .post(`${apiPath}/add_result/${testId}`)
      .replyWithError('Network error');

    await expect(
      addResult({
        test_id: testId,
        status_id: 1,
        comment: 'This should fail',
      })
    ).rejects.toThrow();
  });

  it('handles authentication errors', async () => {
    const testId = 1001;
    const errorResponse = {
      error: 'Authentication failed',
    };

    nock(baseApi)
      .post(`${apiPath}/add_result/${testId}`)
      .reply(403, errorResponse);

    await expect(
      addResult({
        test_id: testId,
        status_id: 1,
        comment: 'This should fail',
      })
    ).rejects.toThrow('HTTP 403: null');
  });
});
