import * as React from 'react';
import { cn } from '../../lib/utils';

/* ─────────────────────────────────────────────────────────────────────────
   EmptyState
   Centred empty / zero-data placeholder with icon, heading, body, and CTA.
   ───────────────────────────────────────────────────────────────────────── */

export interface EmptyStateProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  icon?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  /** Primary call-to-action, typically a <Button>. */
  action?: React.ReactNode;
  /** Optional secondary action or link. */
  secondaryAction?: React.ReactNode;
  /** Controls vertical padding for different contexts. */
  size?: 'sm' | 'md' | 'lg';
}

const paddingBySize = {
  sm: 'py-8',
  md: 'py-14',
  lg: 'py-24',
};

export function EmptyState({
  icon,
  title,
  description,
  action,
  secondaryAction,
  size = 'md',
  className,
  ...props
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex w-full flex-col items-center justify-center text-center',
        paddingBySize[size],
        className
      )}
      role="status"
      aria-live="polite"
      {...props}
    >
      {icon && (
        <div
          className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl border border-[--forge-border] bg-[--forge-surface-raised] text-[--forge-text-muted]"
          aria-hidden="true"
        >
          {icon}
        </div>
      )}
      <p className="text-sm font-semibold text-[--forge-text]">{title}</p>
      {description && (
        <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-[--forge-text-muted]">
          {description}
        </p>
      )}
      {(action || secondaryAction) && (
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          {action}
          {secondaryAction}
        </div>
      )}
    </div>
  );
}

EmptyState.displayName = 'EmptyState';
