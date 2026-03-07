import * as catalogService from '@/lib/services/catalog.service';
import { findCatalogEntryById } from '@/lib/repositories/catalog.repo';
import * as catalogRepo from '@/lib/repositories/catalog.repo';
import { ForbiddenError, NotFoundError } from '@/lib/api/errors';

jest.mock('@/lib/repositories/catalog.repo');
jest.mock('@/lib/repositories/base.repo', () => ({
  getClient: jest.fn(),
  paginationRange: jest.fn().mockReturnValue({ from: 0, to: 19 }),
  handleRepoError: jest.fn((err: unknown) => {
    throw err;
  }),
}));

const mockFind = findCatalogEntryById as jest.MockedFunction<typeof findCatalogEntryById>;
const mockRepoList = catalogRepo.listCatalogEntries as jest.MockedFunction<
  typeof catalogRepo.listCatalogEntries
>;

beforeEach(() => jest.clearAllMocks());

const mockEntry = {
  id: 'entry-1',
  name: 'my-service',
  display_name: 'My Service',
  type: 'service',
  lifecycle: 'production',
  owner_id: 'user-1',
  team: null,
  repository_url: null,
  documentation_url: null,
  tags: [] as string[],
  dependencies: [] as string[],
  project_id: null,
  parent_id: null,
  metadata: {},
  description: null,
  created_at: '2026-01-01',
  updated_at: '2026-01-01',
};

describe('verifyCatalogOwnership', () => {
  it('returns entry when user is owner', async () => {
    mockFind.mockResolvedValueOnce(mockEntry as any);
    const result = await catalogService.verifyCatalogOwnership('entry-1', 'user-1');
    expect(result).toEqual(mockEntry);
  });

  it('throws NotFoundError when entry missing', async () => {
    mockFind.mockResolvedValueOnce(null);
    await expect(catalogService.verifyCatalogOwnership('missing', 'user-1')).rejects.toThrow(
      NotFoundError
    );
  });

  it('throws ForbiddenError when not owner', async () => {
    mockFind.mockResolvedValueOnce({
      ...mockEntry,
      owner_id: 'other-user',
    } as any);
    await expect(catalogService.verifyCatalogOwnership('entry-1', 'user-1')).rejects.toThrow(
      ForbiddenError
    );
  });

  it('verifies entry exists before checking ownership', async () => {
    mockFind.mockResolvedValueOnce(null);
    await expect(catalogService.verifyCatalogOwnership('entry-1', 'user-1')).rejects.toThrow(
      NotFoundError
    );
    expect(mockFind).toHaveBeenCalledWith('entry-1');
  });
});

describe('listCatalogEntries', () => {
  const mockResult = {
    data: [mockEntry],
    total: 15,
    page: 1,
    limit: 10,
    hasMore: true,
  };

  it('returns paginated results with defaults', async () => {
    mockRepoList.mockResolvedValueOnce(mockResult as any);
    const result = await catalogService.listCatalogEntries();
    expect(result.data).toHaveLength(1);
    expect(result.pagination).toEqual({
      page: 1,
      limit: 10,
      total: 15,
      pages: 2,
    });
  });

  it('passes filters to repository', async () => {
    mockRepoList.mockResolvedValueOnce(mockResult as any);
    await catalogService.listCatalogEntries({
      search: 'gateway',
      type: 'service',
      lifecycle: 'production',
      page: 2,
      limit: 5,
    });
    expect(mockRepoList).toHaveBeenCalledWith({
      search: 'gateway',
      type: 'service',
      lifecycle: 'production',
      tags: undefined,
      page: 2,
      limit: 5,
    });
  });

  it('returns at least 1 page when empty', async () => {
    mockRepoList.mockResolvedValueOnce({
      data: [],
      total: 0,
      page: 1,
      limit: 10,
      hasMore: false,
    } as any);
    const result = await catalogService.listCatalogEntries();
    expect(result.pagination.pages).toBe(1);
  });

  it('splits comma-separated tags', async () => {
    mockRepoList.mockResolvedValueOnce(mockResult as any);
    await catalogService.listCatalogEntries({
      tags: 'typescript,api,backend',
    });
    expect(mockRepoList).toHaveBeenCalledWith({
      search: undefined,
      type: undefined,
      lifecycle: undefined,
      tags: ['typescript', 'api', 'backend'],
      page: 1,
      limit: 10,
    });
  });

  it('calculates pagination correctly', async () => {
    mockRepoList.mockResolvedValueOnce({
      data: [mockEntry],
      total: 25,
      page: 3,
      limit: 10,
      hasMore: false,
    } as any);
    const result = await catalogService.listCatalogEntries({
      page: 3,
      limit: 10,
    });
    expect(result.pagination.pages).toBe(3);
  });
});

describe('getCatalogEntryWithRelations', () => {
  const mockGetClient = jest.requireMock('@/lib/repositories/base.repo').getClient;
  const mockGetDeps = catalogRepo.getCatalogDependencies as jest.MockedFunction<
    typeof catalogRepo.getCatalogDependencies
  >;
  const mockGetDependents = catalogRepo.getCatalogDependents as jest.MockedFunction<
    typeof catalogRepo.getCatalogDependents
  >;
  const mockGetChildren = catalogRepo.findCatalogChildren as jest.MockedFunction<
    typeof catalogRepo.findCatalogChildren
  >;

  beforeEach(() => {
    mockGetDeps.mockResolvedValue([]);
    mockGetDependents.mockResolvedValue([]);
    mockGetChildren.mockResolvedValue([]);
  });

  it('returns entry with empty relations when no project_id', async () => {
    mockFind.mockResolvedValueOnce(mockEntry as any);
    const result = await catalogService.getCatalogEntryWithRelations('entry-1');
    expect(result.entry).toEqual(mockEntry);
    expect(result.dependencies).toEqual([]);
    expect(result.dependents).toEqual([]);
    expect(result.children).toEqual([]);
    expect(result.scorecard).toBeUndefined();
  });

  it('throws NotFoundError for missing entry', async () => {
    mockFind.mockResolvedValueOnce(null);
    await expect(catalogService.getCatalogEntryWithRelations('missing')).rejects.toThrow(
      NotFoundError
    );
  });

  it('transforms scorecard from DB shape to UI shape', async () => {
    const entryWithProject = { ...mockEntry, project_id: 'proj-1' };
    mockFind.mockResolvedValueOnce(entryWithProject as any);

    const mockSingle = jest.fn().mockResolvedValue({
      data: {
        overall_score: 85,
        security_score: 90,
        quality_score: 80,
        performance_score: 75,
        compliance_score: 95,
      },
      error: null,
    });
    const mockLimit = jest.fn().mockReturnValue({ single: mockSingle });
    const mockOrder = jest.fn().mockReturnValue({ limit: mockLimit });
    const mockEq = jest.fn().mockReturnValue({ order: mockOrder });
    const mockSelect = jest.fn().mockReturnValue({ eq: mockEq });
    mockGetClient.mockResolvedValue({
      from: jest.fn().mockReturnValue({ select: mockSelect }),
    });

    const result = await catalogService.getCatalogEntryWithRelations('entry-1');

    expect(result.scorecard).toEqual({
      overall: 85,
      categories: [
        { name: 'Security', score: 90 },
        { name: 'Quality', score: 80 },
        { name: 'Performance', score: 75 },
        { name: 'Compliance', score: 95 },
      ],
    });
  });

  it('omits scorecard when project has no scorecard data', async () => {
    const entryWithProject = { ...mockEntry, project_id: 'proj-1' };
    mockFind.mockResolvedValueOnce(entryWithProject as any);

    const mockSingle = jest.fn().mockResolvedValue({ data: null, error: null });
    const mockLimit = jest.fn().mockReturnValue({ single: mockSingle });
    const mockOrder = jest.fn().mockReturnValue({ limit: mockLimit });
    const mockEq = jest.fn().mockReturnValue({ order: mockOrder });
    const mockSelect = jest.fn().mockReturnValue({ eq: mockEq });
    mockGetClient.mockResolvedValue({
      from: jest.fn().mockReturnValue({ select: mockSelect }),
    });

    const result = await catalogService.getCatalogEntryWithRelations('entry-1');
    expect(result.scorecard).toBeUndefined();
  });
});

describe('getScorecardsForEntries', () => {
  const mockGetClient = jest.requireMock('@/lib/repositories/base.repo').getClient;

  it('returns empty map when no entries have project_id', async () => {
    const entries = [{ project_id: null }, { project_id: null }];
    const result = await catalogService.getScorecardsForEntries(entries);
    expect(result.size).toBe(0);
  });

  it('batch-fetches scorecards for entries with project_ids', async () => {
    const entries = [{ project_id: 'proj-1' }, { project_id: 'proj-2' }, { project_id: null }];

    const mockOrder = jest.fn().mockResolvedValue({
      data: [
        {
          project_id: 'proj-1',
          overall_score: 92,
          security_score: 95,
          quality_score: 88,
          performance_score: 90,
          compliance_score: 96,
        },
        {
          project_id: 'proj-2',
          overall_score: 70,
          security_score: 65,
          quality_score: 72,
          performance_score: 68,
          compliance_score: 75,
        },
      ],
    });
    const mockIn = jest.fn().mockReturnValue({ order: mockOrder });
    const mockSelect = jest.fn().mockReturnValue({ in: mockIn });
    mockGetClient.mockResolvedValue({
      from: jest.fn().mockReturnValue({ select: mockSelect }),
    });

    const result = await catalogService.getScorecardsForEntries(entries);

    expect(result.size).toBe(2);
    expect(result.get('proj-1')).toEqual({
      overall: 92,
      categories: [
        { name: 'Security', score: 95 },
        { name: 'Quality', score: 88 },
        { name: 'Performance', score: 90 },
        { name: 'Compliance', score: 96 },
      ],
    });
    expect(result.get('proj-2')?.overall).toBe(70);
  });

  it('deduplicates by keeping first scorecard per project', async () => {
    const entries = [{ project_id: 'proj-1' }];

    const mockOrder = jest.fn().mockResolvedValue({
      data: [
        {
          project_id: 'proj-1',
          overall_score: 90,
          security_score: 90,
          quality_score: 85,
          performance_score: 80,
          compliance_score: 95,
        },
        {
          project_id: 'proj-1',
          overall_score: 60,
          security_score: 60,
          quality_score: 55,
          performance_score: 50,
          compliance_score: 65,
        },
      ],
    });
    const mockIn = jest.fn().mockReturnValue({ order: mockOrder });
    const mockSelect = jest.fn().mockReturnValue({ in: mockIn });
    mockGetClient.mockResolvedValue({
      from: jest.fn().mockReturnValue({ select: mockSelect }),
    });

    const result = await catalogService.getScorecardsForEntries(entries);
    expect(result.get('proj-1')?.overall).toBe(90);
  });
});
