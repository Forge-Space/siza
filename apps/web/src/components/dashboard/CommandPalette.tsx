'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Command } from 'cmdk';
import {
  SearchIcon,
  PlusIcon,
  FileTextIcon,
  FolderIcon,
  ClockIcon,
  SettingsIcon,
  CreditCardIcon,
  KeyIcon,
  LayoutDashboardIcon,
  RocketIcon,
  BookOpenIcon,
  LayersIcon,
  LoaderIcon,
  PuzzleIcon,
} from 'lucide-react';
import { useUIStore } from '@/stores/ui-store';

interface CommandItem {
  label: string;
  icon: React.ElementType;
  href: string;
  shortcut?: string;
  group: 'actions' | 'pages';
}

interface SearchResult {
  id: string;
  title: string;
  subtitle?: string;
  type: 'project' | 'catalog' | 'golden-path' | 'template' | 'plugin';
  href: string;
}

const TYPE_ICONS: Record<string, React.ElementType> = {
  project: FolderIcon,
  catalog: LayersIcon,
  'golden-path': RocketIcon,
  template: FileTextIcon,
  plugin: PuzzleIcon,
};

const TYPE_LABELS: Record<string, string> = {
  project: 'Projects',
  catalog: 'Catalog',
  'golden-path': 'Golden Paths',
  template: 'Templates',
  plugin: 'Plugins',
};

const items: CommandItem[] = [
  { label: 'New Generation', icon: PlusIcon, href: '/generate', shortcut: '⌘N', group: 'actions' },
  { label: 'Browse Templates', icon: FileTextIcon, href: '/templates', group: 'actions' },
  { label: 'View Catalog', icon: BookOpenIcon, href: '/catalog', group: 'actions' },
  { label: 'Golden Paths', icon: RocketIcon, href: '/golden-paths', group: 'actions' },
  { label: 'Dashboard', icon: LayoutDashboardIcon, href: '/dashboard', group: 'pages' },
  { label: 'Projects', icon: FolderIcon, href: '/projects', shortcut: '⌘1', group: 'pages' },
  { label: 'Templates', icon: FileTextIcon, href: '/templates', shortcut: '⌘2', group: 'pages' },
  { label: 'History', icon: ClockIcon, href: '/history', shortcut: '⌘3', group: 'pages' },
  { label: 'Settings', icon: SettingsIcon, href: '/settings', shortcut: '⌘4', group: 'pages' },
  { label: 'AI Keys', icon: KeyIcon, href: '/ai-keys', group: 'pages' },
  { label: 'Billing', icon: CreditCardIcon, href: '/billing', group: 'pages' },
];

const GROUP_HEADING_CLASS =
  '[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-text-muted-foreground [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider';

const ITEM_CLASS =
  'relative flex cursor-pointer select-none items-center gap-3 rounded-md px-2 py-2 text-sm text-text-secondary outline-none data-[selected=true]:bg-brand/10 data-[selected=true]:text-brand-light hover:bg-surface-2 transition-colors duration-100';

export function CommandPalette() {
  const open = useUIStore((s) => s.commandPaletteOpen);
  const setOpen = useUIStore((s) => s.setCommandPaletteOpen);
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const handleSelect = useCallback(
    (href: string) => {
      setOpen(false);
      setQuery('');
      setResults([]);
      router.push(href);
    },
    [router, setOpen]
  );

  useEffect(() => {
    if (!open) {
      setQuery('');
      setResults([]);
      return;
    }
    const prev = document.activeElement as HTMLElement | null;
    return () => {
      prev?.focus();
    };
  }, [open]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (query.length < 2) {
      setResults([]);
      setSearching(false);
      return;
    }

    setSearching(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          const json = await res.json();
          setResults(json.results || []);
        }
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 250);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  if (!open) return null;

  const actions = items.filter((i) => i.group === 'actions');
  const pages = items.filter((i) => i.group === 'pages');
  const hasResults = results.length > 0;
  const showStatic = query.length < 2;

  const resultsByType = results.reduce<Record<string, SearchResult[]>>((acc, r) => {
    (acc[r.type] ??= []).push(r);
    return acc;
  }, {});

  return (
    <div
      className="fixed inset-0 z-50"
      role="dialog"
      aria-modal="true"
      aria-label="Command palette"
    >
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in-0 duration-150"
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />
      <div className="fixed inset-x-0 top-[20vh] mx-auto max-w-lg px-4">
        <Command
          className="rounded-xl border border-surface-3 bg-surface-1 shadow-2xl overflow-hidden animate-in fade-in-0 zoom-in-95 duration-150"
          loop
          shouldFilter={showStatic}
        >
          <div className="flex items-center gap-2 border-b border-surface-3 px-3 h-12">
            {searching ? (
              <LoaderIcon className="h-4 w-4 shrink-0 text-text-muted-foreground animate-spin" />
            ) : (
              <SearchIcon className="h-4 w-4 shrink-0 text-text-muted-foreground" />
            )}
            {/* eslint-disable jsx-a11y/no-autofocus */}
            <Command.Input
              placeholder="Search projects, catalog, templates..."
              className="flex h-full w-full bg-transparent text-sm text-text-primary outline-none placeholder:text-text-muted-foreground"
              autoFocus
              value={query}
              onValueChange={setQuery}
            />
            {/* eslint-enable jsx-a11y/no-autofocus */}
          </div>
          <div
            aria-live="polite"
            aria-atomic="true"
            className="sr-only"
          >
            {searching ? 'Searching…' : hasResults ? `${results.length} results found` : ''}
          </div>
          <Command.List className="max-h-[300px] overflow-y-auto p-2">
            <Command.Empty className="py-6 text-center text-sm text-text-muted-foreground">
              {searching ? 'Searching...' : 'No results found.'}
            </Command.Empty>

            {hasResults &&
              Object.entries(resultsByType).map(([type, typeItems]) => {
                const Icon = TYPE_ICONS[type] || FileTextIcon;
                return (
                  <Command.Group
                    key={type}
                    heading={TYPE_LABELS[type] || type}
                    className={GROUP_HEADING_CLASS}
                  >
                    {typeItems.map((r) => (
                      <Command.Item
                        key={r.id}
                        value={`${r.title} ${r.subtitle || ''}`}
                        onSelect={() => handleSelect(r.href)}
                        className={ITEM_CLASS}
                      >
                        <Icon className="h-4 w-4 shrink-0 text-text-muted-foreground" />
                        <div className="flex flex-col min-w-0">
                          <span className="truncate">{r.title}</span>
                          {r.subtitle && (
                            <span className="text-[11px] text-text-muted truncate">{r.subtitle}</span>
                          )}
                        </div>
                      </Command.Item>
                    ))}
                  </Command.Group>
                );
              })}

            {showStatic && (
              <>
                <Command.Group heading="Quick Actions" className={GROUP_HEADING_CLASS}>
                  {actions.map((item) => (
                    <Command.Item
                      key={item.label}
                      value={item.label}
                      onSelect={() => handleSelect(item.href)}
                      className={ITEM_CLASS}
                    >
                      <item.icon className="h-4 w-4 shrink-0 text-text-muted-foreground" />
                      <span className="flex-1">{item.label}</span>
                      {item.shortcut && (
                        <span className="text-xs text-text-muted-foreground opacity-50 font-mono">
                          {item.shortcut}
                        </span>
                      )}
                    </Command.Item>
                  ))}
                </Command.Group>
                <Command.Separator className="mx-2 my-1 h-px bg-surface-3" />
                <Command.Group heading="Pages" className={GROUP_HEADING_CLASS}>
                  {pages.map((item) => (
                    <Command.Item
                      key={item.label}
                      value={item.label}
                      onSelect={() => handleSelect(item.href)}
                      className={ITEM_CLASS}
                    >
                      <item.icon className="h-4 w-4 shrink-0 text-text-muted-foreground" />
                      <span className="flex-1">{item.label}</span>
                      {item.shortcut && (
                        <span className="text-xs text-text-muted-foreground opacity-50 font-mono">
                          {item.shortcut}
                        </span>
                      )}
                    </Command.Item>
                  ))}
                </Command.Group>
              </>
            )}
          </Command.List>
          <div className="border-t border-surface-3 px-3 py-2 flex items-center justify-between text-[11px] text-text-muted">
            <span>↑↓ navigate · ↵ select · Esc close</span>
            <span className="font-mono text-text-muted-foreground opacity-60">⌘K</span>
          </div>
        </Command>
      </div>
    </div>
  );
}
