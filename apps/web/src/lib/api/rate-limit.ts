import { createClient } from '@supabase/supabase-js';
import { getSession } from './auth';
import { RateLimitError } from './errors';

export interface RouteLimitConfig {
  limit: number;
  window: number;
}

const ROUTE_LIMITS: Record<string, RouteLimitConfig> = {
  '/api/generate': { limit: 10, window: 60000 },
  '/api/generate/validate': { limit: 20, window: 60000 },
  '/api/generate/format': { limit: 20, window: 60000 },
  '/api/generate/analyze': { limit: 5, window: 60000 },
  '/api/components': { limit: 60, window: 60000 },
  '/api/projects': { limit: 60, window: 60000 },
  '/api/templates': { limit: 60, window: 60000 },
  '/api/generations': { limit: 60, window: 60000 },
  '/api/auth': { limit: 10, window: 60000 },
  '/api/wireframe': { limit: 5, window: 60000 },
  '/api/audit': { limit: 30, window: 60000 },
  '/api/scorecards': { limit: 60, window: 60000 },
  '/api/catalog': { limit: 120, window: 60000 },
};

export function getRouteLimit(pathname: string): RouteLimitConfig {
  for (const [route, config] of Object.entries(ROUTE_LIMITS)) {
    if (pathname.startsWith(route)) return config;
  }
  return { limit: 100, window: 60000 };
}

function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

export async function checkRateLimit(
  request: Request,
  limit: number = 100,
  window: number = 60000
): Promise<RateLimitResult> {
  const session = await getSession();

  let identifier: string;
  if (session?.user.id) {
    identifier = session.user.id;
  } else {
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip');
    identifier = ip ? `anon:${ip}` : 'anonymous:unknown';
  }

  const endpoint = new URL(request.url).pathname;
  const windowSeconds = Math.ceil(window / 1000);
  const supabase = getServiceClient();

  if (!supabase) {
    return { allowed: true, remaining: limit, resetAt: Date.now() + window };
  }

  const { data, error } = await supabase.rpc('check_rate_limit', {
    p_identifier: identifier,
    p_endpoint: endpoint,
    p_limit: limit,
    p_window_seconds: windowSeconds,
  });

  if (error || !data?.[0]) {
    return { allowed: true, remaining: limit, resetAt: Date.now() + window };
  }

  const row = data[0];
  const resetAt = new Date(row.reset_at).getTime();
  return {
    allowed: row.allowed,
    remaining: Math.max(0, limit - row.current_count),
    resetAt,
  };
}

export async function enforceRateLimit(
  request: Request,
  limit: number = 100,
  window: number = 60000
): Promise<void> {
  const result = await checkRateLimit(request, limit, window);

  if (!result.allowed) {
    const retryAfter = Math.ceil((result.resetAt - Date.now()) / 1000);
    throw new RateLimitError('Rate limit exceeded', retryAfter);
  }
}

export function setRateLimitHeaders(
  response: Response,
  result: RateLimitResult,
  limit: number
): Response {
  response.headers.set('X-RateLimit-Limit', limit.toString());
  response.headers.set('X-RateLimit-Remaining', result.remaining.toString());
  response.headers.set('X-RateLimit-Reset', result.resetAt.toString());

  if (!result.allowed) {
    const retryAfter = Math.ceil((result.resetAt - Date.now()) / 1000);
    response.headers.set('Retry-After', retryAfter.toString());
  }

  return response;
}

export function _resetForTesting(): void {
  // No-op — DB-backed rate limiting, no local state to clear
}
