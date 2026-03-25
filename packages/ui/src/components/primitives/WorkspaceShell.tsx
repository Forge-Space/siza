'use client';

import * as React from 'react';
import { cn } from '../../lib/utils';

/* ─────────────────────────────────────────────────────────────────────────
   WorkspaceShell
   Full-viewport two-pane layout: a fixed-width rail/sidebar + a scrollable
   main content region. All children are typed via named sub-components.
   ───────────────────────────────────────────────────────────────────────── */

export interface WorkspaceShellProps {
  sidebar?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  sidebarClassName?: string;
  mainClassName?: string;
  /** Width of the sidebar in px or any CSS length. Default: 240px */
  sidebarWidth?: string;
}

export function WorkspaceShell({
  sidebar,
  children,
  className,
  sidebarClassName,
  mainClassName,
  sidebarWidth = '240px',
}: WorkspaceShellProps) {
  return (
    <div
      className={cn('flex h-screen w-full overflow-hidden bg-[--forge-bg]', className)}
      style={{ '--shell-sidebar-width': sidebarWidth } as React.CSSProperties}
    >
      {sidebar !== undefined && (
        <aside
          className={cn(
            'siza-panel siza-scrollbar flex h-full flex-shrink-0 flex-col overflow-y-auto',
            sidebarClassName
          )}
          style={{ width: 'var(--shell-sidebar-width, 240px)' }}
          aria-label="Sidebar navigation"
        >
          {sidebar}
        </aside>
      )}
      <main
        id="main-content"
        tabIndex={-1}
        className={cn(
          'siza-scrollbar flex min-h-0 flex-1 flex-col overflow-y-auto outline-none',
          mainClassName
        )}
      >
        {children}
      </main>
    </div>
  );
}

WorkspaceShell.displayName = 'WorkspaceShell';
