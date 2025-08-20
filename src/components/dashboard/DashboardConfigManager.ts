import AsyncStorage from '@react-native-async-storage/async-storage';
import { DashboardConfig, DashboardTemplate, DashboardType, DashboardSettings } from './types';
import { DASHBOARD_TEMPLATES } from './DashboardTemplates';
import { pluginRegistry } from './plugins/DashboardPluginRegistry';
import { themeManager } from './themes/DashboardThemeManager';

/**
 * Dashboard Configuration Manager
 * 
 * Centralized management system for dashboard configurations including:
 * - Dashboard creation from templates
 * - Configuration persistence and loading
 * - Plugin and theme integration
 * - Layout management and customization
 * - Import/export functionality
 */

export interface DashboardLayoutConfig {
  id: string;
  name: string;
  description?: string;
  template: DashboardType;
  theme: string;
  plugins: string[]; // Plugin IDs
  components: string[]; // Component IDs from template
  customComponents?: {
    id: string;
    type: string;
    position: number;
    settings?: Record<string, any>;
  }[];
  settings: DashboardSettings;
  layout?: {
    columns: number;
    spacing: number;
    responsive: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
  version: string;
}

export interface DashboardPreset {
  id: string;
  name: string;
  description: string;
  category: 'beginner' | 'advanced' | 'professional' | 'custom';
  layout: DashboardLayoutConfig;
  preview?: string; // Base64 encoded image or URL
}

export class DashboardConfigManager {
  private static instance: DashboardConfigManager;
  private configurations: Map<string, DashboardLayoutConfig> = new Map();
  private presets: Map<string, DashboardPreset> = new Map();
  private storageKey = 'dashboard_configurations';
  private presetsKey = 'dashboard_presets';

  private constructor() {
    this.initializeDefaultPresets();
  }

  static getInstance(): DashboardConfigManager {
    if (!DashboardConfigManager.instance) {
      DashboardConfigManager.instance = new DashboardConfigManager();
    }
    return DashboardConfigManager.instance;
  }

  /**
   * Initialize default dashboard presets
   */
  private initializeDefaultPresets(): void {
    const defaultPresets: DashboardPreset[] = [
      {
        id: 'beginner-overview',
        name: 'Beginner Overview',
        description: 'Simple portfolio overview perfect for newcomers',
        category: 'beginner',
        layout: {
          id: 'beginner-overview',
          name: 'Beginner Overview',
          description: 'Simple and clean portfolio overview',
          template: 'overview',
          theme: 'light',
          plugins: ['market-overview', 'quick-actions'],
          components: ['totalValue', 'topAssets', 'recentActivity'],
          settings: {
            theme: 'light',
            autoRefresh: true,
            refreshInterval: 60000,
            defaultTimeframe: '1D',
            showPriceAlerts: false,
            compactMode: false,
          },
          layout: {
            columns: 1,
            spacing: 16,
            responsive: true,
          },
          createdAt: new Date(),
          updatedAt: new Date(),
          version: '1.0.0',
        },
      },
      {
        id: 'professional-trader',
        name: 'Professional Trader',
        description: 'Advanced trading dashboard with comprehensive tools',
        category: 'professional',
        layout: {
          id: 'professional-trader',
          name: 'Professional Trader',
          description: 'Comprehensive trading dashboard',
          template: 'trading',
          theme: 'dark',
          plugins: ['market-overview', 'news-feed', 'watchlist', 'performance-summary'],
          components: ['orderBook', 'tradingCharts', 'positions', 'pnl'],
          settings: {
            theme: 'dark',
            autoRefresh: true,
            refreshInterval: 5000,
            defaultTimeframe: '1D',
            showPriceAlerts: true,
            compactMode: true,
          },
          layout: {
            columns: 2,
            spacing: 12,
            responsive: true,
          },
          createdAt: new Date(),
          updatedAt: new Date(),
          version: '1.0.0',
        },
      },
      {
        id: 'portfolio-manager',
        name: 'Portfolio Manager',
        description: 'Comprehensive portfolio management and analytics',
        category: 'advanced',
        layout: {
          id: 'portfolio-manager',
          name: 'Portfolio Manager',
          description: 'Advanced portfolio management dashboard',
          template: 'portfolio',
          theme: 'ocean',
          plugins: ['performance-summary', 'news-feed', 'watchlist'],
          components: ['allocation', 'performance', 'riskMetrics', 'rebalancing'],
          settings: {
            theme: 'light',
            autoRefresh: true,
            refreshInterval: 30000,
            defaultTimeframe: '1M',
            showPriceAlerts: true,
            compactMode: false,
          },
          layout: {
            columns: 2,
            spacing: 16,
            responsive: true,
          },
          createdAt: new Date(),
          updatedAt: new Date(),
          version: '1.0.0',
        },
      },
    ];

    defaultPresets.forEach(preset => {
      this.presets.set(preset.id, preset);
    });
  }

  /**
   * Load configurations from storage
   */
  async loadConfigurations(): Promise<void> {
    try {
      // Load custom configurations
      const storedConfigs = await AsyncStorage.getItem(this.storageKey);
      if (storedConfigs) {
        const configs: DashboardLayoutConfig[] = JSON.parse(storedConfigs);
        configs.forEach(config => {
          // Convert date strings back to Date objects
          config.createdAt = new Date(config.createdAt);
          config.updatedAt = new Date(config.updatedAt);
          this.configurations.set(config.id, config);
        });
      }

      // Load custom presets
      const storedPresets = await AsyncStorage.getItem(this.presetsKey);
      if (storedPresets) {
        const presets: DashboardPreset[] = JSON.parse(storedPresets);
        presets.forEach(preset => {
          preset.layout.createdAt = new Date(preset.layout.createdAt);
          preset.layout.updatedAt = new Date(preset.layout.updatedAt);
          this.presets.set(preset.id, preset);
        });
      }

      if (__DEV__) {


        console.log(`✅ Loaded ${this.configurations.size} dashboard configurations and ${this.presets.size} presets`);


      }
    } catch (error) {
      console.error('Failed to load dashboard configurations:', error);
    }
  }

  /**
   * Save configurations to storage
   */
  async saveConfigurations(): Promise<void> {
    try {
      const configs = Array.from(this.configurations.values());
      await AsyncStorage.setItem(this.storageKey, JSON.stringify(configs));

      // Save custom presets only
      const customPresets = Array.from(this.presets.values())
        .filter(preset => preset.category === 'custom');
      await AsyncStorage.setItem(this.presetsKey, JSON.stringify(customPresets));
    } catch (error) {
      console.error('Failed to save dashboard configurations:', error);
    }
  }

  /**
   * Create dashboard configuration from template
   */
  async createFromTemplate(
    name: string,
    templateType: DashboardType,
    customSettings?: Partial<DashboardSettings>
  ): Promise<DashboardLayoutConfig> {
    const template = DASHBOARD_TEMPLATES[templateType];
    if (!template) {
      throw new Error(`Template ${templateType} not found`);
    }

    const config: DashboardLayoutConfig = {
      id: `dashboard_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      description: `Dashboard based on ${template.name} template`,
      template: templateType,
      theme: template.defaultSettings.theme || 'light',
      plugins: [], // Start with no plugins, user can add them
      components: [...template.components],
      settings: {
        ...template.defaultSettings,
        ...customSettings,
      },
      layout: {
        columns: 1,
        spacing: 16,
        responsive: true,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      version: '1.0.0',
    };

    this.configurations.set(config.id, config);
    await this.saveConfigurations();

    if (__DEV__) {


      console.log(`✨ Created dashboard configuration: ${name} (${config.id})`);


    }
    return config;
  }

  /**
   * Create dashboard from preset
   */
  async createFromPreset(presetId: string, customName?: string): Promise<DashboardLayoutConfig> {
    const preset = this.presets.get(presetId);
    if (!preset) {
      throw new Error(`Preset ${presetId} not found`);
    }

    const config: DashboardLayoutConfig = {
      ...preset.layout,
      id: `dashboard_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: customName || `${preset.name} Copy`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.configurations.set(config.id, config);
    await this.saveConfigurations();

    if (__DEV__) {


      console.log(`📋 Created dashboard from preset: ${preset.name} → ${config.name}`);


    }
    return config;
  }

  /**
   * Update dashboard configuration
   */
  async updateConfiguration(
    configId: string,
    updates: Partial<DashboardLayoutConfig>
  ): Promise<boolean> {
    const config = this.configurations.get(configId);
    if (!config) {
      console.warn(`Configuration ${configId} not found`);
      return false;
    }

    const updatedConfig: DashboardLayoutConfig = {
      ...config,
      ...updates,
      id: configId, // Ensure ID doesn't change
      updatedAt: new Date(),
    };

    this.configurations.set(configId, updatedConfig);
    await this.saveConfigurations();

    if (__DEV__) {


      console.log(`🔄 Updated dashboard configuration: ${configId}`);


    }
    return true;
  }

  /**
   * Delete dashboard configuration
   */
  async deleteConfiguration(configId: string): Promise<boolean> {
    if (!this.configurations.has(configId)) {
      console.warn(`Configuration ${configId} not found`);
      return false;
    }

    this.configurations.delete(configId);
    await this.saveConfigurations();

    if (__DEV__) {


      console.log(`🗑️ Deleted dashboard configuration: ${configId}`);


    }
    return true;
  }

  /**
   * Get all configurations
   */
  getAllConfigurations(): DashboardLayoutConfig[] {
    return Array.from(this.configurations.values())
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  }

  /**
   * Get configuration by ID
   */
  getConfiguration(configId: string): DashboardLayoutConfig | undefined {
    return this.configurations.get(configId);
  }

  /**
   * Get all presets
   */
  getAllPresets(): DashboardPreset[] {
    return Array.from(this.presets.values());
  }

  /**
   * Get presets by category
   */
  getPresetsByCategory(category: 'beginner' | 'advanced' | 'professional' | 'custom'): DashboardPreset[] {
    return Array.from(this.presets.values())
      .filter(preset => preset.category === category);
  }

  /**
   * Create custom preset from configuration
   */
  async createPreset(
    config: DashboardLayoutConfig,
    presetName: string,
    description: string,
    category: 'custom' = 'custom'
  ): Promise<DashboardPreset> {
    const preset: DashboardPreset = {
      id: `preset_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: presetName,
      description,
      category,
      layout: { ...config },
    };

    this.presets.set(preset.id, preset);
    await this.saveConfigurations();

    if (__DEV__) {


      console.log(`✨ Created custom preset: ${presetName} (${preset.id})`);


    }
    return preset;
  }

  /**
   * Validate configuration
   */
  validateConfiguration(config: DashboardLayoutConfig): {
    valid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check required fields
    if (!config.id) errors.push('Configuration ID is required');
    if (!config.name) errors.push('Configuration name is required');
    if (!config.template) errors.push('Template is required');

    // Check template exists
    if (config.template && !DASHBOARD_TEMPLATES[config.template]) {
      errors.push(`Template ${config.template} does not exist`);
    }

    // Check theme exists
    if (config.theme && !themeManager.getTheme(config.theme)) {
      warnings.push(`Theme ${config.theme} does not exist, will use default`);
    }

    // Check plugins exist
    config.plugins.forEach(pluginId => {
      if (!pluginRegistry.getPlugin(pluginId)) {
        warnings.push(`Plugin ${pluginId} is not registered`);
      }
    });

    // Check components exist in template
    if (config.template && DASHBOARD_TEMPLATES[config.template]) {
      const templateComponents = DASHBOARD_TEMPLATES[config.template].components;
      config.components.forEach(component => {
        if (!templateComponents.includes(component)) {
          warnings.push(`Component ${component} is not part of ${config.template} template`);
        }
      });
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Export configuration
   */
  exportConfiguration(configId: string): string | null {
    const config = this.configurations.get(configId);
    if (!config) {
      return null;
    }

    return JSON.stringify({
      version: '1.0.0',
      type: 'dashboard-configuration',
      data: config,
      exportedAt: new Date().toISOString(),
    }, null, 2);
  }

  /**
   * Import configuration
   */
  async importConfiguration(configData: string): Promise<DashboardLayoutConfig | null> {
    try {
      const importData = JSON.parse(configData);
      
      if (importData.type !== 'dashboard-configuration') {
        console.error('Invalid import data type');
        return null;
      }

      const config: DashboardLayoutConfig = {
        ...importData.data,
        id: `imported_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Validate imported configuration
      const validation = this.validateConfiguration(config);
      if (!validation.valid) {
        console.error('Invalid configuration:', validation.errors);
        return null;
      }

      this.configurations.set(config.id, config);
      await this.saveConfigurations();

      if (__DEV__) {


        console.log(`📥 Imported dashboard configuration: ${config.name}`);


      }
      return config;
    } catch (error) {
      console.error('Failed to import configuration:', error);
      return null;
    }
  }

  /**
   * Get configuration statistics
   */
  getStats() {
    const configs = Array.from(this.configurations.values());
    const presets = Array.from(this.presets.values());

    return {
      configurations: {
        total: configs.length,
        byTemplate: configs.reduce((acc, config) => {
          acc[config.template] = (acc[config.template] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        byTheme: configs.reduce((acc, config) => {
          acc[config.theme] = (acc[config.theme] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
      },
      presets: {
        total: presets.length,
        byCategory: presets.reduce((acc, preset) => {
          acc[preset.category] = (acc[preset.category] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
      },
    };
  }

  /**
   * Reset to defaults
   */
  async resetToDefaults(): Promise<void> {
    this.configurations.clear();
    this.presets.clear();
    this.initializeDefaultPresets();

    await AsyncStorage.removeItem(this.storageKey);
    await AsyncStorage.removeItem(this.presetsKey);

    if (__DEV__) {


      console.log('🔄 Reset dashboard configurations to defaults');


    }
  }
}

// Export singleton instance
export const dashboardConfigManager = DashboardConfigManager.getInstance();

export default DashboardConfigManager;
