import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import nock from 'nock';
import { getSections } from '../src/services/testrailService';
import { config } from '../src/config';

describe('testrailService.getSections', () => {
  const baseApi = `${config.TESTRAIL_URL}`;
  const apiPath = '/index.php?/api/v2';

  beforeEach(() => {
    nock.disableNetConnect();
  });

  afterEach(() => {
    nock.cleanAll();
    nock.enableNetConnect();
  });

  it('returns normalized sections list with pagination', async () => {
    const projectId = 1;
    const suiteId = 2;
    const mockResponse = {
      offset: 0,
      limit: 250,
      size: 23,
      _links: {
        next: null,
        prev: null,
      },
      sections: [
        {
          depth: 0,
          display_order: 1,
          id: 1,
          name: 'Prerequisites',
          parent_id: null,
          suite_id: 2,
        },
        {
          depth: 0,
          display_order: 2,
          id: 2,
          name: 'Documentation & Help',
          parent_id: null,
          suite_id: 2,
        },
        {
          depth: 1,
          display_order: 3,
          id: 3,
          name: 'Licensing & Terms',
          parent_id: 2,
          suite_id: 2,
        },
      ],
    };

    const scope = nock(baseApi)
      .get(`${apiPath}/get_sections/${projectId}&suite_id=${suiteId}`)
      .reply(200, mockResponse);

    const result = await getSections({ project_id: projectId, suite_id: suiteId });

    expect(result).toEqual({
      offset: 0,
      limit: 250,
      size: 23,
      _links: {
        next: null,
        prev: null,
      },
      sections: [
        {
          depth: 0,
          display_order: 1,
          id: 1,
          name: 'Prerequisites',
          parent_id: null,
          suite_id: 2,
        },
        {
          depth: 0,
          display_order: 2,
          id: 2,
          name: 'Documentation & Help',
          parent_id: null,
          suite_id: 2,
        },
        {
          depth: 1,
          display_order: 3,
          id: 3,
          name: 'Licensing & Terms',
          parent_id: 2,
          suite_id: 2,
        },
      ],
    });
    scope.done();
  });

  it('handles sections with custom fields', async () => {
    const projectId = 1;
    const suiteId = 2;
    const mockResponse = {
      offset: 0,
      limit: 250,
      size: 1,
      _links: {
        next: null,
        prev: null,
      },
      sections: [
        {
          depth: 0,
          display_order: 1,
          id: 1,
          name: 'Test Section',
          parent_id: null,
          suite_id: 2,
          custom_section_type: 'functional',
          custom_priority: 'high',
        },
      ],
    };

    const scope = nock(baseApi)
      .get(`${apiPath}/get_sections/${projectId}&suite_id=${suiteId}`)
      .reply(200, mockResponse);

    const result = await getSections({ project_id: projectId, suite_id: suiteId });

    expect(result.sections[0]).toEqual({
      depth: 0,
      display_order: 1,
      id: 1,
      name: 'Test Section',
      parent_id: null,
      suite_id: 2,
      custom: {
        custom_section_type: 'functional',
        custom_priority: 'high',
      },
    });
    scope.done();
  });

  it('handles sections without custom fields', async () => {
    const projectId = 1;
    const suiteId = 2;
    const mockResponse = {
      offset: 0,
      limit: 250,
      size: 1,
      _links: {
        next: null,
        prev: null,
      },
      sections: [
        {
          depth: 0,
          display_order: 1,
          id: 1,
          name: 'Basic Section',
          parent_id: null,
          suite_id: 2,
        },
      ],
    };

    const scope = nock(baseApi)
      .get(`${apiPath}/get_sections/${projectId}&suite_id=${suiteId}`)
      .reply(200, mockResponse);

    const result = await getSections({ project_id: projectId, suite_id: suiteId });

    expect(result.sections[0]).toEqual({
      depth: 0,
      display_order: 1,
      id: 1,
      name: 'Basic Section',
      parent_id: null,
      suite_id: 2,
    });
    scope.done();
  });

  it('handles pagination parameters', async () => {
    const projectId = 1;
    const suiteId = 2;
    const limit = 10;
    const offset = 20;
    const mockResponse = {
      offset: 20,
      limit: 10,
      size: 30,
      _links: {
        next: 'next_page_url',
        prev: 'prev_page_url',
      },
      sections: [
        {
          depth: 0,
          display_order: 21,
          id: 21,
          name: 'Paged Section',
          parent_id: null,
          suite_id: 2,
        },
      ],
    };

    const scope = nock(baseApi)
      .get(`${apiPath}/get_sections/${projectId}&suite_id=${suiteId}&limit=${limit}&offset=${offset}`)
      .reply(200, mockResponse);

    const result = await getSections({ 
      project_id: projectId, 
      suite_id: suiteId, 
      limit, 
      offset 
    });

    expect(result).toEqual({
      offset: 20,
      limit: 10,
      size: 30,
      _links: {
        next: 'next_page_url',
        prev: 'prev_page_url',
      },
      sections: [
        {
          depth: 0,
          display_order: 21,
          id: 21,
          name: 'Paged Section',
          parent_id: null,
          suite_id: 2,
        },
      ],
    });
    scope.done();
  });

  it('handles project without suite_id (single suite mode)', async () => {
    const projectId = 1;
    const mockResponse = {
      offset: 0,
      limit: 250,
      size: 5,
      _links: {
        next: null,
        prev: null,
      },
      sections: [
        {
          depth: 0,
          display_order: 1,
          id: 1,
          name: 'Single Suite Section',
          parent_id: null,
          suite_id: 1,
        },
      ],
    };

    const scope = nock(baseApi)
      .get(`${apiPath}/get_sections/${projectId}`)
      .reply(200, mockResponse);

    const result = await getSections({ project_id: projectId });

    expect(result.sections[0]).toEqual({
      depth: 0,
      display_order: 1,
      id: 1,
      name: 'Single Suite Section',
      parent_id: null,
      suite_id: 1,
    });
    scope.done();
  });

  it('throws on 404 - project not found', async () => {
    const projectId = 9999;
    
    const scope = nock(baseApi)
      .get(`${apiPath}/get_sections/${projectId}`)
      .reply(404, { error: 'not found' });

    await expect(getSections({ project_id: projectId })).rejects.toMatchObject({ 
      type: 'not_found' 
    });
    scope.done();
  });

  it('throws on authentication error', async () => {
    const projectId = 1;
    
    const scope = nock(baseApi)
      .get(`${apiPath}/get_sections/${projectId}`)
      .reply(401, { error: 'unauthorized' });

    await expect(getSections({ project_id: projectId })).rejects.toMatchObject({ 
      type: 'auth' 
    });
    scope.done();
  });

  it('throws on permission error', async () => {
    const projectId = 1;
    
    const scope = nock(baseApi)
      .get(`${apiPath}/get_sections/${projectId}`)
      .reply(403, { error: 'forbidden' });

    await expect(getSections({ project_id: projectId })).rejects.toMatchObject({ 
      type: 'auth' 
    });
    scope.done();
  });

  it('throws on rate limit error', async () => {
    const projectId = 1;
    
    const scope = nock(baseApi)
      .get(`${apiPath}/get_sections/${projectId}`)
      .reply(429, { error: 'too many requests' });

    await expect(getSections({ project_id: projectId })).rejects.toMatchObject({ 
      type: 'rate_limited' 
    });
    scope.done();
  });

  it('throws on server error', async () => {
    const projectId = 1;
    
    const scope = nock(baseApi)
      .get(`${apiPath}/get_sections/${projectId}`)
      .reply(500, { error: 'internal server error' });

    await expect(getSections({ project_id: projectId })).rejects.toMatchObject({ 
      type: 'server' 
    });
    scope.done();
  });

  it('throws on network error', async () => {
    const projectId = 1;
    
    const scope = nock(baseApi)
      .get(`${apiPath}/get_sections/${projectId}`)
      .replyWithError('Network error');

    await expect(getSections({ project_id: projectId })).rejects.toMatchObject({ 
      type: 'network' 
    });
    scope.done();
  });

  it('throws on invalid paginated response (sections not an array)', async () => {
    const projectId = 1;
    const invalidResponse = {
      offset: 0,
      limit: 250,
      size: 1,
      _links: {
        next: null,
        prev: null,
      },
      sections: 'not an array', // Invalid response
    };

    const scope = nock(baseApi)
      .get(`${apiPath}/get_sections/${projectId}`)
      .reply(200, invalidResponse);

    await expect(getSections({ project_id: projectId })).rejects.toThrow(
      'API returned response with non-array sections field'
    );
    scope.done();
  });

  it('throws on completely unexpected response format', async () => {
    const projectId = 1;
    const unexpectedResponse = 'not an object';

    const scope = nock(baseApi)
      .get(`${apiPath}/get_sections/${projectId}`)
      .reply(200, unexpectedResponse);

    await expect(getSections({ project_id: projectId })).rejects.toThrow(
      'API returned unexpected response format'
    );
    scope.done();
  });

  it('handles nested sections with parent relationships', async () => {
    const projectId = 1;
    const suiteId = 2;
    const mockResponse = {
      offset: 0,
      limit: 250,
      size: 3,
      _links: {
        next: null,
        prev: null,
      },
      sections: [
        {
          depth: 0,
          display_order: 1,
          id: 1,
          name: 'Parent Section',
          parent_id: null,
          suite_id: 2,
        },
        {
          depth: 1,
          display_order: 2,
          id: 2,
          name: 'Child Section 1',
          parent_id: 1,
          suite_id: 2,
        },
        {
          depth: 1,
          display_order: 3,
          id: 3,
          name: 'Child Section 2',
          parent_id: 1,
          suite_id: 2,
        },
      ],
    };

    const scope = nock(baseApi)
      .get(`${apiPath}/get_sections/${projectId}&suite_id=${suiteId}`)
      .reply(200, mockResponse);

    const result = await getSections({ project_id: projectId, suite_id: suiteId });

    expect(result.sections).toHaveLength(3);
    expect(result.sections[0]).toEqual({
      depth: 0,
      display_order: 1,
      id: 1,
      name: 'Parent Section',
      parent_id: null,
      suite_id: 2,
    });
    expect(result.sections[1]).toEqual({
      depth: 1,
      display_order: 2,
      id: 2,
      name: 'Child Section 1',
      parent_id: 1,
      suite_id: 2,
    });
    expect(result.sections[2]).toEqual({
      depth: 1,
      display_order: 3,
      id: 3,
      name: 'Child Section 2',
      parent_id: 1,
      suite_id: 2,
    });
    scope.done();
  });
});
