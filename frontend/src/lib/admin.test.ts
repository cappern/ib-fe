import { describe, it, expect } from 'vitest';
import { getAdminPlugins, toAdminPath } from './admin';

describe('admin utilities', () => {
  it('returns only plugins with admin routes', () => {
    const plugins = getAdminPlugins();
    expect(plugins).toHaveLength(1);
    const inventory = plugins[0];
    expect(inventory.name).toBe('inventory');
    expect(inventory.adminRoutes).toHaveLength(1);
    expect(inventory.adminRoutes[0].path).toBe('/admin/settings');
  });

  it('builds admin paths', () => {
    expect(toAdminPath('inventory', '/admin/settings')).toBe(
      '/admin/inventory/settings'
    );
  });
});
