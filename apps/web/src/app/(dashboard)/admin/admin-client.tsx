'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Loader2, PlusCircle, ShieldCheck, Trash2 } from 'lucide-react';
import { DashboardSection } from '@/components/migration/migration-primitives';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

interface FeatureFlag {
  id: string;
  name: string;
  description: string | null;
  category: string;
  enabled: boolean;
  scope: string[] | null;
  enabled_for_users: string[] | null;
}

interface FeatureFlagsResponse {
  data?: FeatureFlag[];
  error?: string;
}

const categories = [
  'auth',
  'ui',
  'generation',
  'storage',
  'analytics',
  'system',
  'integration',
  'quality',
  'email',
  'billing',
];

export function AdminClient() {
  const [flags, setFlags] = useState<FeatureFlag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newFlagName, setNewFlagName] = useState('');
  const [newFlagDescription, setNewFlagDescription] = useState('');
  const [newFlagCategory, setNewFlagCategory] = useState('system');
  const [newFlagEnabled, setNewFlagEnabled] = useState(false);
  const [busyIds, setBusyIds] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const sortedFlags = useMemo(
    () =>
      [...flags].sort((a, b) => {
        if (a.category !== b.category) return a.category.localeCompare(b.category);
        return a.name.localeCompare(b.name);
      }),
    [flags]
  );

  const loadFlags = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/features', { cache: 'no-store' });
      const payload = (await response.json()) as FeatureFlagsResponse;

      if (!response.ok || !payload.data) {
        throw new Error(payload.error || 'Failed to fetch feature flags');
      }

      setFlags(payload.data);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch feature flags';
      toast({
        variant: 'destructive',
        title: 'Could not load feature flags',
        description: message,
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    void loadFlags();
  }, [loadFlags]);

  const setBusy = (id: string, value: boolean) => {
    setBusyIds((prev) => {
      const next = new Set(prev);
      if (value) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const handleToggleFlag = async (flag: FeatureFlag) => {
    setBusy(flag.id, true);
    try {
      const response = await fetch(`/api/features/${flag.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: !flag.enabled }),
      });

      const payload = (await response.json()) as { data?: FeatureFlag; error?: string };
      if (!response.ok || !payload.data) {
        throw new Error(payload.error || 'Failed to update feature flag');
      }

      setFlags((prev) => prev.map((item) => (item.id === flag.id ? payload.data! : item)));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update feature flag';
      toast({
        variant: 'destructive',
        title: `Could not ${flag.enabled ? 'disable' : 'enable'} ${flag.name}`,
        description: message,
      });
    } finally {
      setBusy(flag.id, false);
    }
  };

  const handleDeleteFlag = async (flag: FeatureFlag) => {
    setBusy(flag.id, true);
    try {
      const response = await fetch(`/api/features/${flag.id}`, {
        method: 'DELETE',
      });
      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(payload.error || 'Failed to delete feature flag');
      }

      setFlags((prev) => prev.filter((item) => item.id !== flag.id));
      toast({
        title: 'Feature flag deleted',
        description: `${flag.name} has been removed.`,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete feature flag';
      toast({
        variant: 'destructive',
        title: `Could not delete ${flag.name}`,
        description: message,
      });
    } finally {
      setBusy(flag.id, false);
    }
  };

  const handleCreateFlag = async () => {
    const normalizedName = newFlagName.trim().toUpperCase();

    if (!/^[A-Z][A-Z0-9_]+$/.test(normalizedName)) {
      toast({
        variant: 'destructive',
        title: 'Invalid flag name',
        description: 'Use UPPER_SNAKE_CASE (example: ENABLE_NEW_DASHBOARD).',
      });
      return;
    }

    setIsCreating(true);
    try {
      const response = await fetch('/api/features', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: normalizedName,
          description: newFlagDescription.trim() || null,
          category: newFlagCategory,
          enabled: newFlagEnabled,
        }),
      });

      const payload = (await response.json()) as { data?: FeatureFlag; error?: string };
      if (!response.ok || !payload.data) {
        throw new Error(payload.error || 'Failed to create feature flag');
      }

      setFlags((prev) => [payload.data!, ...prev]);
      setNewFlagName('');
      setNewFlagDescription('');
      setNewFlagCategory('system');
      setNewFlagEnabled(false);
      toast({
        title: 'Feature flag created',
        description: `${payload.data.name} is now available.`,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create feature flag';
      toast({
        variant: 'destructive',
        title: 'Could not create feature flag',
        description: message,
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      <DashboardSection
        title="Admin"
        description="Manage feature flags and system behavior for all users."
        actions={<ShieldCheck className="h-5 w-5 text-text-muted-foreground" />}
      />

      <Card>
        <CardHeader>
          <CardTitle>Create feature flag</CardTitle>
          <CardDescription>
            Use this panel to create and control rollout switches for Siza features.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2">
            <Input
              value={newFlagName}
              onChange={(event) => setNewFlagName(event.target.value)}
              placeholder="ENABLE_EXPERIMENTAL_WIDGET"
              aria-label="Feature flag name"
            />
            <select
              value={newFlagCategory}
              onChange={(event) => setNewFlagCategory(event.target.value)}
              className="h-10 rounded-md border border-input bg-background px-3 text-sm text-foreground"
              aria-label="Feature flag category"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <Input
            value={newFlagDescription}
            onChange={(event) => setNewFlagDescription(event.target.value)}
            placeholder="Optional description"
            aria-label="Feature flag description"
          />

          <label className="inline-flex items-center gap-2 text-sm text-text-secondary">
            <input
              type="checkbox"
              checked={newFlagEnabled}
              onChange={(event) => setNewFlagEnabled(event.target.checked)}
              className="h-4 w-4 accent-brand"
            />
            Start as enabled
          </label>

          <div>
            <Button onClick={handleCreateFlag} disabled={isCreating}>
              {isCreating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating
                </>
              ) : (
                <>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Create flag
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Feature flags</CardTitle>
          <CardDescription>
            Toggle or remove flags. Changes are applied immediately to next flag resolution call.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12 text-text-secondary">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Loading feature flags...
            </div>
          ) : sortedFlags.length === 0 ? (
            <p className="py-12 text-center text-sm text-text-secondary">
              No feature flags found. Create your first one above.
            </p>
          ) : (
            <div className="siza-scrollbar overflow-x-auto">
              <table className="min-w-full divide-y divide-surface-3 text-sm">
                <thead>
                  <tr className="text-left text-text-muted-foreground">
                    <th className="px-4 py-3 font-medium">Flag</th>
                    <th className="px-4 py-3 font-medium">Category</th>
                    <th className="px-4 py-3 font-medium">Enabled</th>
                    <th className="px-4 py-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-3">
                  {sortedFlags.map((flag) => {
                    const isBusy = busyIds.has(flag.id);
                    return (
                      <tr key={flag.id} className="hover:bg-surface-2/50 transition-colors">
                        <td className="px-4 py-3">
                          <p className="font-medium text-text-primary">{flag.name}</p>
                          {flag.description ? (
                            <p className="mt-0.5 text-xs text-text-secondary">{flag.description}</p>
                          ) : (
                            <p className="mt-0.5 text-xs text-text-muted-foreground">
                              No description
                            </p>
                          )}
                        </td>
                        <td className="px-4 py-3 text-text-secondary">{flag.category}</td>
                        <td className="px-4 py-3">
                          <label className="inline-flex items-center gap-2 text-xs text-text-secondary">
                            <input
                              type="checkbox"
                              checked={flag.enabled}
                              onChange={() => void handleToggleFlag(flag)}
                              disabled={isBusy}
                              className="h-4 w-4 accent-brand"
                            />
                            {flag.enabled ? 'Enabled' : 'Disabled'}
                          </label>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => void handleDeleteFlag(flag)}
                            disabled={isBusy}
                            className="text-error hover:text-error/80"
                          >
                            {isBusy ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                            <span className="sr-only">Delete {flag.name}</span>
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
