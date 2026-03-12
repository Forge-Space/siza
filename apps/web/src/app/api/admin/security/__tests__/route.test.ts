import { GET } from '../route';
import { createClient } from '@/lib/supabase/server';
import { verifyAdmin } from '@/lib/api/admin';
import { parseWindowDays } from '@/lib/services/metrics.service';
import { getSecurityTelemetryReport } from '@/lib/services/security-telemetry.service';

jest.mock('@/lib/supabase/server');
jest.mock('@/lib/api/admin');
jest.mock('@/lib/services/metrics.service');
jest.mock('@/lib/services/security-telemetry.service');

const mockCreateClient = createClient as jest.MockedFunction<typeof createClient>;
const mockVerifyAdmin = verifyAdmin as jest.MockedFunction<typeof verifyAdmin>;
const mockParseWindowDays = parseWindowDays as jest.MockedFunction<typeof parseWindowDays>;
const mockGetSecurityTelemetryReport = getSecurityTelemetryReport as jest.MockedFunction<
  typeof getSecurityTelemetryReport
>;

function makeRequest(search = '') {
  return new Request(`http://localhost:3000/api/admin/security${search}`);
}

describe('GET /api/admin/security', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockParseWindowDays.mockImplementation((value) => {
      const parsed = Number(value);
      return parsed === 7 || parsed === 30 || parsed === 90 ? parsed : 30;
    });
  });

  it('returns 403 for non-admin users', async () => {
    mockCreateClient.mockResolvedValue({} as any);
    mockVerifyAdmin.mockResolvedValue(null);

    const response = await GET(makeRequest());

    expect(response.status).toBe(403);
    expect(await response.json()).toEqual({ error: 'Forbidden' });
  });

  it('returns security telemetry for admin users', async () => {
    mockCreateClient.mockResolvedValue({} as any);
    mockVerifyAdmin.mockResolvedValue({ id: 'admin-1' } as any);
    mockGetSecurityTelemetryReport.mockResolvedValue({
      timestamp: '2026-03-12T00:00:00.000Z',
      windowDays: 7,
      summary: {
        totalReports: 10,
        totalFindings: 6,
        reportsWithFindings: 4,
        highRiskGenerations: 2,
        scannerErrors: 1,
      },
      severityDistribution: {
        critical: 1,
        high: 2,
        medium: 2,
        low: 1,
        info: 0,
      },
      riskDistribution: {
        high: 3,
        medium: 2,
        low: 1,
      },
      topRules: [
        {
          ruleId: 'SEC-INJ-001',
          count: 2,
          maxSeverity: 'high',
          maxRiskLevel: 'high',
        },
      ],
      recentHighRiskGenerations: [],
    });

    const response = await GET(makeRequest('?windowDays=7'));

    expect(response.status).toBe(200);
    expect(mockParseWindowDays).toHaveBeenCalledWith('7');
    expect(mockGetSecurityTelemetryReport).toHaveBeenCalledWith(7);
  });

  it('returns 503 when service config is missing', async () => {
    mockCreateClient.mockResolvedValue({} as any);
    mockVerifyAdmin.mockResolvedValue({ id: 'admin-1' } as any);
    mockGetSecurityTelemetryReport.mockRejectedValue(
      new Error('Security telemetry service configuration missing')
    );

    const response = await GET(makeRequest());

    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({
      error: 'Security telemetry service is not configured',
    });
  });
});
