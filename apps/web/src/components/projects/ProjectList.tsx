'use client';

import { useState } from 'react';
import { useProjects } from '@/hooks/use-projects';
import { useRealtimeProjects } from '@/hooks/use-realtime-projects';
import ProjectGrid from './ProjectGrid';
import ProjectFilters from './ProjectFilters';
import EmptyState from '@/components/ui/EmptyState';
import { Skeleton } from '@siza/ui';
import { FolderIcon, LayoutGridIcon, ListIcon } from 'lucide-react';

function ProjectCardSkeleton() {
  return (
    <div className="bg-surface-1 rounded-xl border border-surface-3 overflow-hidden">
      <Skeleton className="aspect-video w-full rounded-none" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <div className="flex items-center justify-between pt-2">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
    </div>
  );
}

export { ProjectCardSkeleton };

export default function ProjectList() {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'updated' | 'created' | 'name'>('updated');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const { data: projects, isLoading, error } = useProjects();

  useRealtimeProjects();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <ProjectCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Failed to load projects. Please try again.</p>
      </div>
    );
  }

  if (!projects || projects.length === 0) {
    return (
      <EmptyState
        icon={FolderIcon}
        title="No projects yet"
        description="Get started by creating your first project"
        actionLabel="Create Project"
        actionHref="/projects/new"
      />
    );
  }

  const filteredProjects = projects
    .filter((project) => project.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      }
      if (sortBy === 'created') {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
      return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
    });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <ProjectFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          sortBy={sortBy}
          onSortChange={setSortBy}
        />
        <div
          className="flex rounded-lg border border-border bg-surface p-0.5"
          role="tablist"
          aria-label="View mode"
        >
          <button
            type="button"
            aria-pressed={viewMode === 'grid'}
            aria-label="Grid view"
            onClick={() => setViewMode('grid')}
            className={`rounded-md p-2 transition-colors ${
              viewMode === 'grid'
                ? 'border border-primary/20 bg-primary/10 text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <LayoutGridIcon className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-pressed={viewMode === 'list'}
            aria-label="List view"
            onClick={() => setViewMode('list')}
            className={`rounded-md p-2 transition-colors ${
              viewMode === 'list'
                ? 'border border-primary/20 bg-primary/10 text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <ListIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
      <ProjectGrid projects={filteredProjects} viewMode={viewMode} />
    </div>
  );
}
