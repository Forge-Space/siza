'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { XIcon, PlusIcon } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { getDashboardNavigation } from './navigation';

interface MobileNavProps {
  open: boolean;
  onClose: () => void;
  isAdmin: boolean;
}

export default function MobileNav({ open, onClose, isAdmin }: MobileNavProps) {
  const pathname = usePathname();
  const panelRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const navigationItems = getDashboardNavigation(isAdmin);

  useEffect(() => {
    if (!open) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    const handleFocusTrap = (e: KeyboardEvent) => {
      if (e.key !== 'Tab' || !panelRef.current) return;

      const focusableElements = panelRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement?.focus();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement?.focus();
      }
    };

    document.addEventListener('keydown', handleEscape);
    document.addEventListener('keydown', handleFocusTrap);

    closeButtonRef.current?.focus();

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('keydown', handleFocusTrap);
    };
  }, [open, onClose]);

  if (!open) return null;

  const handleBackdropClick = () => {
    onClose();
  };

  const handleBackdropKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClose();
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 opacity-100 transition-opacity duration-200"
        onClick={handleBackdropClick}
        onKeyDown={handleBackdropKeyDown}
        tabIndex={0}
        role="button"
        aria-label="Close navigation"
      />
      <div
        ref={panelRef}
        className="fixed inset-y-0 left-0 flex flex-col w-64 bg-surface-1 border-r border-surface-3 z-50"
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation"
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-surface-3 shrink-0">
          <h1 className="text-base font-display font-bold text-text-primary">Siza</h1>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-md text-text-muted-foreground hover:text-text-primary hover:bg-surface-2 transition-colors duration-100"
            aria-label="Close navigation"
          >
            <XIcon className="h-5 w-5" />
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto px-2 py-4">
          <Link
            href="/generate"
            onClick={onClose}
            className="group flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg bg-brand/10 text-brand-light border border-brand/20 hover:bg-brand/15 transition-colors duration-100 mb-4 min-h-[44px]"
          >
            <PlusIcon className="h-4 w-4 shrink-0" />
            New Generation
          </Link>
          <div className="space-y-0.5">
            {navigationItems.map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={onClose}
                  className={`group relative flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-md min-h-[44px] transition-colors duration-100 ${
                    isActive
                      ? 'bg-brand/10 text-brand-light before:absolute before:left-0 before:top-2 before:bottom-2 before:w-0.5 before:rounded-full before:bg-brand-light'
                      : 'text-text-secondary hover:bg-surface-2 hover:text-text-primary'
                  }`}
                >
                  <item.icon
                    className={`h-4 w-4 shrink-0 ${
                      isActive
                        ? 'text-brand-light'
                        : 'text-text-muted-foreground group-hover:text-text-secondary'
                    }`}
                  />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </>
  );
}
