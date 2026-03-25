'use client';

import type { User } from '@supabase/supabase-js';
import { MenuIcon, SearchIcon, ChevronRightIcon, BellIcon, InboxIcon } from 'lucide-react';
import Link from 'next/link';
import UserMenu from './UserMenu';
import MobileNav from './MobileNav';
import { usePageMeta } from '@/hooks/use-page-meta';
import { useUIStore } from '@/stores/ui-store';
import { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

interface TopBarProps {
  user: User;
  isAdmin: boolean;
}

export default function TopBar({ user, isAdmin }: TopBarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { title, icon: PageIcon, breadcrumbs } = usePageMeta(isAdmin);
  const setCommandPaletteOpen = useUIStore((s) => s.setCommandPaletteOpen);

  return (
    <>
      <header className="h-14 border-b border-border bg-background" role="banner">
        <div className="h-full px-4 sm:px-6">
          <div className="flex h-full items-center justify-between gap-4">
            {/* Left: mobile hamburger + breadcrumbs / title */}
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                className="md:hidden -ml-1 inline-flex items-center justify-center rounded-md min-h-[44px] min-w-[44px] text-muted-foreground hover:bg-surface hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/60"
                onClick={() => setMobileMenuOpen(true)}
                aria-label={mobileMenuOpen ? 'Close main menu' : 'Open main menu'}
                aria-expanded={mobileMenuOpen}
              >
                <MenuIcon className="h-5 w-5" aria-hidden="true" />
              </button>

              {/* Breadcrumb — desktop */}
              <nav aria-label="Breadcrumb" className="hidden md:flex min-w-0 items-center gap-1">
                {breadcrumbs.map((crumb, i) => (
                  <span key={crumb.href} className="flex min-w-0 items-center gap-1">
                    {i > 0 && (
                      <ChevronRightIcon
                        className="h-3 w-3 flex-shrink-0 text-subtle"
                        aria-hidden="true"
                      />
                    )}
                    {i === breadcrumbs.length - 1 ? (
                      <span className="flex min-w-0 items-center gap-1.5 text-sm font-medium text-foreground">
                        {PageIcon && (
                          <PageIcon
                            className="h-4 w-4 flex-shrink-0 text-subtle"
                            aria-hidden="true"
                          />
                        )}
                        <span className="truncate">{crumb.label}</span>
                      </span>
                    ) : (
                      <Link
                        href={crumb.href}
                        className="truncate text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {crumb.label}
                      </Link>
                    )}
                  </span>
                ))}
              </nav>

              {/* Page title — mobile */}
              <h2 className="md:hidden truncate text-sm font-semibold text-foreground">{title}</h2>
            </div>

            {/* Right: search trigger + notifications + user */}
            <div className="flex flex-shrink-0 items-center gap-1.5">
              {/* Search trigger */}
              <button
                type="button"
                onClick={() => setCommandPaletteOpen(true)}
                className="hidden md:flex items-center gap-2 rounded-md bg-surface px-3 h-8 text-muted-foreground text-sm hover:bg-surface-alt hover:text-foreground hover:ring-1 hover:ring-brand/20 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/60"
                aria-label="Open command palette"
                aria-keyshortcuts="Meta+k"
              >
                <SearchIcon className="h-3.5 w-3.5" aria-hidden="true" />
                <span className="hidden sm:inline">Search</span>
                <kbd className="ml-1 pointer-events-none inline-flex h-5 select-none items-center gap-0.5 rounded border border-border bg-background px-1.5 font-mono text-[10px] font-medium text-subtle">
                  ⌘K
                </kbd>
              </button>

              {/* Notifications — shared DropdownMenu primitive */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="relative inline-flex items-center justify-center rounded-md min-h-[44px] min-w-[44px] text-muted-foreground hover:bg-surface hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/60"
                    aria-label="Notifications"
                  >
                    <BellIcon className="h-4 w-4" aria-hidden="true" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-80 p-0"
                  sideOffset={8}
                >
                  <div className="flex items-center justify-between px-4 py-3">
                    <DropdownMenuLabel className="p-0 text-sm font-semibold text-foreground">
                      Notifications
                    </DropdownMenuLabel>
                    <span className="text-xs text-muted-foreground">All caught up</span>
                  </div>
                  <DropdownMenuSeparator className="mx-0 my-0" />
                  <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
                    <InboxIcon className="h-7 w-7 text-muted-foreground mb-2" aria-hidden="true" />
                    <p className="text-sm font-medium text-foreground">No notifications</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Build events, CI results, and team activity will appear here.
                    </p>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>

              <UserMenu user={user} />
            </div>
          </div>
        </div>
      </header>

      <MobileNav
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        isAdmin={isAdmin}
      />
    </>
  );
}
