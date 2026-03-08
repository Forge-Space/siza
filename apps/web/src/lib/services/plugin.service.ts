import {
  findPluginBySlug,
  getPluginsWithInstallations,
  installPlugin as repoInstall,
  uninstallPlugin as repoUninstall,
  updatePluginConfig as repoUpdateConfig,
  type PluginListParams,
  type PluginWithInstallation,
} from '@/lib/repositories/plugin.repo';
import { NotFoundError } from '@/lib/api/errors';
import type { PaginatedResult } from '@/lib/repositories/base.repo';

export async function listPluginsForUser(
  userId: string,
  params: PluginListParams = {}
): Promise<PaginatedResult<PluginWithInstallation>> {
  return getPluginsWithInstallations(userId, params);
}

export async function getPluginDetail(
  slug: string,
  userId: string
): Promise<PluginWithInstallation> {
  const { data } = await getPluginsWithInstallations(userId, {});
  const plugin = data.find((p) => p.slug === slug);
  if (!plugin) throw new NotFoundError(`Plugin "${slug}" not found`);
  return plugin;
}

export async function installPluginForUser(
  slug: string,
  userId: string,
  config?: Record<string, unknown>
): Promise<void> {
  const plugin = await findPluginBySlug(slug);
  if (!plugin) throw new NotFoundError(`Plugin "${slug}" not found`);
  await repoInstall(plugin.id, userId, config);
}

export async function uninstallPluginForUser(slug: string, userId: string): Promise<void> {
  const plugin = await findPluginBySlug(slug);
  if (!plugin) throw new NotFoundError(`Plugin "${slug}" not found`);
  await repoUninstall(plugin.id, userId);
}

export async function updatePluginConfigForUser(
  slug: string,
  userId: string,
  config: Record<string, unknown>
): Promise<void> {
  const plugin = await findPluginBySlug(slug);
  if (!plugin) throw new NotFoundError(`Plugin "${slug}" not found`);
  await repoUpdateConfig(plugin.id, userId, config);
}

export async function getInstalledWidgetsForSlot(
  userId: string,
  slotName: string
): Promise<PluginWithInstallation[]> {
  const { data } = await getPluginsWithInstallations(userId, {});
  return data.filter((p) => p.installation?.enabled && p.widget_slots.includes(slotName));
}
