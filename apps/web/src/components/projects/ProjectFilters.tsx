'use client';

import { SearchIcon } from 'lucide-react';

interface ProjectFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortBy: 'updated' | 'created' | 'name';
  onSortChange: (sort: 'updated' | 'created' | 'name') => void;
}

export default function ProjectFilters({
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
}: ProjectFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="flex-1 relative">
        <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-subtle" />
        <input
          type="text"
          placeholder="Search projects..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full rounded-lg border border-border bg-surface py-2 pl-10 pr-4 text-foreground focus:border-primary focus:ring-primary"
        />
      </div>
      <select
        value={sortBy}
        onChange={(e) => onSortChange(e.target.value as 'updated' | 'created' | 'name')}
        className="rounded-lg border border-border bg-surface px-4 py-2 text-foreground focus:border-primary focus:ring-primary"
      >
        <option value="updated">Last Updated</option>
        <option value="created">Date Created</option>
        <option value="name">Name</option>
      </select>
    </div>
  );
}
