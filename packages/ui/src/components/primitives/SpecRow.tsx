import * as React from 'react';
import { cn } from '../../lib/utils';

/* ─────────────────────────────────────────────────────────────────────────
   SpecRow
   A key → value specification row for detail / metadata panels.

   Note: SpecRow renders semantic-neutral <div>/<span> elements so it can be
   composed freely inside any container. When you need a proper definition
   list, wrap multiple <SpecRow> elements in a <dl>.
   ───────────────────────────────────────────────────────────────────────── */

export interface SpecRowProps extends React.HTMLAttributes<HTMLDivElement> {
  label: React.ReactNode;
  value: React.ReactNode;
  /** Applies monospace styling to the value. Useful for IDs, hashes, code. */
  mono?: boolean;
  /** Renders a bottom border divider. Default false. */
  divider?: boolean;
  actions?: React.ReactNode;
}

export function SpecRow({
  label,
  value,
  mono = false,
  divider = false,
  actions,
  className,
  ...props
}: SpecRowProps) {
  return (
    <div
      className={cn(
        'flex items-baseline justify-between gap-4 py-2',
        divider && 'border-b border-[--forge-divider]',
        className
      )}
      {...props}
    >
      <span className="shrink-0 text-xs font-medium uppercase tracking-wider text-[--forge-text-muted]">
        {label}
      </span>
      <span
        className={cn(
          'min-w-0 truncate text-sm text-[--forge-text]',
          mono && 'font-mono text-xs'
        )}
      >
        {value}
      </span>
      {actions && (
        <div className="ml-2 flex shrink-0 items-center gap-1">{actions}</div>
      )}
    </div>
  );
}

SpecRow.displayName = 'SpecRow';
