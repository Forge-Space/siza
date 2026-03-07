'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { CatalogEntryRow } from '@/lib/repositories/catalog.repo';

interface CatalogResponse {
  entries: CatalogEntryRow[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

interface CatalogEntryDetail {
  entry: CatalogEntryRow;
  dependencies: CatalogEntryRow[];
  dependents: CatalogEntryRow[];
  scorecard?: {
    id: string;
    project_id: string;
    overall_score: number;
    security_score: number;
    quality_score: number;
    performance_score: number;
    compliance_score: number;
    violations: string[];
    recommendations: string[];
    created_at: string;
  };
}

export interface CatalogFilters {
  search?: string;
  type?: string;
  lifecycle?: string;
  tags?: string;
  page?: number;
  limit?: number;
}

export function useCatalog(filters: CatalogFilters = {}) {
  return useQuery({
    queryKey: ['catalog', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.search) params.set('search', filters.search);
      if (filters.type) params.set('type', filters.type);
      if (filters.lifecycle) params.set('lifecycle', filters.lifecycle);
      if (filters.tags) params.set('tags', filters.tags);
      if (filters.page) params.set('page', String(filters.page));
      if (filters.limit) params.set('limit', String(filters.limit));

      const res = await fetch(`/api/catalog?${params}`);
      if (!res.ok) throw new Error('Failed to fetch catalog');
      const json = await res.json();
      return json.data as CatalogResponse;
    },
  });
}

export function useCatalogEntry(id: string) {
  return useQuery({
    queryKey: ['catalog', id],
    queryFn: async () => {
      const res = await fetch(`/api/catalog/${id}`);
      if (!res.ok) throw new Error('Failed to fetch entry');
      const json = await res.json();
      return json.data as CatalogEntryDetail;
    },
    enabled: !!id,
  });
}

export function useCreateCatalogEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (entry: Record<string, unknown>) => {
      const res = await fetch('/api/catalog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to create entry');
      }
      const json = await res.json();
      return json.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['catalog'] });
    },
  });
}

export function useDeleteCatalogEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/catalog/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete entry');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['catalog'] });
    },
  });
}
