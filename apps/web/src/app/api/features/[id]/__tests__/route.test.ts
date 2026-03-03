import { DELETE, PATCH } from '../route';
import { createClient } from '@/lib/supabase/server';
import { verifyAdmin } from '@/lib/api/admin';

jest.mock('@/lib/supabase/server');
jest.mock('@/lib/api/admin');

const mockCreateClient = createClient as jest.MockedFunction<typeof createClient>;
const mockVerifyAdmin = verifyAdmin as jest.MockedFunction<typeof verifyAdmin>;

describe('Features API - /api/features/[id]', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('PATCH returns 403 for non-admin users', async () => {
    mockCreateClient.mockResolvedValue({} as any);
    mockVerifyAdmin.mockResolvedValue(null);

    const request = new Request('http://localhost/api/features/f1', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ enabled: true }),
    });
    const response = await PATCH(request, { params: Promise.resolve({ id: 'f1' }) });
    expect(response.status).toBe(403);
  });

  it('PATCH returns 400 when no update fields are provided', async () => {
    mockCreateClient.mockResolvedValue({} as any);
    mockVerifyAdmin.mockResolvedValue({ id: 'admin-1' } as any);

    const request = new Request('http://localhost/api/features/f1', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    const response = await PATCH(request, { params: Promise.resolve({ id: 'f1' }) });
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: 'No fields to update' });
  });

  it('PATCH updates requested fields for admin users', async () => {
    const single = jest.fn().mockResolvedValue({
      data: { id: 'f1', name: 'ENABLE_ALPHA', enabled: true },
      error: null,
    });
    const select = jest.fn().mockReturnValue({ single });
    const eq = jest.fn().mockReturnValue({ select });
    const update = jest.fn().mockReturnValue({ eq });
    const from = jest.fn().mockReturnValue({ update });

    mockCreateClient.mockResolvedValue({ from } as any);
    mockVerifyAdmin.mockResolvedValue({ id: 'admin-1' } as any);

    const request = new Request('http://localhost/api/features/f1', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ enabled: true, description: 'Enabled alpha flow' }),
    });
    const response = await PATCH(request, { params: Promise.resolve({ id: 'f1' }) });

    expect(response.status).toBe(200);
    expect(update).toHaveBeenCalledWith({
      enabled: true,
      description: 'Enabled alpha flow',
    });
    expect(eq).toHaveBeenCalledWith('id', 'f1');
  });

  it('DELETE removes feature flag for admin users', async () => {
    const eq = jest.fn().mockResolvedValue({ error: null });
    const del = jest.fn().mockReturnValue({ eq });
    const from = jest.fn().mockReturnValue({ delete: del });

    mockCreateClient.mockResolvedValue({ from } as any);
    mockVerifyAdmin.mockResolvedValue({ id: 'admin-1' } as any);

    const request = new Request('http://localhost/api/features/f1', { method: 'DELETE' });
    const response = await DELETE(request, { params: Promise.resolve({ id: 'f1' }) });

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ message: 'Deleted' });
    expect(eq).toHaveBeenCalledWith('id', 'f1');
  });
});
