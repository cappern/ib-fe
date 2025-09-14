export interface PluginManifest {
  name: string;
  label: string;
  icon: string;
  version: string;
  routes: Array<{
    path: string;
    entry: string;
    nav?: {
      label: string;
      icon?: string;
      admin?: boolean;
    };
  }>;
}

const manifests = import.meta.glob<PluginManifest>(
  '/src/lib/modules/*/manifest.json',
  { eager: true, import: 'default' }
);

export function getPlugins(): PluginManifest[] {
  return Object.values(manifests);
}
