import * as React from 'react';
import { cn } from '../../lib/utils';

/* ─────────────────────────────────────────────────────────────────────────
   PanelHeader
   Consistent header bar for panels, drawers, and side-rails.
   ───────────────────────────────────────────────────────────────────────── */

export interface PanelHeaderProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  title: React.ReactNode;
  description?: React.ReactNode;
  /** Slot for leading icon or avatar */
  icon?: React.ReactNode;
  /** Slot for trailing actions (buttons, menus, etc.) */
  actions?: React.ReactNode;
  /** Renders a bottom border divider. Default true. */
  divider?: boolean;
}

export function PanelHeader({
  title,
  description,
  icon,
  actions,
  divider = true,
  className,
  ...props
}: PanelHeaderProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-3 bg-[--forge-panel-header] px-4 py-3',
        divider && 'border-b border-[--forge-divider]',
        className
      )}
      {...props}
    >
      {icon && (
        <span className="flex h-7 w-7 shrink-0 items-center justify-center text-[--forge-text-secondary]">
          {icon}
        </span>
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold leading-tight text-[--forge-text]">{title}</p>
        {description && (
          <p className="mt-0.5 truncate text-xs leading-tight text-[--forge-text-muted]">
            {description}
          </p>
        )}
      </div>
      {actions && (
        <div className="ml-auto flex shrink-0 items-center gap-1.5">{actions}</div>
      )}
    </div>
  );
}

PanelHeader.displayName = 'PanelHeader';
