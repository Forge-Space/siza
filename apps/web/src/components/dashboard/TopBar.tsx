'use client';

import type { User } from '@supabase/supabase-js';
import { MenuIcon, SearchIcon, ChevronRightIcon, BellIcon } from 'lucide-react';
import Link from 'next/link';
import UserMenu from './UserMenu';
import MobileNav from './MobileNav';
import { usePageMeta } from '@/hooks/use-page-meta';
import { useUIStore } from '@/stores/ui-store';
import { useState } from 'react';

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
        <div className="h-full px-4 sm:px-6 lg:px-8">
          <div className="flex h-full items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                type="button"
                className="md:hidden -ml-2 inline-flex items-center justify-center rounded-md p-2 text-muted-foreground hover:bg-surface hover:text-foreground transition-colors focus-visible:shadow-glow-focus"
                onClick={() => setMobileMenuOpen(true)}
                aria-label={mobileMenuOpen ? 'Close main menu' : 'Open main menu'}
                aria-expanded={mobileMenuOpen}
              >
                <MenuIcon className="h-6 w-6" />
              </button>

              <button
                type="button"
                onClick={() => setCommandPaletteOpen(true)}
                className="hidden md:flex items-center gap-2 rounded-md bg-surface px-3 h-8 text-muted-foreground text-sm hover:bg-surface-alt hover:text-foreground transition-colors"
              >
                <SearchIcon className="h-3.5 w-3.5" />
                <span>Search...</span>
                <kbd className="ml-2 pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border border-border bg-background px-1.5 font-mono text-[10px] font-medium text-subtle">
                  ⌘K
                </kbd>
              </button>

              <nav aria-label="Breadcrumb" className="hidden md:flex items-center gap-1">
                {breadcrumbs.map((crumb, i) => (
                  <span key={crumb.href} className="flex items-center gap-1">
                    {i > 0 && <ChevronRightIcon className="h-3 w-3 text-subtle" />}
                    {i === breadcrumbs.length - 1 ? (
                      <span className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                        {PageIcon && <PageIcon className="h-4 w-4 text-subtle" />}
                        {crumb.label}
                      </span>
                    ) : (
                      <Link
                        href={crumb.href}
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {crumb.label}
                      </Link>
                    )}
                  </span>
                ))}
              </nav>

              <h2 className="md:hidden text-base font-semibold text-foreground">{title}</h2>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="relative rounded-md p-2 text-muted-foreground transition-colors hover:bg-surface hover:text-foreground"
                aria-label="Notifications"
              >
                <BellIcon className="h-4 w-4" />
                <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-primary ring-2 ring-background" />
              </button>
              <UserMenu user={user} />
            </div>
          </div>
        </div>
      </header>
      <MobileNav open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} isAdmin={isAdmin} />
    </>
  );
}
