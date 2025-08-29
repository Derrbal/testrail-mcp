import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import nock from 'nock';
import { updateTest } from '../src/services/testrailService';
import { config } from '../src/config';

describe('testrailService.updateTest', () => {
  const baseApi = `${config.TESTRAIL_URL}`;
  const apiPath = '/index.php?/api/v2';

  beforeEach(() => {
    nock.disableNetConnect();
  });

  afterEach(() => {
    nock.cleanAll();
    nock.enableNetConnect();
  });

  it('updates test with labels', async () => {
    const testId = 123;
    const updates = {
      labels: ['label1', 'label2', 3],
    };

    const scope = nock(baseApi)
      .post(`${apiPath}/update_test/${testId}`, updates)
      .reply(200, {
        id: testId,
        title: 'Test Title',
        assignedto_id: 1,
        case_id: 456,
        priority_id: 2,
        run_id: 789,
        status_id: 5,
        type_id: 4,
        labels: [
          { id: 1, title: 'label1' },
          { id: 2, title: 'label2' },
          { id: 3, title: 'label3' },
        ],
      });

    const result = await updateTest(testId, updates);
    expect(result).toEqual(
      expect.objectContaining({
        id: testId,
        title: 'Test Title',
        labels: [
          { id: 1, title: 'label1' },
          { id: 2, title: 'label2' },
          { id: 3, title: 'label3' },
        ],
      }),
    );
    scope.done();
  });

  it('updates test with custom fields', async () => {
    const testId = 123;
    const updates = {
      custom: {
        custom_field1: 'value1',
        custom_field2: 'value2',
      },
    };

    const scope = nock(baseApi)
      .post(`${apiPath}/update_test/${testId}`, {
        custom_field1: 'value1',
        custom_field2: 'value2',
      })
      .reply(200, {
        id: testId,
        title: 'Test Title',
        assignedto_id: 1,
        case_id: 456,
        priority_id: 2,
        run_id: 789,
        status_id: 5,
        type_id: 4,
        custom_field1: 'value1',
        custom_field2: 'value2',
      });

    const result = await updateTest(testId, updates);
    expect(result).toEqual(
      expect.objectContaining({
        id: testId,
        custom: {
          custom_field1: 'value1',
          custom_field2: 'value2',
        },
      }),
    );
    scope.done();
  });

  it('updates test with both labels and custom fields', async () => {
    const testId = 123;
    const updates = {
      labels: ['label1', 2],
      custom: {
        custom_field1: 'value1',
      },
    };

    const scope = nock(baseApi)
      .post(`${apiPath}/update_test/${testId}`, {
        labels: ['label1', 2],
        custom_field1: 'value1',
      })
      .reply(200, {
        id: testId,
        title: 'Test Title',
        assignedto_id: 1,
        case_id: 456,
        priority_id: 2,
        run_id: 789,
        status_id: 5,
        type_id: 4,
        labels: [
          { id: 1, title: 'label1' },
          { id: 2, title: 'label2' },
        ],
        custom_field1: 'value1',
      });

    const result = await updateTest(testId, updates);
    expect(result).toEqual(
      expect.objectContaining({
        id: testId,
        labels: [
          { id: 1, title: 'label1' },
          { id: 2, title: 'label2' },
        ],
        custom: {
          custom_field1: 'value1',
        },
      }),
    );
    scope.done();
  });

  it('handles partial updates with only labels', async () => {
    const testId = 123;
    const updates = {
      labels: ['only-label'],
    };

    const scope = nock(baseApi)
      .post(`${apiPath}/update_test/${testId}`, { labels: ['only-label'] })
      .reply(200, {
        id: testId,
        title: 'Test Title',
        assignedto_id: 1,
        case_id: 456,
        priority_id: 2,
        run_id: 789,
        status_id: 5,
        type_id: 4,
        labels: [{ id: 1, title: 'only-label' }],
      });

    const result = await updateTest(testId, updates);
    expect(result).toEqual(
      expect.objectContaining({
        id: testId,
        labels: [{ id: 1, title: 'only-label' }],
      }),
    );
    scope.done();
  });

  it('throws on 404', async () => {
    const testId = 9999;
    const updates = { labels: ['non-existent-test'] };
    
    const scope = nock(baseApi)
      .post(`${apiPath}/update_test/${testId}`)
      .reply(404, { error: 'not found' });

    await expect(updateTest(testId, updates)).rejects.toMatchObject({ type: 'not_found' });
    scope.done();
  });

  it('throws on authentication error', async () => {
    const testId = 123;
    const updates = { labels: ['unauthorized-update'] };
    
    const scope = nock(baseApi)
      .post(`${apiPath}/update_test/${testId}`)
      .reply(401, { error: 'unauthorized' });

    await expect(updateTest(testId, updates)).rejects.toMatchObject({ type: 'auth' });
    scope.done();
  });

  it('throws on server error', async () => {
    const testId = 123;
    const updates = { labels: ['server-error'] };
    
    const scope = nock(baseApi)
      .post(`${apiPath}/update_test/${testId}`)
      .reply(500, { error: 'internal server error' });

    await expect(updateTest(testId, updates)).rejects.toMatchObject({ type: 'server' });
    scope.done();
  });

  it('handles empty labels array', async () => {
    const testId = 123;
    const updates = {
      labels: [],
    };

    const scope = nock(baseApi)
      .post(`${apiPath}/update_test/${testId}`, { labels: [] })
      .reply(200, {
        id: testId,
        title: 'Test Title',
        assignedto_id: 1,
        case_id: 456,
        priority_id: 2,
        run_id: 789,
        status_id: 5,
        type_id: 4,
        labels: [],
      });

    const result = await updateTest(testId, updates);
    expect(result).toEqual(
      expect.objectContaining({
        id: testId,
        labels: [],
      }),
    );
    scope.done();
  });

  it('handles mixed label types (string and number)', async () => {
    const testId = 123;
    const updates = {
      labels: ['string-label', 42, 'another-string', 100],
    };

    const scope = nock(baseApi)
      .post(`${apiPath}/update_test/${testId}`, { labels: ['string-label', 42, 'another-string', 100] })
      .reply(200, {
        id: testId,
        title: 'Test Title',
        assignedto_id: 1,
        case_id: 456,
        priority_id: 2,
        run_id: 789,
        status_id: 5,
        type_id: 4,
        labels: [
          { id: 1, title: 'string-label' },
          { id: 42, title: 'label42' },
          { id: 2, title: 'another-string' },
          { id: 100, title: 'label100' },
        ],
      });

    const result = await updateTest(testId, updates);
    expect(result).toEqual(
      expect.objectContaining({
        id: testId,
        labels: [
          { id: 1, title: 'string-label' },
          { id: 42, title: 'label42' },
          { id: 2, title: 'another-string' },
          { id: 100, title: 'label100' },
        ],
      }),
    );
    scope.done();
  });
});
