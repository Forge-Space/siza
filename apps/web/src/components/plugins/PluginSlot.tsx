'use client';

import { usePlugins } from '@/hooks/use-plugins';
import { AlertTriangle, Shield, Lock, TrendingUp, ClipboardCheck, Package } from 'lucide-react';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  AlertTriangle,
  Shield,
  Lock,
  TrendingUp,
  ClipboardCheck,
  Package,
};

interface PluginSlotProps {
  name: string;
  entityId?: string;
  className?: string;
}

export function PluginSlot({ name, entityId, className }: PluginSlotProps) {
  const { data } = usePlugins();

  const activeWidgets =
    data?.data.filter((p) => p.installation?.enabled && p.widget_slots.includes(name)) ?? [];

  if (activeWidgets.length === 0) return null;

  return (
    <div className={className}>
      {activeWidgets.map((plugin) => (
        <PluginWidget key={plugin.slug} plugin={plugin} entityId={entityId} />
      ))}
    </div>
  );
}

interface PluginWidgetProps {
  plugin: {
    slug: string;
    name: string;
    description: string | null;
    icon: string | null;
    category: string;
    installation?: {
      config: Record<string, unknown>;
    } | null;
  };
  entityId?: string;
}

function PluginWidget({ plugin, entityId }: PluginWidgetProps) {
  const Icon = plugin.icon ? ICON_MAP[plugin.icon] : Shield;

  return (
    <div className="rounded-lg border border-border/50 bg-surface/50 p-4">
      <div className="mb-3 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-brand/10">
          {Icon && <Icon className="h-4 w-4 text-brand" />}
        </div>
        <div>
          <h4 className="text-sm font-medium text-text-primary">{plugin.name}</h4>
          <span className="text-xs text-text-tertiary capitalize">{plugin.category}</span>
        </div>
      </div>
      <p className="text-xs text-text-secondary leading-relaxed">{plugin.description}</p>
      {entityId && (
        <div className="mt-3 flex items-center gap-1.5 text-xs text-text-tertiary">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
          Active on this entity
        </div>
      )}
    </div>
  );
}
