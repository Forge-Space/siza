'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import Image from 'next/image';
import { AuthCardShell } from '@/components/migration/migration-primitives';

export function ForgotPasswordClient() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setSuccess(true);
      setLoading(false);
    }
  };

  if (success) {
    return (
      <AuthCardShell>
        <div className="w-full space-y-8">
          <div className="text-center">
            <Link href="/" className="inline-flex items-center gap-2">
              <Image src="/monogram.svg" alt="Siza" width={28} height={28} priority />
              <span className="text-2xl font-display font-bold">Siza</span>
            </Link>
            <h1 className="mt-6 text-xl font-semibold text-foreground">Check your email</h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              A reset link was sent to <strong className="text-foreground">{email}</strong>.
            </p>
          </div>

          <div className="space-y-4">
            <p className="text-center text-sm text-muted-foreground">
              The link expires in 1 hour. Check your spam folder if you don&apos;t see it.
            </p>
            <Link
              href="/signin"
              className="block w-full rounded-lg bg-primary px-4 py-2.5 text-center text-sm font-medium text-white hover:bg-primary-hover transition-colors min-h-[44px] leading-[28px]"
            >
              Back to sign in
            </Link>
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
          <h1 className="mt-6 text-xl font-semibold text-foreground">Reset your password</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Enter your email address and we&apos;ll send you a reset link.
          </p>
        </div>

        <div>
          <form
            onSubmit={handleSubmit}
            className="space-y-5"
            noValidate
            aria-label="Password reset form"
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
                className="w-full rounded-lg border border-border bg-input px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary min-h-[44px]"
                placeholder="you@example.com"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-hover disabled:opacity-50 transition-colors min-h-[44px]"
            >
              {loading ? 'Sending…' : 'Send reset link'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Remembered it?{' '}
            <Link href="/signin" className="font-medium text-primary hover:underline transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </AuthCardShell>
  );
}
