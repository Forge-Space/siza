/**
 * Unit Tests for Supabase-backed Rate Limiting
 */

import { NextRequest } from 'next/server';
import {
  checkRateLimit,
  enforceRateLimit,
  setRateLimitHeaders,
  _resetForTesting,
} from '../rate-limit';
import { RateLimitError } from '../errors';

jest.mock('../auth');
jest.mock('@supabase/supabase-js');

import { getSession } from '../auth';
import { createClient } from '@supabase/supabase-js';

const mockGetSession = getSession as jest.MockedFunction<typeof getSession>;
const mockCreateClient = createClient as jest.MockedFunction<typeof createClient>;

let mockRpc: jest.Mock;

function setupMockSupabase(rpcResponse: { data: any; error: any }) {
  mockRpc = jest.fn().mockResolvedValue(rpcResponse);
  mockCreateClient.mockReturnValue({ rpc: mockRpc } as any);
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost:54321';
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-key';
}

describe('Rate Limiting (Supabase-backed)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    _resetForTesting();
  });

  afterEach(() => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  });

  describe('checkRateLimit', () => {
    it('should allow request when under limit', async () => {
      mockGetSession.mockResolvedValue({
        user: { id: 'user-123' } as any,
      });
      setupMockSupabase({
        data: [
          { allowed: true, current_count: 1, reset_at: new Date(Date.now() + 60000).toISOString() },
        ],
        error: null,
      });
      const request = new NextRequest('http://localhost/api/test');

      const result = await checkRateLimit(request, 10, 60000);

      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(9);
      expect(mockRpc).toHaveBeenCalledWith('check_rate_limit', {
        p_identifier: 'user-123',
        p_endpoint: '/api/test',
        p_limit: 10,
        p_window_seconds: 60,
      });
    });

    it('should block requests after limit exceeded', async () => {
      mockGetSession.mockResolvedValue({
        user: { id: 'user-123' } as any,
      });
      setupMockSupabase({
        data: [
          {
            allowed: false,
            current_count: 11,
            reset_at: new Date(Date.now() + 30000).toISOString(),
          },
        ],
        error: null,
      });
      const request = new NextRequest('http://localhost/api/test');

      const result = await checkRateLimit(request, 10, 60000);

      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
    });

    it('should use IP address for anonymous users', async () => {
      mockGetSession.mockResolvedValue(null);
      setupMockSupabase({
        data: [
          { allowed: true, current_count: 1, reset_at: new Date(Date.now() + 60000).toISOString() },
        ],
        error: null,
      });
      const request = new NextRequest('http://localhost/api/test', {
        headers: { 'x-forwarded-for': '192.168.1.1' },
      });

      await checkRateLimit(request, 10, 60000);

      expect(mockRpc).toHaveBeenCalledWith(
        'check_rate_limit',
        expect.objectContaining({
          p_identifier: 'anon:192.168.1.1',
        })
      );
    });

    it('should use fallback identifier for anonymous without IP', async () => {
      mockGetSession.mockResolvedValue(null);
      setupMockSupabase({
        data: [
          { allowed: true, current_count: 1, reset_at: new Date(Date.now() + 60000).toISOString() },
        ],
        error: null,
      });
      const request = new NextRequest('http://localhost/api/test');

      await checkRateLimit(request, 10, 60000);

      expect(mockRpc).toHaveBeenCalledWith(
        'check_rate_limit',
        expect.objectContaining({
          p_identifier: 'anonymous:unknown',
        })
      );
    });

    it('should allow request when Supabase is unavailable', async () => {
      mockGetSession.mockResolvedValue({
        user: { id: 'user-123' } as any,
      });
      delete process.env.SUPABASE_SERVICE_ROLE_KEY;
      const request = new NextRequest('http://localhost/api/test');

      const result = await checkRateLimit(request, 10, 60000);

      expect(result.allowed).toBe(true);
    });

    it('should allow request on RPC error (fail-open)', async () => {
      mockGetSession.mockResolvedValue({
        user: { id: 'user-123' } as any,
      });
      setupMockSupabase({
        data: null,
        error: { message: 'DB error' },
      });
      const request = new NextRequest('http://localhost/api/test');

      const result = await checkRateLimit(request, 10, 60000);

      expect(result.allowed).toBe(true);
    });
  });

  describe('enforceRateLimit', () => {
    it('should not throw when limit not exceeded', async () => {
      mockGetSession.mockResolvedValue({ user: { id: 'user-123' } as any });
      setupMockSupabase({
        data: [
          { allowed: true, current_count: 1, reset_at: new Date(Date.now() + 60000).toISOString() },
        ],
        error: null,
      });
      const request = new NextRequest('http://localhost/api/test');

      await expect(enforceRateLimit(request, 10, 60000)).resolves.not.toThrow();
    });

    it('should throw RateLimitError when limit exceeded', async () => {
      mockGetSession.mockResolvedValue({ user: { id: 'user-123' } as any });
      setupMockSupabase({
        data: [
          {
            allowed: false,
            current_count: 3,
            reset_at: new Date(Date.now() + 30000).toISOString(),
          },
        ],
        error: null,
      });
      const request = new NextRequest('http://localhost/api/test');

      await expect(enforceRateLimit(request, 2, 60000)).rejects.toThrow(RateLimitError);
    });

    it('should include retry_after in error details', async () => {
      mockGetSession.mockResolvedValue({ user: { id: 'user-123' } as any });
      setupMockSupabase({
        data: [
          {
            allowed: false,
            current_count: 3,
            reset_at: new Date(Date.now() + 30000).toISOString(),
          },
        ],
        error: null,
      });
      const request = new NextRequest('http://localhost/api/test');

      try {
        await enforceRateLimit(request, 2, 60000);
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(RateLimitError);
        expect((error as RateLimitError).details?.retry_after).toBeGreaterThan(0);
      }
    });
  });

  describe('setRateLimitHeaders', () => {
    it('should set rate limit headers on response', () => {
      const response = new Response('test');
      const result = {
        allowed: true,
        remaining: 5,
        resetAt: Date.now() + 60000,
      };

      const updatedResponse = setRateLimitHeaders(response, result, 10);

      expect(updatedResponse.headers.get('X-RateLimit-Limit')).toBe('10');
      expect(updatedResponse.headers.get('X-RateLimit-Remaining')).toBe('5');
      expect(updatedResponse.headers.get('X-RateLimit-Reset')).toBeTruthy();
    });

    it('should set Retry-After header when not allowed', () => {
      const response = new Response('test');
      const result = {
        allowed: false,
        remaining: 0,
        resetAt: Date.now() + 30000,
      };

      const updatedResponse = setRateLimitHeaders(response, result, 10);

      expect(updatedResponse.headers.get('Retry-After')).toBeTruthy();
      expect(parseInt(updatedResponse.headers.get('Retry-After')!)).toBeGreaterThan(0);
    });
  });
});
