import { describe, it, expect, beforeEach, vi } from 'vitest';
import { testRailClient } from '../src/clients/testrailClient';
import { getCases } from '../src/services/testrailService';

// Mock the testRailClient
vi.mock('../src/clients/testrailClient', () => ({
  testRailClient: {
    getCases: vi.fn(),
  },
}));

const mockTestRailClient = vi.mocked(testRailClient);

describe('getCases', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return paginated cases response', async () => {
    const mockResponse = {
      offset: 0,
      limit: 250,
      size: 2,
      _links: {
        next: null,
        prev: null,
      },
      cases: [
        {
          id: 1,
          title: 'Test case 1',
          section_id: 1,
          type_id: 1,
          priority_id: 2,
          refs: 'REF-1',
          created_on: 1646317844,
          updated_on: 1646317844,
          custom_automation_type: 0,
          custom_preconds: 'Preconditions',
        },
        {
          id: 2,
          title: 'Test case 2',
          section_id: 2,
          type_id: 2,
          priority_id: 1,
          refs: null,
          created_on: 1646317845,
          updated_on: 1646317845,
          custom_steps: 'Test steps',
        },
      ],
    };

    mockTestRailClient.getCases.mockResolvedValue(mockResponse);

    const filters = {
      project_id: 1,
      suite_id: 1,
    };

    const result = await getCases(filters);

    expect(mockTestRailClient.getCases).toHaveBeenCalledWith({
      project_id: 1,
      suite_id: 1,
    });

    expect(result).toEqual({
      offset: 0,
      limit: 250,
      size: 2,
      _links: {
        next: null,
        prev: null,
      },
      cases: [
        {
          id: 1,
          title: 'Test case 1',
          section_id: 1,
          type_id: 1,
          priority_id: 2,
          refs: 'REF-1',
          created_on: 1646317844,
          updated_on: 1646317844,
          custom: {
            custom_automation_type: 0,
            custom_preconds: 'Preconditions',
          },
        },
        {
          id: 2,
          title: 'Test case 2',
          section_id: 2,
          type_id: 2,
          priority_id: 1,
          refs: null,
          created_on: 1646317845,
          updated_on: 1646317845,
          custom: {
            custom_steps: 'Test steps',
          },
        },
      ],
    });
  });

  it('should handle cases with no custom fields', async () => {
    const mockResponse = {
      offset: 0,
      limit: 250,
      size: 1,
      _links: {
        next: null,
        prev: null,
      },
      cases: [
        {
          id: 1,
          title: 'Simple test case',
          section_id: 1,
          type_id: 1,
          priority_id: 2,
          refs: null,
          created_on: 1646317844,
          updated_on: 1646317844,
        },
      ],
    };

    mockTestRailClient.getCases.mockResolvedValue(mockResponse);

    const filters = {
      project_id: 1,
    };

    const result = await getCases(filters);

    expect(result.cases[0]).toEqual({
      id: 1,
      title: 'Simple test case',
      section_id: 1,
      type_id: 1,
      priority_id: 2,
      refs: null,
      created_on: 1646317844,
      updated_on: 1646317844,
      custom: undefined,
    });
  });

  it('should pass all filter parameters correctly', async () => {
    const mockResponse = {
      offset: 10,
      limit: 50,
      size: 100,
      _links: {
        next: '/api/v2/get_cases/1&limit=50&offset=60',
        prev: null,
      },
      cases: [],
    };

    mockTestRailClient.getCases.mockResolvedValue(mockResponse);

    const filters = {
      project_id: 1,
      suite_id: 2,
      created_after: 1646317800,
      created_before: 1646317900,
      created_by: [1, 2],
      filter: 'login',
      limit: 50,
      milestone_id: [1, 2, 3],
      offset: 10,
      priority_id: [1, 2],
      refs: 'REF-123',
      section_id: 5,
      template_id: [1],
      type_id: [1, 2],
      updated_after: 1646317800,
      updated_before: 1646317900,
      updated_by: 3,
      label_id: [1, 2],
    };

    const result = await getCases(filters);

    expect(mockTestRailClient.getCases).toHaveBeenCalledWith(filters);
    expect(result.offset).toBe(10);
    expect(result.limit).toBe(50);
    expect(result.size).toBe(100);
    expect(result._links?.next).toBe('/api/v2/get_cases/1&limit=50&offset=60');
  });

  it('should handle null refs correctly', async () => {
    const mockResponse = {
      offset: 0,
      limit: 250,
      size: 1,
      _links: {
        next: null,
        prev: null,
      },
      cases: [
        {
          id: 1,
          title: 'Test case with null refs',
          section_id: 1,
          type_id: 1,
          priority_id: 2,
          refs: null,
          created_on: 1646317844,
          updated_on: 1646317844,
        },
      ],
    };

    mockTestRailClient.getCases.mockResolvedValue(mockResponse);

    const filters = {
      project_id: 1,
    };

    const result = await getCases(filters);

    expect(result.cases[0].refs).toBe(null);
  });

  it('should handle undefined refs correctly', async () => {
    const mockResponse = {
      offset: 0,
      limit: 250,
      size: 1,
      _links: {
        next: null,
        prev: null,
      },
      cases: [
        {
          id: 1,
          title: 'Test case with undefined refs',
          section_id: 1,
          type_id: 1,
          priority_id: 2,
          created_on: 1646317844,
          updated_on: 1646317844,
        },
      ],
    };

    mockTestRailClient.getCases.mockResolvedValue(mockResponse);

    const filters = {
      project_id: 1,
    };

    const result = await getCases(filters);

    expect(result.cases[0].refs).toBe(null);
  });
});
