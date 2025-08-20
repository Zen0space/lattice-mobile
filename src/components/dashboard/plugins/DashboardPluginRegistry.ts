import { DashboardPlugin, DashboardPluginProps } from '../DashboardRenderer';

/**
 * Dashboard Plugin Registry System
 *
 * Manages registration, discovery, and lifecycle of dashboard plugins
 * Supports hot-reloading, version management, and dependency resolution
 */
export class DashboardPluginRegistry {
  private static instance: DashboardPluginRegistry;
  private plugins: Map<string, DashboardPlugin> = new Map();
  private pluginCategories: Map<string, string[]> = new Map();
  private pluginDependencies: Map<string, string[]> = new Map();

  private constructor() {}

  static getInstance(): DashboardPluginRegistry {
    if (!DashboardPluginRegistry.instance) {
      DashboardPluginRegistry.instance = new DashboardPluginRegistry();
    }
    return DashboardPluginRegistry.instance;
  }

  /**
   * Register a plugin with the registry
   */
  register(plugin: DashboardPlugin, category?: string): void {
    if (this.plugins.has(plugin.id)) {
      console.warn(`Plugin ${plugin.id} is already registered. Overriding...`);
    }

    // Validate plugin
    if (!this.validatePlugin(plugin)) {
      throw new Error(`Invalid plugin: ${plugin.id}`);
    }

    this.plugins.set(plugin.id, plugin);

    // Add to category
    if (category) {
      const categoryPlugins = this.pluginCategories.get(category) || [];
      if (!categoryPlugins.includes(plugin.id)) {
        categoryPlugins.push(plugin.id);
        this.pluginCategories.set(category, categoryPlugins);
      }
    }

    if (__DEV__) {
      console.log(`✅ Registered plugin: ${plugin.name} (${plugin.id}) v${plugin.version}`);
    }
  }

  /**
   * Unregister a plugin
   */
  unregister(pluginId: string): boolean {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) {
      return false;
    }

    // Remove from categories
    for (const [category, pluginIds] of this.pluginCategories.entries()) {
      const index = pluginIds.indexOf(pluginId);
      if (index > -1) {
        pluginIds.splice(index, 1);
        if (pluginIds.length === 0) {
          this.pluginCategories.delete(category);
        } else {
          this.pluginCategories.set(category, pluginIds);
        }
      }
    }

    this.plugins.delete(pluginId);
    this.pluginDependencies.delete(pluginId);

    if (__DEV__) {
      console.log(`🗑️ Unregistered plugin: ${plugin.name} (${pluginId})`);
    }
    return true;
  }

  /**
   * Get a plugin by ID
   */
  getPlugin(pluginId: string): DashboardPlugin | undefined {
    return this.plugins.get(pluginId);
  }

  /**
   * Get all registered plugins
   */
  getAllPlugins(): DashboardPlugin[] {
    return Array.from(this.plugins.values());
  }

  /**
   * Get plugins by category
   */
  getPluginsByCategory(category: string): DashboardPlugin[] {
    const pluginIds = this.pluginCategories.get(category) || [];
    return pluginIds
      .map(id => this.plugins.get(id))
      .filter((plugin): plugin is DashboardPlugin => plugin !== undefined);
  }

  /**
   * Get plugins compatible with a specific theme
   */
  getPluginsByTheme(theme: 'light' | 'dark'): DashboardPlugin[] {
    return Array.from(this.plugins.values()).filter(
      plugin => !plugin.supportedThemes || plugin.supportedThemes.includes(theme)
    );
  }

  /**
   * Search plugins by name or description
   */
  searchPlugins(query: string): DashboardPlugin[] {
    const searchTerm = query.toLowerCase();
    return Array.from(this.plugins.values()).filter(
      plugin =>
        plugin.name.toLowerCase().includes(searchTerm) ||
        (plugin as any).description?.toLowerCase().includes(searchTerm)
    );
  }

  /**
   * Get plugin categories
   */
  getCategories(): string[] {
    return Array.from(this.pluginCategories.keys());
  }

  /**
   * Validate plugin structure
   */
  private validatePlugin(plugin: DashboardPlugin): boolean {
    if (!plugin.id || !plugin.name || !plugin.version || !plugin.component) {
      return false;
    }

    // Validate version format (semver)
    const versionRegex = /^\d+\.\d+\.\d+$/;
    if (!versionRegex.test(plugin.version)) {
      console.warn(`Plugin ${plugin.id} has invalid version format: ${plugin.version}`);
      return false;
    }

    return true;
  }

  /**
   * Check if plugin has required data dependencies
   */
  hasRequiredData(plugin: DashboardPlugin, availableData: string[]): boolean {
    if (!plugin.requiredData) return true;

    return plugin.requiredData.every(dataType => availableData.includes(dataType));
  }

  /**
   * Get plugin statistics
   */
  getStats() {
    return {
      totalPlugins: this.plugins.size,
      categories: this.pluginCategories.size,
      pluginsByCategory: Object.fromEntries(
        Array.from(this.pluginCategories.entries()).map(([category, plugins]) => [
          category,
          plugins.length,
        ])
      ),
    };
  }

  /**
   * Export plugin configuration
   */
  exportConfig(): any {
    return {
      plugins: Array.from(this.plugins.values()).map(plugin => ({
        id: plugin.id,
        name: plugin.name,
        version: plugin.version,
        settings: plugin.settings,
      })),
      categories: Object.fromEntries(this.pluginCategories),
    };
  }

  /**
   * Clear all plugins (useful for testing)
   */
  clear(): void {
    this.plugins.clear();
    this.pluginCategories.clear();
    this.pluginDependencies.clear();
  }
}

// Plugin utility functions
export const pluginRegistry = DashboardPluginRegistry.getInstance();

/**
 * Decorator for registering plugins
 */
export function RegisterPlugin(category?: string) {
  return function (plugin: DashboardPlugin) {
    pluginRegistry.register(plugin, category);
    return plugin;
  };
}

/**
 * Hook for using plugins in components
 */
export function usePlugins(category?: string, theme?: 'light' | 'dark') {
  if (category && theme) {
    return pluginRegistry
      .getPluginsByCategory(category)
      .filter(plugin => !plugin.supportedThemes || plugin.supportedThemes.includes(theme));
  } else if (category) {
    return pluginRegistry.getPluginsByCategory(category);
  } else if (theme) {
    return pluginRegistry.getPluginsByTheme(theme);
  }

  return pluginRegistry.getAllPlugins();
}

export default DashboardPluginRegistry;
