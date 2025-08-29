import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import nock from 'nock';
import { updateCase } from '../src/services/testrailService';
import { config } from '../src/config';

describe('testrailService.updateCase', () => {
  const baseApi = `${config.TESTRAIL_URL}`;
  const apiPath = '/index.php?/api/v2';

  beforeEach(() => {
    nock.disableNetConnect();
  });

  afterEach(() => {
    nock.cleanAll();
    nock.enableNetConnect();
  });

  it('updates case with basic fields', async () => {
    const caseId = 123;
    const updates = {
      title: 'Updated Title',
      section_id: 2,
      type_id: 1,
      priority_id: 3,
      refs: 'REQ-456',
    };

    const scope = nock(baseApi)
      .post(`${apiPath}/update_case/${caseId}`, updates)
      .reply(200, {
        id: caseId,
        title: 'Updated Title',
        section_id: 2,
        type_id: 1,
        priority_id: 3,
        refs: 'REQ-456',
        updated_on: Date.now(),
      });

    const result = await updateCase(caseId, updates);
    expect(result).toEqual(
      expect.objectContaining({
        id: caseId,
        title: 'Updated Title',
        section_id: 2,
        type_id: 1,
        priority_id: 3,
        refs: 'REQ-456',
      }),
    );
    scope.done();
  });

  it('updates case with custom fields', async () => {
    const caseId = 123;
    const updates = {
      title: 'Test with Custom Fields',
      custom: {
        'custom_automation_type': 'automated',
        'severity': 'high', // Should be prefixed with custom_
      },
    };

    const expectedPayload = {
      title: 'Test with Custom Fields',
      custom_automation_type: 'automated',
      custom_severity: 'high',
    };

    const scope = nock(baseApi)
      .post(`${apiPath}/update_case/${caseId}`, expectedPayload)
      .reply(200, {
        id: caseId,
        title: 'Test with Custom Fields',
        custom_automation_type: 'automated',
        custom_severity: 'high',
        updated_on: Date.now(),
      });

    const result = await updateCase(caseId, updates);
    expect(result).toEqual(
      expect.objectContaining({
        id: caseId,
        title: 'Test with Custom Fields',
        custom: {
          custom_automation_type: 'automated',
          custom_severity: 'high',
        },
      }),
    );
    scope.done();
  });

  it('preserves custom_ prefix in field names', async () => {
    const caseId = 123;
    const updates = {
      custom: {
        'custom_field1': 'value1',
        'field2': 'value2', // Should get custom_ prefix
      },
    };

    const expectedPayload = {
      custom_field1: 'value1',
      custom_field2: 'value2',
    };

    const scope = nock(baseApi)
      .post(`${apiPath}/update_case/${caseId}`, expectedPayload)
      .reply(200, {
        id: caseId,
        custom_field1: 'value1',
        custom_field2: 'value2',
      });

    const result = await updateCase(caseId, updates);
    expect(result.custom).toEqual({
      custom_field1: 'value1',
      custom_field2: 'value2',
    });
    scope.done();
  });

  it('handles partial updates', async () => {
    const caseId = 123;
    const updates = {
      title: 'Only Title Update',
    };

    const scope = nock(baseApi)
      .post(`${apiPath}/update_case/${caseId}`, { title: 'Only Title Update' })
      .reply(200, {
        id: caseId,
        title: 'Only Title Update',
        section_id: 1,
        type_id: 1,
        priority_id: 2,
      });

    const result = await updateCase(caseId, updates);
    expect(result).toEqual(
      expect.objectContaining({
        id: caseId,
        title: 'Only Title Update',
        section_id: 1,
        type_id: 1,
        priority_id: 2,
      }),
    );
    scope.done();
  });

  it('throws on 404', async () => {
    const caseId = 9999;
    const updates = { title: 'Non-existent Case' };
    
    const scope = nock(baseApi)
      .post(`${apiPath}/update_case/${caseId}`)
      .reply(404, { error: 'not found' });

    await expect(updateCase(caseId, updates)).rejects.toMatchObject({ type: 'not_found' });
    scope.done();
  });

  it('throws on authentication error', async () => {
    const caseId = 123;
    const updates = { title: 'Unauthorized Update' };
    
    const scope = nock(baseApi)
      .post(`${apiPath}/update_case/${caseId}`)
      .reply(401, { error: 'unauthorized' });

    await expect(updateCase(caseId, updates)).rejects.toMatchObject({ type: 'auth' });
    scope.done();
  });
});
