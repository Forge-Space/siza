import * as React from 'react';
import { cn } from '../../lib/utils';

/* ─────────────────────────────────────────────────────────────────────────
   SectionHeader
   In-page section label with optional description and trailing actions.
   Lighter than PanelHeader — no background, no border by default.
   ───────────────────────────────────────────────────────────────────────── */

export interface SectionHeaderProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  /** Render a bottom divider below the header. */
  divider?: boolean;
  /** Rendered as which heading level. Default: 'h2'. */
  as?: 'h1' | 'h2' | 'h3' | 'h4';
}

export function SectionHeader({
  title,
  description,
  actions,
  divider = false,
  as: Heading = 'h2',
  className,
  ...props
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        'flex items-start justify-between gap-4',
        divider && 'border-b border-[--forge-divider] pb-3',
        className
      )}
      {...props}
    >
      <div className="min-w-0">
        <Heading className="text-base font-semibold leading-snug text-[--forge-text]">
          {title}
        </Heading>
        {description && (
          <p className="mt-1 text-sm leading-relaxed text-[--forge-text-muted]">{description}</p>
        )}
      </div>
      {actions && (
        <div className="ml-auto flex shrink-0 items-center gap-2">{actions}</div>
      )}
    </div>
  );
}

SectionHeader.displayName = 'SectionHeader';
