'use client';

import { useState } from 'react';
import type { PlanDefinition } from '@/lib/stripe/plans';
import { Check } from 'lucide-react';

interface PricingCardProps {
  plan: PlanDefinition;
  currentPlan?: string;
  onSelect: (priceId: string) => void;
  highlighted?: boolean;
  isAnnual?: boolean;
}

export function PricingCard({
  plan,
  currentPlan,
  onSelect,
  highlighted,
  isAnnual = false,
}: PricingCardProps) {
  const [loading, setLoading] = useState(false);
  const isCurrent = currentPlan === plan.id;
  const isEnterprise = plan.id === 'enterprise';
  const isFree = plan.id === 'free';

  const displayPrice = isAnnual && plan.priceAnnual != null ? plan.priceAnnual : plan.priceMonthly;
  const periodLabel = isAnnual ? '/yr' : '/mo';

  const handleClick = async () => {
    if (isCurrent || isEnterprise || !plan.stripePriceId) return;
    setLoading(true);
    onSelect(plan.stripePriceId);
  };

  const priceDisplay =
    plan.priceMonthly === 0 ? (
      <span className="text-3xl font-semibold tabular-nums">Free</span>
    ) : plan.priceMonthly === -1 ? (
      <span className="text-3xl font-semibold">Custom</span>
    ) : (
      <div className="flex items-baseline gap-1">
        <span className="text-3xl font-semibold tabular-nums">${displayPrice}</span>
        <span className="text-sm text-muted-foreground">{periodLabel}</span>
      </div>
    );

  const savings =
    isAnnual && plan.priceAnnual != null && plan.priceMonthly > 0
      ? Math.round(plan.priceMonthly * 12 - plan.priceAnnual)
      : null;

  return (
    <div
      className={`relative flex flex-col rounded-xl border ${
        highlighted
          ? 'border-violet-500/60 bg-violet-950/20 ring-1 ring-violet-500/30'
          : 'border-border bg-background'
      }`}
    >
      {highlighted && (
        <div className="rounded-t-xl border-b border-violet-500/20 bg-violet-600/10 px-5 py-2">
          <span className="text-xs font-medium tracking-wide text-violet-400">Recommended</span>
        </div>
      )}

      <div className={`flex flex-1 flex-col p-5 ${highlighted ? 'pt-4' : ''}`}>
        {/* Header */}
        <div className="space-y-1">
          <h3 className="text-base font-semibold text-foreground">{plan.name}</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">{plan.description}</p>
        </div>

        {/* Price */}
        <div className="mt-5 pb-5 border-b border-border">
          {priceDisplay}
          {savings != null && (
            <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400">
              Save ${savings}/yr vs monthly
            </p>
          )}
        </div>

        {/* Feature list */}
        <ul className="mt-5 flex-1 space-y-2.5" aria-label={`${plan.name} features`}>
          {plan.features.map((feature) => (
            <li key={feature} className="flex items-start gap-2.5 text-sm">
              <Check
                className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500"
                aria-hidden="true"
              />
              <span className="text-foreground/80">{feature}</span>
            </li>
          ))}
        </ul>

        {/* CTA */}
        <button
          onClick={handleClick}
          disabled={isCurrent || loading || (isFree && !isCurrent)}
          aria-label={
            isCurrent
              ? `${plan.name} — current plan`
              : isEnterprise
                ? 'Contact sales for Enterprise'
                : `Select ${plan.name}`
          }
          className={`mt-6 w-full rounded-lg px-4 py-2.5 text-sm font-medium transition-colors disabled:opacity-50 min-h-[44px] ${
            highlighted
              ? 'bg-violet-600 text-white hover:bg-violet-500 disabled:hover:bg-violet-600'
              : isFree
                ? 'border border-border bg-transparent text-muted-foreground cursor-default'
                : 'border border-border bg-transparent text-foreground hover:bg-muted'
          }`}
        >
          {isCurrent
            ? 'Current plan'
            : isEnterprise
              ? 'Contact sales'
              : isFree
                ? 'Free forever'
                : loading
                  ? 'Redirecting…'
                  : `Choose ${plan.name}`}
        </button>
      </div>
    </div>
  );
}
