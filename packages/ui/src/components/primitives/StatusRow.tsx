import * as React from 'react';
import { cn } from '../../lib/utils';

/* ─────────────────────────────────────────────────────────────────────────
   StatusRow
   A horizontal pill/label + value row for displaying status information.
   ───────────────────────────────────────────────────────────────────────── */

export type StatusVariant = 'success' | 'warning' | 'error' | 'info' | 'neutral';

const variantStyles: Record<StatusVariant, { dot: string; badge: string }> = {
  success: {
    dot: 'bg-[--forge-success]',
    badge: 'bg-[--forge-success-subtle] text-[--forge-success]',
  },
  warning: {
    dot: 'bg-[--forge-warning]',
    badge: 'bg-[--forge-warning-subtle] text-[--forge-warning]',
  },
  error: {
    dot: 'bg-[--forge-error]',
    badge: 'bg-[--forge-error-subtle] text-[--forge-error]',
  },
  info: {
    dot: 'bg-[--forge-info]',
    badge: 'bg-[--forge-info-subtle] text-[--forge-info]',
  },
  neutral: {
    dot: 'bg-[--forge-text-muted]',
    badge: 'bg-[--forge-surface-raised] text-[--forge-text-secondary]',
  },
};

export interface StatusRowProps extends React.HTMLAttributes<HTMLDivElement> {
  label: React.ReactNode;
  status: React.ReactNode;
  variant?: StatusVariant;
  /** Show a coloured dot indicator. Default true. */
  showDot?: boolean;
  description?: React.ReactNode;
  actions?: React.ReactNode;
}

export function StatusRow({
  label,
  status,
  variant = 'neutral',
  showDot = true,
  description,
  actions,
  className,
  ...props
}: StatusRowProps) {
  const styles = variantStyles[variant];

  return (
    <div
      className={cn('flex items-center gap-3 py-2', className)}
      {...props}
    >
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium leading-tight text-[--forge-text]">{label}</p>
        {description && (
          <p className="mt-0.5 truncate text-xs text-[--forge-text-muted]">{description}</p>
        )}
      </div>
      <div className="ml-auto flex shrink-0 items-center gap-2">
        {actions}
        <span
          className={cn(
            'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium',
            styles.badge
          )}
        >
          {showDot && (
            <span
              className={cn('h-1.5 w-1.5 shrink-0 rounded-full', styles.dot)}
              aria-hidden="true"
            />
          )}
          {status}
        </span>
      </div>
    </div>
  );
}

StatusRow.displayName = 'StatusRow';
