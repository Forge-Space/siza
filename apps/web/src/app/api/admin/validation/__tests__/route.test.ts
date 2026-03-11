import { GET } from '../route';
import { createClient } from '@/lib/supabase/server';
import { verifyAdmin } from '@/lib/api/admin';
import { getCoreFlowValidationReport } from '@/lib/services/core-flow-validation.service';

jest.mock('@/lib/supabase/server');
jest.mock('@/lib/api/admin');
jest.mock('@/lib/services/core-flow-validation.service');

const mockCreateClient = createClient as jest.MockedFunction<typeof createClient>;
const mockVerifyAdmin = verifyAdmin as jest.MockedFunction<typeof verifyAdmin>;
const mockGetCoreFlowValidationReport = getCoreFlowValidationReport as jest.MockedFunction<
  typeof getCoreFlowValidationReport
>;

describe('GET /api/admin/validation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 403 for non-admin users', async () => {
    mockCreateClient.mockResolvedValue({} as any);
    mockVerifyAdmin.mockResolvedValue(null);

    const response = await GET();
    expect(response.status).toBe(403);
    expect(await response.json()).toEqual({ error: 'Forbidden' });
  });

  it('returns validation report for admins', async () => {
    const report = {
      generatedAt: '2026-03-11T00:00:00.000Z',
      current: {
        snapshotDate: '2026-03-11',
        totalUsers: 70,
        onboardedUsers: 62,
        usersWithProject: 58,
        usersWithCompletedGeneration: 54,
        qualifiedUsers: 52,
        qualifiedRatio: 74.29,
      },
      snapshots: [],
      trend: {
        previousWeekAvg: 53,
        currentWeekAvg: 52,
        weekOverWeekDropPct: 1.89,
        maxAllowedDropPct: 10,
        hasTwoFullWeeks: true,
        missingDays: 0,
      },
      gate: {
        passed: true,
        reasons: ['PASS'],
        qualifiedTarget: 50,
        maxDropPct: 10,
      },
    };

    mockCreateClient.mockResolvedValue({} as any);
    mockVerifyAdmin.mockResolvedValue({ id: 'admin-1' } as any);
    mockGetCoreFlowValidationReport.mockResolvedValue(report as any);

    const response = await GET();

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual(report);
    expect(mockGetCoreFlowValidationReport).toHaveBeenCalledTimes(1);
  });

  it('returns 503 when service-role config is missing', async () => {
    mockCreateClient.mockResolvedValue({} as any);
    mockVerifyAdmin.mockResolvedValue({ id: 'admin-1' } as any);
    mockGetCoreFlowValidationReport.mockRejectedValue(
      new Error('Core flow validation service configuration missing')
    );

    const response = await GET();
    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({ error: 'Core-flow validation is not configured' });
  });
});
