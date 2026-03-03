import {
  CreditCardIcon,
  FileTextIcon,
  FolderIcon,
  KeyIcon,
  LayoutDashboardIcon,
  PlusIcon,
  SettingsIcon,
  ClockIcon,
  ShieldIcon,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface DashboardNavItem {
  name: string;
  href: string;
  icon: LucideIcon;
  shortcut?: string;
}

const baseDashboardNavigation: DashboardNavItem[] = [
  { name: 'Projects', href: '/projects', icon: FolderIcon, shortcut: '⌘1' },
  { name: 'Templates', href: '/templates', icon: FileTextIcon, shortcut: '⌘2' },
  { name: 'History', href: '/history', icon: ClockIcon, shortcut: '⌘3' },
  { name: 'AI Keys', href: '/ai-keys', icon: KeyIcon },
  { name: 'Billing', href: '/billing', icon: CreditCardIcon },
  { name: 'Settings', href: '/settings', icon: SettingsIcon, shortcut: '⌘4' },
];

const adminDashboardNavigation: DashboardNavItem[] = [
  { name: 'Admin', href: '/admin', icon: ShieldIcon },
];

export function getDashboardNavigation(isAdmin: boolean): DashboardNavItem[] {
  return isAdmin
    ? [...baseDashboardNavigation, ...adminDashboardNavigation]
    : baseDashboardNavigation;
}

export function getDashboardPages(isAdmin: boolean): DashboardNavItem[] {
  return [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboardIcon },
    { name: 'Generator', href: '/generate', icon: PlusIcon },
    ...getDashboardNavigation(isAdmin),
  ];
}
