import { describe, it, expect } from 'vitest';

const { getPlugins } = await import('./pluginRegistry');

describe('plugin registry', () => {
  it('exposes plugin manifests', () => {
    const plugins = getPlugins();
    const inventory = plugins.find((p) => p.name === 'inventory');
    expect(inventory).toBeDefined();
    expect(inventory?.label).toBe('Inventory');
  });
});
