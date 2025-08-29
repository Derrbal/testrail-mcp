import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getSuites } from '../src/services/testrailService';
import { testRailClient } from '../src/clients/testrailClient';

// Mock the testRailClient
vi.mock('../src/clients/testrailClient', () => ({
  testRailClient: {
    getSuites: vi.fn(),
  },
}));

describe('getSuites', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return suites for a valid project ID', async () => {
    const mockSuites = [
      {
        id: 1,
        name: 'Regression Test Suite',
        description: 'Main regression test suite',
        project_id: 61,
        url: 'https://test.testrail.com/index.php?/suites/view/1',
        is_baseline: false,
        is_master: true,
        is_completed: false,
        completed_on: null,
        created_on: 1640995200,
        created_by: 1,
        updated_on: 1640995200,
        updated_by: 1,
      },
      {
        id: 2,
        name: 'Smoke Test Suite',
        description: 'Quick smoke tests',
        project_id: 61,
        url: 'https://test.testrail.com/index.php?/suites/view/2',
        is_baseline: false,
        is_master: false,
        is_completed: false,
        completed_on: null,
        created_on: 1640995200,
        created_by: 1,
        updated_on: 1640995200,
        updated_by: 1,
      },
    ];

    vi.mocked(testRailClient.getSuites).mockResolvedValue(mockSuites);

    const result = await getSuites(61);

    expect(testRailClient.getSuites).toHaveBeenCalledWith(61);
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({
      id: 1,
      name: 'Regression Test Suite',
      description: 'Main regression test suite',
      project_id: 61,
      url: 'https://test.testrail.com/index.php?/suites/view/1',
      is_baseline: false,
      is_master: true,
      is_completed: false,
      completed_on: null,
      created_on: 1640995200,
      created_by: 1,
      updated_on: 1640995200,
      updated_by: 1,
      custom: undefined,
    });
    expect(result[1]).toEqual({
      id: 2,
      name: 'Smoke Test Suite',
      description: 'Quick smoke tests',
      project_id: 61,
      url: 'https://test.testrail.com/index.php?/suites/view/2',
      is_baseline: false,
      is_master: false,
      is_completed: false,
      completed_on: null,
      created_on: 1640995200,
      created_by: 1,
      updated_on: 1640995200,
      updated_by: 1,
      custom: undefined,
    });
  });

  it('should handle suites with custom fields', async () => {
    const mockSuites = [
      {
        id: 1,
        name: 'Custom Test Suite',
        description: 'Suite with custom fields',
        project_id: 61,
        url: 'https://test.testrail.com/index.php?/suites/view/1',
        is_baseline: false,
        is_master: true,
        is_completed: false,
        completed_on: null,
        created_on: 1640995200,
        created_by: 1,
        updated_on: 1640995200,
        updated_by: 1,
        custom_automation_type: 'cypress',
        custom_priority: 'high',
        custom_environment: 'staging',
      },
    ];

    vi.mocked(testRailClient.getSuites).mockResolvedValue(mockSuites);

    const result = await getSuites(61);

    expect(result).toHaveLength(1);
    expect(result[0].custom).toEqual({
      custom_automation_type: 'cypress',
      custom_priority: 'high',
      custom_environment: 'staging',
    });
  });

  it('should handle empty suites array', async () => {
    vi.mocked(testRailClient.getSuites).mockResolvedValue([]);

    const result = await getSuites(61);

    expect(testRailClient.getSuites).toHaveBeenCalledWith(61);
    expect(result).toEqual([]);
  });

  it('should propagate errors from the client', async () => {
    const error = new Error('TestRail API error');
    vi.mocked(testRailClient.getSuites).mockRejectedValue(error);

    await expect(getSuites(61)).rejects.toThrow('TestRail API error');
    expect(testRailClient.getSuites).toHaveBeenCalledWith(61);
  });

  it('should handle suites with minimal required fields', async () => {
    const mockSuites = [
      {
        id: 1,
        name: 'Minimal Suite',
        project_id: 61,
        url: 'https://test.testrail.com/index.php?/suites/view/1',
      },
    ];

    vi.mocked(testRailClient.getSuites).mockResolvedValue(mockSuites);

    const result = await getSuites(61);

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      id: 1,
      name: 'Minimal Suite',
      description: undefined,
      project_id: 61,
      url: 'https://test.testrail.com/index.php?/suites/view/1',
      is_baseline: undefined,
      is_master: undefined,
      is_completed: undefined,
      completed_on: undefined,
      created_on: undefined,
      created_by: undefined,
      updated_on: undefined,
      updated_by: undefined,
      custom: undefined,
    });
  });
});
