import { GET, POST } from '../route';
import { createClient } from '@/lib/supabase/server';
import { verifyAdmin } from '@/lib/api/admin';

jest.mock('@/lib/supabase/server');
jest.mock('@/lib/api/admin');

const mockCreateClient = createClient as jest.MockedFunction<typeof createClient>;
const mockVerifyAdmin = verifyAdmin as jest.MockedFunction<typeof verifyAdmin>;

describe('Features API - /api/features', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('GET returns 403 for non-admin users', async () => {
    mockCreateClient.mockResolvedValue({} as any);
    mockVerifyAdmin.mockResolvedValue(null);

    const response = await GET();
    expect(response.status).toBe(403);
    expect(await response.json()).toEqual({ error: 'Forbidden' });
  });

  it('GET returns feature flags for admins', async () => {
    const order2 = jest.fn().mockResolvedValue({
      data: [{ id: 'f1', name: 'ENABLE_ALPHA', category: 'system', enabled: true }],
      error: null,
    });
    const order1 = jest.fn().mockReturnValue({ order: order2 });
    const select = jest.fn().mockReturnValue({ order: order1 });
    const from = jest.fn().mockReturnValue({ select });

    mockCreateClient.mockResolvedValue({ from } as any);
    mockVerifyAdmin.mockResolvedValue({ id: 'admin-1' } as any);

    const response = await GET();
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.data).toHaveLength(1);
    expect(from).toHaveBeenCalledWith('feature_flags');
  });

  it('POST validates name', async () => {
    mockCreateClient.mockResolvedValue({} as any);
    mockVerifyAdmin.mockResolvedValue({ id: 'admin-1' } as any);

    const request = new Request('http://localhost/api/features', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    const response = await POST(request);

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: 'Flag name is required' });
  });

  it('POST creates a feature flag for admins', async () => {
    const single = jest.fn().mockResolvedValue({
      data: { id: 'f2', name: 'ENABLE_BETA', category: 'system', enabled: false },
      error: null,
    });
    const select = jest.fn().mockReturnValue({ single });
    const insert = jest.fn().mockReturnValue({ select });
    const from = jest.fn().mockReturnValue({ insert });

    mockCreateClient.mockResolvedValue({ from } as any);
    mockVerifyAdmin.mockResolvedValue({ id: 'admin-1' } as any);

    const request = new Request('http://localhost/api/features', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'ENABLE_BETA' }),
    });
    const response = await POST(request);

    expect(response.status).toBe(201);
    const body = await response.json();
    expect(body.data.name).toBe('ENABLE_BETA');
    expect(insert).toHaveBeenCalledWith({
      name: 'ENABLE_BETA',
      description: null,
      category: 'system',
      scope: ['global'],
      enabled: false,
    });
  });
});
