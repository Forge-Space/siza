import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { isLocalAuthBypassEnabled } from '@/lib/auth/local-auth-bypass';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  if (isLocalAuthBypassEnabled()) {
    return children;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/signin');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') {
    redirect('/projects');
  }

  return children;
}
