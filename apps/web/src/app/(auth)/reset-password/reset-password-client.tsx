'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Image from 'next/image';
import { AuthCardShell } from '@/components/migration/migration-primitives';

export function ResetPasswordClient() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [hasSession, setHasSession] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      setHasSession(!!session);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setSuccess(true);
      setLoading(false);
      setTimeout(() => router.push('/signin'), 3000);
    }
  };

  if (hasSession === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-sm text-muted-foreground">Verifying…</div>
      </div>
    );
  }

  if (!hasSession) {
    return (
      <AuthCardShell>
        <div className="w-full space-y-8">
          <div className="text-center">
            <Link href="/" className="inline-flex items-center gap-2">
              <Image src="/monogram.svg" alt="Siza" width={28} height={28} priority />
              <span className="text-2xl font-display font-bold">Siza</span>
            </Link>
            <h1 className="mt-6 text-xl font-semibold text-foreground">Link expired or invalid</h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              This reset link is no longer active. Request a new one.
            </p>
          </div>
          <div className="text-center">
            <Link
              href="/forgot-password"
              className="inline-block rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-hover transition-colors min-h-[44px] leading-[28px]"
            >
              Request a new link
            </Link>
          </div>
        </div>
      </AuthCardShell>
    );
  }

  if (success) {
    return (
      <AuthCardShell>
        <div className="w-full space-y-8">
          <div className="text-center">
            <Link href="/" className="inline-flex items-center gap-2">
              <Image src="/monogram.svg" alt="Siza" width={28} height={28} priority />
              <span className="text-2xl font-display font-bold">Siza</span>
            </Link>
            <h1 className="mt-6 text-xl font-semibold text-foreground">Password updated</h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Your password has been changed. Redirecting you to sign in…
            </p>
          </div>
        </div>
      </AuthCardShell>
    );
  }

  return (
    <AuthCardShell>
      <div className="w-full space-y-8">
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2">
            <Image src="/monogram.svg" alt="Siza" width={28} height={28} priority />
            <span className="text-2xl font-display font-bold">Siza</span>
          </Link>
          <h1 className="mt-6 text-xl font-semibold text-foreground">Set a new password</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">Choose a strong password for your account.</p>
        </div>

        <div>
          <form
            onSubmit={handleSubmit}
            className="space-y-5"
            noValidate
            aria-label="Set new password form"
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
              <label htmlFor="password" className="text-sm font-medium text-foreground">
                New password
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
                className="w-full rounded-lg border border-border bg-input px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary min-h-[44px]"
                placeholder="••••••••"
              />
              <p id="password-hint" className="text-xs text-muted-foreground">
                Minimum 6 characters.
              </p>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="confirmPassword" className="text-sm font-medium text-foreground">
                Confirm new password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                className="w-full rounded-lg border border-border bg-input px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary min-h-[44px]"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-hover disabled:opacity-50 transition-colors min-h-[44px]"
            >
              {loading ? 'Updating…' : 'Update password'}
            </button>
          </form>
        </div>
      </div>
    </AuthCardShell>
  );
}
