'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface PluginRow {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  version: string;
  author: string;
  icon: string | null;
  category: string;
  status: string;
  enabled: boolean;
  config_schema: Record<string, unknown>;
  default_config: Record<string, unknown>;
  permissions: string[];
  widget_slots: string[];
  installation?: {
    id: string;
    enabled: boolean;
    config: Record<string, unknown>;
  } | null;
}

interface PluginsResponse {
  data: PluginRow[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

interface PluginFilters {
  search?: string;
  category?: string;
  status?: string;
  page?: number;
}

export function usePlugins(filters: PluginFilters = {}) {
  const params = new URLSearchParams();
  if (filters.search) params.set('search', filters.search);
  if (filters.category) params.set('category', filters.category);
  if (filters.status) params.set('status', filters.status);
  if (filters.page) params.set('page', String(filters.page));

  return useQuery<PluginsResponse>({
    queryKey: ['plugins', filters],
    queryFn: async () => {
      const res = await fetch(`/api/plugins?${params}`);
      if (!res.ok) throw new Error('Failed to fetch plugins');
      return res.json();
    },
  });
}

export function usePlugin(slug: string) {
  return useQuery<PluginRow>({
    queryKey: ['plugin', slug],
    queryFn: async () => {
      const res = await fetch(`/api/plugins/${slug}`);
      if (!res.ok) throw new Error('Failed to fetch plugin');
      return res.json();
    },
    enabled: !!slug,
  });
}

export function useInstallPlugin() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ slug, config }: { slug: string; config?: Record<string, unknown> }) => {
      const res = await fetch(`/api/plugins/${slug}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config }),
      });
      if (!res.ok) throw new Error('Failed to install');
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['plugins'] });
    },
  });
}

export function useUninstallPlugin() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (slug: string) => {
      const res = await fetch(`/api/plugins/${slug}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to uninstall');
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['plugins'] });
    },
  });
}

export function useUpdatePluginConfig() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ slug, config }: { slug: string; config: Record<string, unknown> }) => {
      const res = await fetch(`/api/plugins/${slug}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config }),
      });
      if (!res.ok) throw new Error('Failed to update config');
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['plugins'] });
    },
  });
}
