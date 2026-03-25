'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import Image from 'next/image';
import { OAuthButton } from '@/components/auth/oauth-button';
import { trackEvent, trackGoogleAdsConversion } from '@/components/analytics/AnalyticsProvider';
import { signInWithGoogle, signInWithGitHub } from '@/lib/auth/oauth';
import { getStoredLeadAttribution } from '@/lib/analytics/lead-attribution';
import { AuthSplitShell } from '@/components/migration/migration-primitives';

export function SignUpClient() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOAuthLoading] = useState<'google' | 'github' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const attribution = getStoredLeadAttribution();
    const leadSource = attribution?.utm_source ?? 'direct';

    trackEvent({
      action: 'lead_signup_started',
      category: 'Lead',
      label: `email:${leadSource}`,
    });

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: attribution ? { marketing_attribution: attribution } : undefined,
      },
    });

    if (error) {
      trackEvent({
        action: 'lead_signup_error',
        category: 'Lead',
        label: 'email',
      });
      setError(error.message);
      setLoading(false);
    } else {
      trackEvent({
        action: 'lead_signup_success',
        category: 'Lead',
        label: `email:${leadSource}`,
      });
      trackGoogleAdsConversion('signup');
      setSuccess(true);
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setOAuthLoading('google');
    setError(null);
    const attribution = getStoredLeadAttribution();
    const leadSource = attribution?.utm_source ?? 'direct';

    trackEvent({
      action: 'lead_signup_oauth_start',
      category: 'Lead',
      label: `google:${leadSource}`,
    });

    const { error } = await signInWithGoogle();

    if (error) {
      trackEvent({
        action: 'lead_signup_error',
        category: 'Lead',
        label: 'oauth_google',
      });
      setError(error.message);
      setOAuthLoading(null);
    }
  };

  const handleGitHubSignUp = async () => {
    setOAuthLoading('github');
    setError(null);
    const attribution = getStoredLeadAttribution();
    const leadSource = attribution?.utm_source ?? 'direct';

    trackEvent({
      action: 'lead_signup_oauth_start',
      category: 'Lead',
      label: `github:${leadSource}`,
    });

    const { error } = await signInWithGitHub();

    if (error) {
      trackEvent({
        action: 'lead_signup_error',
        category: 'Lead',
        label: 'oauth_github',
      });
      setError(error.message);
      setOAuthLoading(null);
    }
  };

  const handleResendVerification = async () => {
    setResending(true);
    setResendSuccess(false);

    try {
      const res = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        setResendSuccess(true);
      }
    } catch {
      // Silent fail — user can retry
    } finally {
      setResending(false);
    }
  };

  if (success) {
    return (
      <AuthSplitShell>
        <div className="w-full space-y-8">
          <div className="text-center">
            <Link href="/" className="inline-flex items-center gap-2">
              <Image src="/monogram.svg" alt="Siza" width={28} height={28} priority />
              <span className="text-2xl font-display font-bold">Siza</span>
            </Link>
            <h1 className="mt-6 text-xl font-semibold text-foreground">Confirm your email</h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              A confirmation link was sent to <strong className="text-foreground">{email}</strong>.
            </p>
          </div>

          <div className="space-y-4">
            <p className="text-center text-sm text-muted-foreground">
              Click the link in the email to activate your account.
            </p>

            {resendSuccess ? (
              <p role="status" aria-live="polite" className="text-center text-sm text-emerald-600 dark:text-emerald-400">
                Verification email sent.
              </p>
            ) : (
              <button
                onClick={handleResendVerification}
                disabled={resending}
                className="w-full rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-muted-foreground hover:bg-surface-alt disabled:opacity-50 transition-colors min-h-[44px]"
              >
                {resending ? 'Sending…' : 'Resend confirmation email'}
              </button>
            )}

            <Link
              href="/signin"
              className="block w-full rounded-lg bg-primary px-4 py-2.5 text-center text-sm font-medium text-white hover:bg-primary-hover transition-colors min-h-[44px] leading-[28px]"
            >
              Back to sign in
            </Link>
          </div>
        </div>
      </AuthSplitShell>
    );
  }

  return (
    <AuthSplitShell>
      <div className="w-full space-y-8">
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2">
            <Image src="/monogram.svg" alt="Siza" width={28} height={28} priority />
            <span className="text-2xl font-display font-bold">Siza</span>
          </Link>
          <h1 className="mt-6 text-xl font-semibold text-foreground">Create an account</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Get started with Siza — free, no card required.
          </p>
        </div>

        <div>
          <form
            onSubmit={handleSignUp}
            className="space-y-5"
            noValidate
            aria-label="Create account form"
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
              <label htmlFor="password" className="text-sm font-medium text-foreground">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                aria-describedby="password-hint"
                className="w-full rounded-lg border border-border bg-input px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 min-h-[44px]"
                placeholder="••••••••"
              />
              <p id="password-hint" className="text-xs text-muted-foreground">
                Minimum 6 characters.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-violet-500 disabled:opacity-50 transition-colors min-h-[44px]"
            >
              {loading ? 'Creating account…' : 'Create account'}
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
              onClick={handleGoogleSignUp}
              disabled={oauthLoading === 'google'}
            />
            <OAuthButton
              provider="github"
              onClick={handleGitHubSignUp}
              disabled={oauthLoading === 'github'}
            />
          </div>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link href="/signin" className="font-medium text-violet-400 hover:text-violet-300 transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </AuthSplitShell>
  );
}
