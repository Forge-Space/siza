'use client';

import { useState } from 'react';
import { Search, Rocket, Code2, Globe, Server, Package, Cpu, ChevronRight } from 'lucide-react';
import { useGoldenPaths } from '@/hooks/use-golden-paths';

const typeIcons: Record<string, React.ReactNode> = {
  service: <Server className="h-5 w-5" />,
  library: <Package className="h-5 w-5" />,
  website: <Globe className="h-5 w-5" />,
  worker: <Cpu className="h-5 w-5" />,
  api: <Code2 className="h-5 w-5" />,
  package: <Package className="h-5 w-5" />,
};

const lifecycleColors: Record<string, string> = {
  ga: 'bg-green-500/20 text-green-400',
  beta: 'bg-yellow-500/20 text-yellow-400',
  draft: 'bg-zinc-500/20 text-zinc-400',
  deprecated: 'bg-red-500/20 text-red-400',
};

export function GoldenPathsClient() {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const { data, isLoading } = useGoldenPaths({
    search: search || undefined,
    type: typeFilter || undefined,
  });

  const templates = data?.templates || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Rocket className="h-6 w-6 text-violet-400" />
            Golden Paths
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Opinionated project templates with built-in best practices
          </p>
        </div>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search templates..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
          />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50"
        >
          <option value="">All Types</option>
          <option value="service">Service</option>
          <option value="library">Library</option>
          <option value="api">API</option>
          <option value="website">Website</option>
          <option value="worker">Worker</option>
          <option value="package">Package</option>
        </select>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-48 bg-zinc-900 border border-zinc-800 rounded-lg animate-pulse"
            />
          ))}
        </div>
      ) : templates.length === 0 ? (
        <div className="text-center py-16 text-zinc-500">
          <Rocket className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium">No templates found</p>
          <p className="text-sm mt-1">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {templates.map((template) => (
            <div
              key={template.id}
              className="bg-zinc-900 border border-zinc-800 rounded-lg p-5 hover:border-violet-500/50 transition-colors group"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-violet-500/10 text-violet-400">
                    {typeIcons[template.type] || <Code2 className="h-5 w-5" />}
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{template.display_name}</h3>
                    <p className="text-xs text-zinc-500">
                      {template.framework} · {template.language}
                    </p>
                  </div>
                </div>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${lifecycleColors[template.lifecycle] || lifecycleColors.draft}`}
                >
                  {template.lifecycle}
                </span>
              </div>

              {template.description && (
                <p className="text-sm text-zinc-400 mt-3 line-clamp-2">{template.description}</p>
              )}

              {template.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {template.tags.slice(0, 4).map((tag) => (
                    <span
                      key={tag}
                      className="text-xs bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between mt-4 pt-3 border-t border-zinc-800">
                <span className="text-xs text-zinc-500">
                  {template.steps?.length || 0} steps · {template.parameters?.length || 0} params
                </span>
                <button className="text-xs text-violet-400 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  Use template
                  <ChevronRight className="h-3 w-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {data?.pagination && data.pagination.pages > 1 && (
        <div className="flex justify-center gap-2 text-sm text-zinc-400">
          <span>
            Page {data.pagination.page} of {data.pagination.pages}
          </span>
        </div>
      )}
    </div>
  );
}
