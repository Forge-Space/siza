'use client';

import { useProjects } from '@/hooks/use-projects';
import { Skeleton } from '@siza/ui';
import {
  FolderIcon,
  SparklesIcon,
  ClockIcon,
  TrendingUpIcon,
  PlusIcon,
  ArrowRightIcon,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useMemo, useState } from 'react';

interface StatCardProps {
  label: string;
  value: string;
  icon: React.ElementType;
  href: string;
  accent: string;
  accentBg: string;
}

function StatCard({ label, value, icon: Icon, href, accent, accentBg }: StatCardProps) {
  return (
    <Link
      href={href}
      className="group relative rounded-xl border border-surface-3 bg-surface-1 p-5 transition-all duration-200 hover:border-brand/40 hover:shadow-[0_0_24px_rgba(124,58,237,0.08)] overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-brand/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="relative flex items-center justify-between">
        <div className={`rounded-lg p-2.5 ${accentBg} transition-colors`}>
          <Icon className={`h-5 w-5 ${accent}`} />
        </div>
        <ArrowRightIcon className="h-4 w-4 text-text-muted opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
      </div>
      <p className="relative mt-4 text-2xl font-semibold font-display text-text-primary">{value}</p>
      <p className="relative mt-1 text-sm text-text-secondary">{label}</p>
    </Link>
  );
}

function StatCardSkeleton() {
  return (
    <div className="rounded-xl border border-surface-3 bg-surface-1 p-5">
      <Skeleton className="h-10 w-10 rounded-lg" />
      <Skeleton className="mt-4 h-7 w-16" />
      <Skeleton className="mt-2 h-4 w-24" />
    </div>
  );
}

function RecentProjectCard({
  name,
  description,
  updatedAt,
  id,
}: {
  name: string;
  description: string | null;
  updatedAt: string;
  id: string;
}) {
  const [mountTime] = useState(() => Date.now());
  const timeAgo = useMemo(() => {
    const diff = mountTime - new Date(updatedAt).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  }, [updatedAt, mountTime]);

  return (
    <Link
      href={`/projects/${id}`}
      className="group flex items-center gap-4 rounded-lg border border-surface-3 bg-surface-1 p-4 transition-all duration-200 hover:border-brand/30 hover:bg-surface-1/80"
    >
      <div className="flex-shrink-0 rounded-lg bg-brand/10 p-2.5">
        <FolderIcon className="h-5 w-5 text-brand-light" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-text-primary group-hover:text-brand-light transition-colors">
          {name}
        </p>
        {description && (
          <p className="mt-0.5 truncate text-xs text-text-secondary">{description}</p>
        )}
      </div>
      <span className="flex-shrink-0 text-xs text-text-muted">{timeAgo}</span>
    </Link>
  );
}

function QuickAction({
  href,
  icon: Icon,
  label,
  description,
}: {
  href: string;
  icon: React.ElementType;
  label: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-3 rounded-lg border border-surface-3 bg-surface-1 p-4 transition-all duration-200 hover:border-brand/30 hover:shadow-[0_0_16px_rgba(124,58,237,0.06)]"
    >
      <div className="rounded-lg bg-brand/10 p-2 group-hover:bg-brand/20 transition-colors">
        <Icon className="h-4 w-4 text-brand-light" />
      </div>
      <div>
        <p className="text-sm font-medium text-text-primary">{label}</p>
        <p className="text-xs text-text-secondary">{description}</p>
      </div>
    </Link>
  );
}

export function DashboardClient() {
  const { data: projects, isLoading } = useProjects();
  const [mountTime] = useState(() => Date.now());

  const stats = useMemo(() => {
    if (!projects) return null;
    const total = projects.length;
    const thisWeek = projects.filter((p) => {
      const created = new Date(p.created_at);
      const weekAgo = new Date(mountTime - 7 * 24 * 60 * 60 * 1000);
      return created > weekAgo;
    }).length;
    return { total, thisWeek };
  }, [projects, mountTime]);

  const recentProjects = useMemo(() => {
    if (!projects) return [];
    return projects.slice(0, 5);
  }, [projects]);

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="mt-2 h-5 w-72" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <StatCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold font-display tracking-tight text-text-primary">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-text-secondary">Overview of your workspace</p>
        </div>
        <Button
          asChild
          className="bg-brand hover:bg-brand-light shadow-[0_0_20px_rgba(124,58,237,0.15)] hover:shadow-[0_0_28px_rgba(124,58,237,0.25)] transition-all"
        >
          <Link href="/generate">
            <SparklesIcon className="mr-2 h-4 w-4" />
            Generate
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Projects"
          value={String(stats?.total ?? 0)}
          icon={FolderIcon}
          href="/projects"
          accent="text-violet-400"
          accentBg="bg-violet-500/10"
        />
        <StatCard
          label="This Week"
          value={String(stats?.thisWeek ?? 0)}
          icon={TrendingUpIcon}
          href="/projects"
          accent="text-emerald-400"
          accentBg="bg-emerald-500/10"
        />
        <StatCard
          label="Generate"
          value="New"
          icon={SparklesIcon}
          href="/generate"
          accent="text-amber-400"
          accentBg="bg-amber-500/10"
        />
        <StatCard
          label="History"
          value="View"
          icon={ClockIcon}
          href="/history"
          accent="text-sky-400"
          accentBg="bg-sky-500/10"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold font-display text-text-primary">
              Recent Projects
            </h2>
            <Link
              href="/projects"
              className="text-sm text-brand-light hover:text-brand transition-colors"
            >
              View all
            </Link>
          </div>

          {recentProjects.length === 0 ? (
            <div className="rounded-xl border border-surface-3 bg-surface-1 p-8 text-center">
              <div className="mx-auto w-12 h-12 rounded-xl bg-brand/10 flex items-center justify-center">
                <FolderIcon className="h-6 w-6 text-brand-light" />
              </div>
              <p className="mt-4 text-sm font-medium text-text-primary">No projects yet</p>
              <p className="mt-1 text-xs text-text-secondary">
                Create your first project to get started
              </p>
              <Button asChild className="mt-4 bg-brand hover:bg-brand-light" size="sm">
                <Link href="/projects/new">
                  <PlusIcon className="mr-2 h-4 w-4" />
                  New Project
                </Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {recentProjects.map((project) => (
                <RecentProjectCard
                  key={project.id}
                  id={project.id}
                  name={project.name}
                  description={project.description}
                  updatedAt={project.updated_at}
                />
              ))}
            </div>
          )}
        </div>

        <div>
          <h2 className="text-lg font-semibold font-display text-text-primary mb-4">
            Quick Actions
          </h2>
          <div className="space-y-2">
            <QuickAction
              href="/generate"
              icon={SparklesIcon}
              label="Generate Component"
              description="AI-powered code generation"
            />
            <QuickAction
              href="/projects/new"
              icon={PlusIcon}
              label="New Project"
              description="Start a new workspace"
            />
            <QuickAction
              href="/templates"
              icon={FolderIcon}
              label="Browse Templates"
              description="Pre-built component library"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
