'use client';

import ProjectCard from './ProjectCard';
import type { Database } from '@/lib/supabase/database.types';

type Project = Database['public']['Tables']['projects']['Row'];

interface ProjectGridProps {
  projects: Project[];
  viewMode: 'grid' | 'list';
}

export default function ProjectGrid({ projects, viewMode }: ProjectGridProps) {
  return (
    <div
      className={
        viewMode === 'grid'
          ? 'grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'
          : 'grid grid-cols-1 gap-4'
      }
    >
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} compact={viewMode === 'list'} />
      ))}
    </div>
  );
}
