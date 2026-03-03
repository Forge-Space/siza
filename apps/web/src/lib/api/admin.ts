import { createClient } from '@/lib/supabase/server';
import { getLocalAuthBypassUser, isLocalAuthBypassEnabled } from '@/lib/auth/local-auth-bypass';

export type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

export async function verifyAdmin(supabase: SupabaseServerClient) {
  if (isLocalAuthBypassEnabled()) {
    return getLocalAuthBypassUser();
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  return profile?.role === 'admin' ? user : null;
}
