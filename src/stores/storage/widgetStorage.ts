import AsyncStorage from '@react-native-async-storage/async-storage';
import { Widget } from '../../components/dashboard/types';

/**
 * Separate widget storage with clean API
 *
 * Handles widget-specific persistence operations
 * - Clean API design
 * - Error boundaries
 * - Data validation layer
 * - Backup/restore functionality
 */

const STORAGE_KEYS = {
  WIDGETS: 'lattice_widgets',
  WIDGET_TEMPLATES: 'lattice_widget_templates',
  WIDGET_CACHE: 'lattice_widget_cache',
} as const;

export interface WidgetTemplate {
  id: string;
  name: string;
  type: string;
  defaultConfig: any;
  category: 'chart' | 'data' | 'action' | 'custom';
  description?: string;
}

export interface WidgetBackup {
  dashboardId: string;
  widgets: Widget[];
  timestamp: string;
  version: string;
}

class WidgetStorage {
  private static instance: WidgetStorage;
  private cache = new Map<string, Widget[]>();
  private cacheExpiry = new Map<string, number>();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  private constructor() {}

  static getInstance(): WidgetStorage {
    if (!WidgetStorage.instance) {
      WidgetStorage.instance = new WidgetStorage();
    }
    return WidgetStorage.instance;
  }

  /**
   * Load widgets for a specific dashboard
   */
  async loadWidgets(dashboardId: string): Promise<Widget[]> {
    // Check cache first
    const cached = this.getCachedWidgets(dashboardId);
    if (cached) {
      return cached;
    }

    try {
      const data = await AsyncStorage.getItem(`${STORAGE_KEYS.WIDGETS}_${dashboardId}`);

      if (!data) {
        return [];
      }

      const widgets: Widget[] = JSON.parse(data);

      // Validate and convert dates
      const validatedWidgets = widgets.filter(this.validateWidget).map(widget => ({
        ...widget,
        createdAt: new Date(widget.createdAt),
        updatedAt: new Date(widget.updatedAt),
      }));

      // Cache the result
      this.setCachedWidgets(dashboardId, validatedWidgets);

      return validatedWidgets;
    } catch (error) {
      throw new Error(`Failed to load widgets for dashboard ${dashboardId}: ${error}`);
    }
  }

  /**
   * Save widgets for a specific dashboard
   */
  async saveWidgets(dashboardId: string, widgets: Widget[]): Promise<void> {
    try {
      // Validate widgets before saving
      const validWidgets = widgets.filter(this.validateWidget);

      if (validWidgets.length !== widgets.length) {
        if (__DEV__) {
          console.warn(`Filtered out ${widgets.length - validWidgets.length} invalid widgets`);
        }
      }

      const data = JSON.stringify(validWidgets);
      await AsyncStorage.setItem(`${STORAGE_KEYS.WIDGETS}_${dashboardId}`, data);

      // Update cache
      this.setCachedWidgets(dashboardId, validWidgets);

      // Create backup
      await this.createBackup(dashboardId, validWidgets);
    } catch (error) {
      throw new Error(`Failed to save widgets for dashboard ${dashboardId}: ${error}`);
    }
  }

  /**
   * Delete widgets for a specific dashboard
   */
  async deleteWidgets(dashboardId: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(`${STORAGE_KEYS.WIDGETS}_${dashboardId}`);

      // Clear cache
      this.clearCache(dashboardId);
    } catch (error) {
      throw new Error(`Failed to delete widgets for dashboard ${dashboardId}: ${error}`);
    }
  }

  /**
   * Get widget templates
   */
  async getTemplates(): Promise<WidgetTemplate[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.WIDGET_TEMPLATES);

      if (!data) {
        return this.getDefaultTemplates();
      }

      return JSON.parse(data);
    } catch (error) {
      return this.getDefaultTemplates();
    }
  }

  /**
   * Save widget templates
   */
  async saveTemplates(templates: WidgetTemplate[]): Promise<void> {
    try {
      const data = JSON.stringify(templates);
      await AsyncStorage.setItem(STORAGE_KEYS.WIDGET_TEMPLATES, data);
    } catch (error) {
      throw new Error(`Failed to save widget templates: ${error}`);
    }
  }

  /**
   * Create backup of widgets
   */
  async createBackup(dashboardId: string, widgets: Widget[]): Promise<void> {
    try {
      const backup: WidgetBackup = {
        dashboardId,
        widgets,
        timestamp: new Date().toISOString(),
        version: '1.0.0',
      };

      const backupKey = `${STORAGE_KEYS.WIDGETS}_backup_${dashboardId}`;
      await AsyncStorage.setItem(backupKey, JSON.stringify(backup));
    } catch (error) {
      // Backup failure shouldn't break the main operation
      if (__DEV__) {
        console.warn(`Failed to create widget backup for ${dashboardId}:`, error);
      }
    }
  }

  /**
   * Restore widgets from backup
   */
  async restoreFromBackup(dashboardId: string): Promise<Widget[]> {
    try {
      const backupKey = `${STORAGE_KEYS.WIDGETS}_backup_${dashboardId}`;
      const data = await AsyncStorage.getItem(backupKey);

      if (!data) {
        throw new Error('No backup found');
      }

      const backup: WidgetBackup = JSON.parse(data);

      // Restore widgets
      await this.saveWidgets(dashboardId, backup.widgets);

      return backup.widgets;
    } catch (error) {
      throw new Error(`Failed to restore widgets from backup: ${error}`);
    }
  }

  /**
   * Clear all widget data
   */
  async clearAll(): Promise<void> {
    try {
      // Get all AsyncStorage keys
      const allKeys = await AsyncStorage.getAllKeys();

      // Filter widget-related keys
      const widgetKeys = allKeys.filter(
        key =>
          key.startsWith(STORAGE_KEYS.WIDGETS) ||
          key.startsWith(STORAGE_KEYS.WIDGET_TEMPLATES) ||
          key.startsWith(STORAGE_KEYS.WIDGET_CACHE)
      );

      // Remove all widget keys
      await AsyncStorage.multiRemove(widgetKeys);

      // Clear cache
      this.cache.clear();
      this.cacheExpiry.clear();
    } catch (error) {
      throw new Error(`Failed to clear widget data: ${error}`);
    }
  }

  /**
   * Get widget storage statistics
   */
  async getStats(): Promise<{
    totalWidgets: number;
    dashboardsWithWidgets: number;
    cacheHitRate: number;
    totalStorageSize: number;
  }> {
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const widgetKeys = allKeys.filter(key => key.startsWith(STORAGE_KEYS.WIDGETS));

      let totalWidgets = 0;
      let totalSize = 0;

      for (const key of widgetKeys) {
        const data = await AsyncStorage.getItem(key);
        if (data) {
          const widgets = JSON.parse(data);
          totalWidgets += widgets.length;
          totalSize += new Blob([data]).size;
        }
      }

      return {
        totalWidgets,
        dashboardsWithWidgets: widgetKeys.length,
        cacheHitRate: this.getCacheHitRate(),
        totalStorageSize: totalSize,
      };
    } catch (error) {
      throw new Error(`Failed to get widget storage stats: ${error}`);
    }
  }

  // Private helper methods
  private validateWidget(widget: any): widget is Widget {
    return (
      widget &&
      typeof widget.id === 'string' &&
      typeof widget.type === 'string' &&
      typeof widget.title === 'string' &&
      widget.config &&
      widget.position &&
      typeof widget.position.row === 'number' &&
      typeof widget.position.col === 'number' &&
      widget.size &&
      typeof widget.size.width === 'number' &&
      typeof widget.size.height === 'number'
    );
  }

  private getCachedWidgets(dashboardId: string): Widget[] | null {
    const expiry = this.cacheExpiry.get(dashboardId);
    if (expiry && Date.now() > expiry) {
      this.clearCache(dashboardId);
      return null;
    }

    return this.cache.get(dashboardId) || null;
  }

  private setCachedWidgets(dashboardId: string, widgets: Widget[]): void {
    this.cache.set(dashboardId, widgets);
    this.cacheExpiry.set(dashboardId, Date.now() + this.CACHE_DURATION);
  }

  private clearCache(dashboardId?: string): void {
    if (dashboardId) {
      this.cache.delete(dashboardId);
      this.cacheExpiry.delete(dashboardId);
    } else {
      this.cache.clear();
      this.cacheExpiry.clear();
    }
  }

  private getCacheHitRate(): number {
    // Simple cache hit rate calculation
    const totalRequests = this.cache.size + this.cacheExpiry.size;
    const hits = this.cache.size;
    return totalRequests > 0 ? hits / totalRequests : 0;
  }

  private getDefaultTemplates(): WidgetTemplate[] {
    return [
      {
        id: 'chart-line',
        name: 'Line Chart',
        type: 'chart',
        category: 'chart',
        description: 'Display data as a line chart',
        defaultConfig: {
          chartType: 'line',
          dataSource: 'portfolio',
          timeframe: '1M',
        },
      },
      {
        id: 'chart-bar',
        name: 'Bar Chart',
        type: 'chart',
        category: 'chart',
        description: 'Display data as a bar chart',
        defaultConfig: {
          chartType: 'bar',
          dataSource: 'portfolio',
          timeframe: '1M',
        },
      },
      {
        id: 'crypto-price',
        name: 'Crypto Price',
        type: 'crypto-price',
        category: 'data',
        description: 'Display cryptocurrency prices',
        defaultConfig: {
          symbols: ['BTC', 'ETH'],
          currency: 'USD',
        },
      },
    ];
  }
}

// Export singleton instance
export const widgetStorage = WidgetStorage.getInstance();

export default WidgetStorage;
