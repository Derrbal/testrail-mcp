import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import nock from 'nock';
import { getCase } from '../src/services/testrailService';
import { config } from '../src/config';

describe('testrailService.getCase', () => {
  const baseApi = `${config.TESTRAIL_URL}`;
  const apiPath = '/index.php?/api/v2';

  beforeEach(() => {
    nock.disableNetConnect();
  });

  afterEach(() => {
    nock.cleanAll();
    nock.enableNetConnect();
  });

  it('returns normalized case', async () => {
    const caseId = 123;
    const scope = nock(baseApi)
      .get(`${apiPath}/get_case/${caseId}`)
      .reply(200, {
        id: caseId,
        title: 'Sample',
        section_id: 1,
        custom_field: 'x',
      });

    const result = await getCase(caseId);
    expect(result).toEqual(
      expect.objectContaining({ id: caseId, title: 'Sample', section_id: 1, custom: { custom_field: 'x' } }),
    );
    scope.done();
  });

  it('throws on 404', async () => {
    const caseId = 9999;
    const scope = nock(baseApi)
      .get(`${apiPath}/get_case/${caseId}`)
      .reply(404, { error: 'not found' });

    await expect(getCase(caseId)).rejects.toMatchObject({ type: 'not_found' });
    scope.done();
  });
});
