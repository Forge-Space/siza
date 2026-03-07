import type { User } from '@supabase/supabase-js';

const TRUTHY_VALUES = new Set(['1', 'true', 'yes', 'on']);

export function isLocalAuthBypassEnabled(): boolean {
  if (process.env.NODE_ENV === 'production') {
    return false;
  }

  const rawValue = process.env.SIZA_LOCAL_AUTH_BYPASS;
  if (!rawValue) {
    return false;
  }

  return TRUTHY_VALUES.has(rawValue.trim().toLowerCase());
}

export function getLocalAuthBypassUser(): User {
  const now = new Date().toISOString();
  return {
    id: process.env.SIZA_LOCAL_AUTH_BYPASS_USER_ID ?? '00000000-0000-0000-0000-000000000000',
    email: process.env.SIZA_LOCAL_AUTH_BYPASS_EMAIL ?? 'local-dev@siza.local',
    app_metadata: { provider: 'email', providers: ['email'] },
    user_metadata: { bypass: true },
    aud: 'authenticated',
    created_at: now,
  } as User;
}
