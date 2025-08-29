import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import nock from 'nock';
import { addCase } from '../src/services/testrailService';
import { config } from '../src/config';

describe('testrailService.addCase', () => {
  const baseApi = `${config.TESTRAIL_URL}`;
  const apiPath = '/index.php?/api/v2';

  beforeEach(() => {
    nock.disableNetConnect();
  });

  afterEach(() => {
    nock.cleanAll();
    nock.enableNetConnect();
  });

  it('creates case with basic fields', async () => {
    const sectionId = 123;
    const caseData = {
      title: 'Test Case Title',
      section_id: sectionId,
      type_id: 1,
      priority_id: 2,
    };

    const mockResponse = {
      id: 456,
      title: 'Test Case Title',
      section_id: sectionId,
      type_id: 1,
      priority_id: 2,
      refs: null,
      created_on: 1234567890,
      updated_on: 1234567890,
    };

    const scope = nock(baseApi)
      .post(`${apiPath}/add_case/${sectionId}`, caseData)
      .reply(200, mockResponse);

    const result = await addCase(caseData);
    expect(result).toEqual({
      id: 456,
      title: 'Test Case Title',
      section_id: sectionId,
      type_id: 1,
      priority_id: 2,
      refs: null,
      created_on: 1234567890,
      updated_on: 1234567890,
      custom: undefined,
    });
    scope.done();
  });

  it('creates case with custom fields', async () => {
    const sectionId = 123;
    const caseData = {
      title: 'Test Case with Custom Fields',
      section_id: sectionId,
      custom: {
        custom_automation_type: 1,
        custom_environment: 2,
      },
    };

    const mockResponse = {
      id: 456,
      title: 'Test Case with Custom Fields',
      section_id: sectionId,
      refs: null,
      created_on: 1234567890,
      updated_on: 1234567890,
      custom_automation_type: 1,
      custom_environment: 2,
    };

    const scope = nock(baseApi)
      .post(`${apiPath}/add_case/${sectionId}`, {
        title: 'Test Case with Custom Fields',
        section_id: sectionId,
        custom_automation_type: 1,
        custom_environment: 2,
      })
      .reply(200, mockResponse);

    const result = await addCase(caseData);
    expect(result).toEqual({
      id: 456,
      title: 'Test Case with Custom Fields',
      section_id: sectionId,
      refs: null,
      created_on: 1234567890,
      updated_on: 1234567890,
      custom: {
        custom_automation_type: 1,
        custom_environment: 2,
      },
    });
    scope.done();
  });

  it('creates case with references', async () => {
    const sectionId = 123;
    const caseData = {
      title: 'Test Case with References',
      section_id: sectionId,
      refs: 'REQ-123,REQ-456',
    };

    const mockResponse = {
      id: 456,
      title: 'Test Case with References',
      section_id: sectionId,
      refs: 'REQ-123,REQ-456',
      created_on: 1234567890,
      updated_on: 1234567890,
    };

    const scope = nock(baseApi)
      .post(`${apiPath}/add_case/${sectionId}`, caseData)
      .reply(200, mockResponse);

    const result = await addCase(caseData);
    expect(result).toEqual({
      id: 456,
      title: 'Test Case with References',
      section_id: sectionId,
      refs: 'REQ-123,REQ-456',
      created_on: 1234567890,
      updated_on: 1234567890,
      custom: undefined,
    });
    scope.done();
  });

  it('throws on 404 - section not found', async () => {
    const sectionId = 9999;
    const caseData = {
      title: 'Test Case',
      section_id: sectionId,
    };

    const scope = nock(baseApi)
      .post(`${apiPath}/add_case/${sectionId}`, caseData)
      .reply(404, { error: 'not found' });

    await expect(addCase(caseData)).rejects.toMatchObject({ type: 'not_found' });
    scope.done();
  });

  it('throws on 401 - authentication error', async () => {
    const sectionId = 123;
    const caseData = {
      title: 'Test Case',
      section_id: sectionId,
    };

    const scope = nock(baseApi)
      .post(`${apiPath}/add_case/${sectionId}`, caseData)
      .reply(401, { error: 'unauthorized' });

    await expect(addCase(caseData)).rejects.toMatchObject({ type: 'auth' });
    scope.done();
  });

  it('throws on 429 - rate limited', async () => {
    const sectionId = 123;
    const caseData = {
      title: 'Test Case',
      section_id: sectionId,
    };

    const scope = nock(baseApi)
      .post(`${apiPath}/add_case/${sectionId}`, caseData)
      .reply(429, { error: 'rate limited' });

    await expect(addCase(caseData)).rejects.toMatchObject({ type: 'rate_limited' });
    scope.done();
  });

  it('throws on 500 - server error', async () => {
    const sectionId = 123;
    const caseData = {
      title: 'Test Case',
      section_id: sectionId,
    };

    const scope = nock(baseApi)
      .post(`${apiPath}/add_case/${sectionId}`, caseData)
      .reply(500, { error: 'server error' });

    await expect(addCase(caseData)).rejects.toMatchObject({ type: 'server' });
    scope.done();
  });
});
