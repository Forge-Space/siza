'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Image from 'next/image';
import { OAuthButton } from '@/components/auth/oauth-button';
import { trackEvent } from '@/components/analytics/AnalyticsProvider';
import { signInWithGoogle, signInWithGitHub } from '@/lib/auth/oauth';
import { AuthSplitShell } from '@/components/migration/migration-primitives';

export function SignInClient() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOAuthLoading] = useState<'google' | 'github' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    trackEvent({
      action: 'signin_started',
      category: 'Auth',
      label: 'email',
    });

    const supabase = createClient();

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      trackEvent({
        action: 'signin_error',
        category: 'Auth',
        label: 'email',
      });
      setError(error.message);
      setLoading(false);
    } else {
      trackEvent({
        action: 'signin_success',
        category: 'Auth',
        label: 'email',
      });
      router.push('/projects');
      router.refresh();
    }
  };

  const handleGoogleSignIn = async () => {
    setOAuthLoading('google');
    setError(null);

    trackEvent({
      action: 'signin_oauth_start',
      category: 'Auth',
      label: 'google',
    });

    const { error } = await signInWithGoogle();

    if (error) {
      trackEvent({
        action: 'signin_error',
        category: 'Auth',
        label: 'oauth_google',
      });
      setError(error.message);
      setOAuthLoading(null);
    }
  };

  const handleGitHubSignIn = async () => {
    setOAuthLoading('github');
    setError(null);

    trackEvent({
      action: 'signin_oauth_start',
      category: 'Auth',
      label: 'github',
    });

    const { error } = await signInWithGitHub();

    if (error) {
      trackEvent({
        action: 'signin_error',
        category: 'Auth',
        label: 'oauth_github',
      });
      setError(error.message);
      setOAuthLoading(null);
    }
  };

  return (
    <AuthSplitShell>
      <div className="w-full space-y-8">
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2">
            <Image src="/monogram.svg" alt="Siza" width={28} height={28} priority />
            <span className="text-2xl font-display font-bold">Siza</span>
          </Link>
          <h1 className="mt-6 text-xl font-semibold text-foreground">Sign in</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Enter your credentials to access your workspace.
          </p>
        </div>

        <div>
          <form
            onSubmit={handleSignIn}
            className="space-y-5"
            noValidate
            aria-label="Sign in form"
          >
            {error && (
              <div
                role="alert"
                aria-live="assertive"
                className="rounded-md border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive"
              >
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <label htmlFor="email" className="text-sm font-medium text-foreground">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-lg border border-border bg-input px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 min-h-[44px]"
                placeholder="you@example.com"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-sm font-medium text-foreground">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-lg border border-border bg-input px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 min-h-[44px]"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-violet-500 disabled:opacity-50 transition-colors min-h-[44px]"
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-surface px-2 text-muted-foreground">or</span>
            </div>
          </div>

          <div className="space-y-3">
            <OAuthButton
              provider="google"
              onClick={handleGoogleSignIn}
              disabled={oauthLoading === 'google'}
            />
            <OAuthButton
              provider="github"
              onClick={handleGitHubSignIn}
              disabled={oauthLoading === 'github'}
            />
          </div>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            No account?{' '}
            <Link href="/signup" className="font-medium text-violet-400 hover:text-violet-300 transition-colors">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </AuthSplitShell>
  );
}
