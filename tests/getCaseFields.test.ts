import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import nock from 'nock';
import { getCaseFields } from '../src/services/testrailService';
import { config } from '../src/config';

describe('testrailService.getCaseFields', () => {
  const baseApi = `${config.TESTRAIL_URL}`;
  const apiPath = '/index.php?/api/v2';

  beforeEach(() => {
    nock.disableNetConnect();
  });

  afterEach(() => {
    nock.cleanAll();
    nock.enableNetConnect();
  });

  it('returns normalized case fields', async () => {
    const mockFields = [
      {
        configs: [
          {
            context: {
              is_global: true,
              project_ids: null
            },
            id: "config1",
            options: {
              default_value: "",
              format: "markdown",
              is_required: false,
              rows: "5"
            }
          }
        ],
        description: "The preconditions of this test case...",
        display_order: 1,
        id: 1,
        label: "Preconditions",
        name: "preconds",
        system_name: "custom_preconds",
        type_id: 3
      }
    ];

    const scope = nock(baseApi)
      .get(`${apiPath}/get_case_fields`)
      .reply(200, mockFields);

    const result = await getCaseFields();
    expect(result).toEqual(mockFields);
    scope.done();
  });

  it('throws on 404', async () => {
    const scope = nock(baseApi)
      .get(`${apiPath}/get_case_fields`)
      .reply(404, { error: 'not found' });

    await expect(getCaseFields()).rejects.toMatchObject({ type: 'not_found' });
    scope.done();
  });

  it('throws on 401', async () => {
    const scope = nock(baseApi)
      .get(`${apiPath}/get_case_fields`)
      .reply(401, { error: 'unauthorized' });

    await expect(getCaseFields()).rejects.toMatchObject({ type: 'auth' });
    scope.done();
  });

  it('throws on 429', async () => {
    const scope = nock(baseApi)
      .get(`${apiPath}/get_case_fields`)
      .reply(429, { error: 'rate limited' });

    await expect(getCaseFields()).rejects.toMatchObject({ type: 'rate_limited' });
    scope.done();
  });

  it('throws on 500', async () => {
    const scope = nock(baseApi)
      .get(`${apiPath}/get_case_fields`)
      .reply(500, { error: 'server error' });

    await expect(getCaseFields()).rejects.toMatchObject({ type: 'server' });
    scope.done();
  });
});
