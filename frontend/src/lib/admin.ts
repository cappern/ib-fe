import { getPlugins } from './pluginRegistry';
import type { PluginManifest } from './pluginRegistry';

export interface AdminPlugin extends PluginManifest {
  adminRoutes: PluginManifest['routes'];
}

export function getAdminPlugins(): AdminPlugin[] {
  return getPlugins()
    .map((plugin) => ({
      ...plugin,
      adminRoutes: plugin.routes.filter((r) => r.nav?.admin),
    }))
    .filter((p) => p.adminRoutes.length > 0);
}

export function toAdminPath(plugin: string, path: string): string {
  return `/admin/${plugin}${path.replace(/^\/admin/, '')}`;
}
