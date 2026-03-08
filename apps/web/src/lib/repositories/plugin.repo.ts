import { getClient, paginationRange, type PaginatedResult } from './base.repo';

export interface PluginRow {
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
  routes: unknown[];
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface PluginInstallationRow {
  id: string;
  plugin_id: string;
  user_id: string;
  enabled: boolean;
  config: Record<string, unknown>;
  installed_at: string;
  updated_at: string;
}

export interface PluginWithInstallation extends PluginRow {
  installation?: PluginInstallationRow | null;
}

export interface PluginListParams {
  search?: string;
  category?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export async function listPlugins(
  params: PluginListParams = {}
): Promise<PaginatedResult<PluginRow>> {
  const supabase = await getClient();
  const { page = 1, limit = 20, search, category, status } = params;
  const { from, to } = paginationRange(page, limit);

  let query = supabase
    .from('plugins')
    .select('*', { count: 'exact' })
    .eq('enabled', true)
    .order('name');

  if (search) query = query.ilike('name', `%${search}%`);
  if (category) query = query.eq('category', category);
  if (status) query = query.eq('status', status);

  query = query.range(from, to);

  const { data, error, count } = await query;
  if (error) throw error;

  const total = count ?? 0;
  return {
    data: (data ?? []) as PluginRow[],
    total,
    page,
    limit,
    hasMore: from + limit < total,
  };
}

export async function findPluginBySlug(slug: string): Promise<PluginRow | null> {
  const supabase = await getClient();
  const { data, error } = await supabase.from('plugins').select('*').eq('slug', slug).single();
  if (error || !data) return null;
  return data as PluginRow;
}

export async function findPluginById(id: string): Promise<PluginRow | null> {
  const supabase = await getClient();
  const { data, error } = await supabase.from('plugins').select('*').eq('id', id).single();
  if (error || !data) return null;
  return data as PluginRow;
}

export async function getUserInstallations(userId: string): Promise<PluginInstallationRow[]> {
  const supabase = await getClient();
  const { data, error } = await supabase
    .from('plugin_installations')
    .select('*')
    .eq('user_id', userId);
  if (error) throw error;
  return (data ?? []) as PluginInstallationRow[];
}

export async function installPlugin(
  pluginId: string,
  userId: string,
  config?: Record<string, unknown>
): Promise<PluginInstallationRow> {
  const supabase = await getClient();
  const plugin = await findPluginById(pluginId);
  if (!plugin) throw new Error('Plugin not found');

  const { data, error } = await supabase
    .from('plugin_installations')
    .upsert(
      {
        plugin_id: pluginId,
        user_id: userId,
        enabled: true,
        config: config ?? plugin.default_config,
      },
      { onConflict: 'plugin_id,user_id' }
    )
    .select()
    .single();

  if (error) throw error;
  return data as PluginInstallationRow;
}

export async function uninstallPlugin(pluginId: string, userId: string): Promise<void> {
  const supabase = await getClient();
  const { error } = await supabase
    .from('plugin_installations')
    .delete()
    .eq('plugin_id', pluginId)
    .eq('user_id', userId);
  if (error) throw error;
}

export async function updatePluginConfig(
  pluginId: string,
  userId: string,
  config: Record<string, unknown>
): Promise<PluginInstallationRow> {
  const supabase = await getClient();
  const { data, error } = await supabase
    .from('plugin_installations')
    .update({ config, updated_at: new Date().toISOString() })
    .eq('plugin_id', pluginId)
    .eq('user_id', userId)
    .select()
    .single();
  if (error) throw error;
  return data as PluginInstallationRow;
}

export async function getPluginsWithInstallations(
  userId: string,
  params: PluginListParams = {}
): Promise<PaginatedResult<PluginWithInstallation>> {
  const { data: plugins, ...rest } = await listPlugins(params);
  const installations = await getUserInstallations(userId);

  const installMap = new Map(installations.map((i) => [i.plugin_id, i]));

  const enriched = plugins.map((p) => ({
    ...p,
    installation: installMap.get(p.id) ?? null,
  }));

  return { ...rest, data: enriched };
}
