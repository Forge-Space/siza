import { createClient } from '@/lib/supabase/server';
import { saveProviderToken } from '@/lib/auth/tokens';
import { sendWelcomeEmail } from '@/lib/email/auth-emails';
import { NextResponse } from 'next/server';

function normalizeNextPath(rawNext: string | null): string {
  if (!rawNext) return '/projects';
  if (!rawNext.startsWith('/')) return '/projects';
  if (rawNext.startsWith('//')) return '/projects';
  return rawNext;
}

function buildAuthCodeErrorUrl(origin: string, reason: string): string {
  const url = new URL('/auth/auth-code-error', origin);
  url.searchParams.set('reason', reason);
  return url.toString();
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = normalizeNextPath(searchParams.get('next'));

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.session) {
      const { session } = data;
      const isNewUser = session.user.created_at === session.user.updated_at;

      if (session.provider_token && session.user) {
        const provider = session.user.app_metadata?.provider ?? 'unknown';

        try {
          await saveProviderToken(session.user.id, provider, {
            accessToken: session.provider_token,
            refreshToken: session.provider_refresh_token,
          });
        } catch {
          // Token persistence is non-blocking
        }
      }

      if (isNewUser && session.user.email) {
        sendWelcomeEmail(session.user.email).catch(() => {});
      }

      if (isNewUser) {
        const onboardingEnabled = process.env.NEXT_PUBLIC_ENABLE_ONBOARDING === 'true';
        if (onboardingEnabled) {
          return NextResponse.redirect(`${origin}/onboarding`);
        }
      }

      return NextResponse.redirect(`${origin}${next}`);
    }

    return NextResponse.redirect(buildAuthCodeErrorUrl(origin, 'exchange_failed'));
  }

  return NextResponse.redirect(buildAuthCodeErrorUrl(origin, 'missing_code'));
}
