'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PricingCard } from '@/components/billing/PricingCard';
import { PLANS } from '@/lib/stripe/plans';
import Image from 'next/image';
import Link from 'next/link';

export function PricingPageClient() {
  const router = useRouter();
  const [isAnnual, setIsAnnual] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const handleSelectPlan = async (priceId: string) => {
    setCheckoutError(null);
    try {
      const res = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId }),
      });

      const { url, error } = await res.json();
      if (error) {
        if (res.status === 401) {
          router.push('/signin');
          return;
        }
        setCheckoutError('Unable to start checkout. Please try again.');
        return;
      }

      if (url) window.location.href = url;
    } catch {
      setCheckoutError('Unable to start checkout. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-5xl px-4 py-16">

        {/* Header */}
        <div className="text-center space-y-4">
          <Link href="/" className="inline-flex items-center gap-2">
            <Image src="/monogram.svg" alt="Siza" width={28} height={28} priority />
            <span className="text-xl font-display font-bold">Siza</span>
          </Link>
          <h1 className="text-3xl font-semibold text-foreground">Plans & pricing</h1>
          <p className="text-base text-muted-foreground max-w-lg mx-auto">
            Start free. Bring your own key for unlimited generations. Upgrade when you need team
            features or higher limits.
          </p>

          {/* Billing toggle */}
          <div className="inline-flex items-center gap-3 rounded-lg border border-border bg-muted/30 px-4 py-2">
            <span
              className={`text-sm ${!isAnnual ? 'font-medium text-foreground' : 'text-muted-foreground'}`}
            >
              Monthly
            </span>
            <button
              role="switch"
              aria-checked={isAnnual}
              aria-label="Toggle annual billing"
              onClick={() => setIsAnnual((v) => !v)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                isAnnual ? 'bg-violet-600' : 'bg-muted-foreground/30'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 translate-x-1 rounded-full bg-white shadow transition-transform ${
                  isAnnual ? 'translate-x-6' : ''
                }`}
              />
            </button>
            <span
              className={`text-sm ${isAnnual ? 'font-medium text-foreground' : 'text-muted-foreground'}`}
            >
              Annual{' '}
              <span className="ml-1 rounded-md bg-emerald-100 px-1.5 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                Save 17%
              </span>
            </span>
          </div>
        </div>

        {/* Error */}
        {checkoutError && (
          <div
            role="alert"
            aria-live="assertive"
            className="mt-6 mx-auto max-w-lg rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-center text-sm text-destructive"
          >
            {checkoutError}
          </div>
        )}

        {/* Plan grid */}
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <PricingCard
            plan={PLANS.free}
            currentPlan={undefined}
            onSelect={handleSelectPlan}
            isAnnual={isAnnual}
          />
          <PricingCard
            plan={PLANS.pro}
            currentPlan={undefined}
            onSelect={handleSelectPlan}
            highlighted
            isAnnual={isAnnual}
          />
          <PricingCard
            plan={PLANS.team}
            currentPlan={undefined}
            onSelect={handleSelectPlan}
            isAnnual={isAnnual}
          />
          <PricingCard
            plan={PLANS.enterprise}
            currentPlan={undefined}
            onSelect={handleSelectPlan}
            isAnnual={isAnnual}
          />
        </div>

        {/* Footer note */}
        <p className="mt-8 text-center text-xs text-muted-foreground">
          All plans include BYOK (bring your own key) for unlimited generations. Prices in USD.
          Cancel any time.
        </p>
      </div>
    </div>
  );
}
