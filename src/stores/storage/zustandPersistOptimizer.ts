import AsyncStorage from '@react-native-async-storage/async-storage';
import { StateStorage } from 'zustand/middleware';
import { cacheManager } from './cacheManager';
import { dashboardStorage } from './dashboardStorage';

/**
 * Optimized Zustand Persist Middleware
 * 
 * Features:
 * - Selective state persistence
 * - Background sync capabilities
 * - Migration strategies
 * - Performance optimizations
 * - Intelligent caching
 */

export interface PersistConfig {
  key: string;
  storage?: StateStorage;
  partialize?: (state: any) => any;
  whitelist?: string[];
  blacklist?: string[];
  migrate?: (persistedState: any, version: number) => any;
  version?: number;
  backgroundSync?: boolean;
  cacheEnabled?: boolean;
}

export interface MigrationStrategy {
  version: number;
  migrate: (state: any) => any;
  description: string;
}

class ZustandPersistOptimizer {
  private static instance: ZustandPersistOptimizer;
  private migrations: Map<string, MigrationStrategy[]> = new Map();
  private backgroundSyncQueue: Array<{ key: string; data: any }> = [];
  private syncInProgress = false;

  private constructor() {}

  static getInstance(): ZustandPersistOptimizer {
    if (!ZustandPersistOptimizer.instance) {
      ZustandPersistOptimizer.instance = new ZustandPersistOptimizer();
    }
    return ZustandPersistOptimizer.instance;
  }

  /**
   * Create optimized storage adapter
   */
  createOptimizedStorage(config: PersistConfig): StateStorage {
    return {
      getItem: async (name: string) => {
        try {
          // Try cache first if enabled
          if (config.cacheEnabled) {
            const cached = await cacheManager.get<string>(name);
            if (cached) {
              return cached;
            }
          }

          // Fallback to AsyncStorage
          const data = await AsyncStorage.getItem(name);
          
          if (data && config.cacheEnabled) {
            // Cache for future use
            await cacheManager.set(name, data, 10 * 60 * 1000); // 10 minutes
          }

          return data;
        } catch (error) {
          console.error(`Failed to get item ${name}:`, error);
          return null;
        }
      },

      setItem: async (name: string, value: string) => {
        try {
          // Background sync if enabled
          if (config.backgroundSync) {
            this.queueBackgroundSync(name, value);
            return;
          }

          // Direct write
          await AsyncStorage.setItem(name, value);
          
          // Update cache if enabled
          if (config.cacheEnabled) {
            await cacheManager.set(name, value, 10 * 60 * 1000);
          }
        } catch (error) {
          console.error(`Failed to set item ${name}:`, error);
          throw error;
        }
      },

      removeItem: async (name: string) => {
        try {
          await AsyncStorage.removeItem(name);
          
          // Clear from cache if enabled
          if (config.cacheEnabled) {
            await cacheManager.delete(name);
          }
        } catch (error) {
          console.error(`Failed to remove item ${name}:`, error);
          throw error;
        }
      },
    };
  }

  /**
   * Create selective persistence config
   */
  createSelectiveConfig<T extends Record<string, any>>(
    key: string,
    whitelist?: (keyof T)[],
    blacklist?: (keyof T)[]
  ): PersistConfig {
    return {
      key,
      partialize: (state: T) => {
        let result = { ...state };

        // Apply whitelist
        if (whitelist && whitelist.length > 0) {
          result = {} as T;
          for (const key of whitelist) {
            if (key in state) {
              (result as any)[key] = state[key];
            }
          }
        }

        // Apply blacklist
        if (blacklist && blacklist.length > 0) {
          for (const key of blacklist) {
            delete (result as any)[key];
          }
        }

        return result;
      },
      backgroundSync: true,
      cacheEnabled: true,
    };
  }

  /**
   * Register migration strategy
   */
  registerMigration(key: string, migration: MigrationStrategy): void {
    const existing = this.migrations.get(key) || [];
    existing.push(migration);
    existing.sort((a, b) => a.version - b.version);
    this.migrations.set(key, existing);
  }

  /**
   * Create migration-enabled config
   */
  createMigratableConfig(key: string, currentVersion: number): PersistConfig {
    return {
      key,
      version: currentVersion,
      migrate: (persistedState: any, version: number) => {
        const migrations = this.migrations.get(key) || [];
        let state = persistedState;

        // Apply migrations in order
        for (const migration of migrations) {
          if (migration.version > version && migration.version <= currentVersion) {
            try {
              state = migration.migrate(state);
              if (__DEV__) {
                if (__DEV__) {

                  console.log(`Applied migration ${migration.version} for ${key}: ${migration.description}`);

                }
              }
            } catch (error) {
              console.error(`Migration ${migration.version} failed for ${key}:`, error);
              // Continue with other migrations
            }
          }
        }

        return state;
      },
      backgroundSync: true,
      cacheEnabled: true,
    };
  }

  /**
   * Create dashboard-specific optimized config
   */
  createDashboardConfig(): PersistConfig {
    return {
      key: 'dashboard-store-optimized',
      partialize: (state: any) => ({
        // Only persist essential dashboard state
        dashboards: state.dashboards,
        activeDashboardId: state.activeDashboardId,
        // Don't persist loading states and errors
      }),
      version: 2,
      migrate: (persistedState: any, version: number) => {
        if (version < 2) {
          // Migration from v1 to v2: ensure all dashboards have required fields
          if (persistedState.dashboards) {
            persistedState.dashboards = persistedState.dashboards.map((dashboard: any) => ({
              ...dashboard,
              createdAt: dashboard.createdAt || new Date().toISOString(),
              lastAccessed: dashboard.lastAccessed || new Date().toISOString(),
              settings: dashboard.settings || {},
              widgets: dashboard.widgets || [],
            }));
          }
        }
        return persistedState;
      },
      backgroundSync: true,
      cacheEnabled: true,
    };
  }

  /**
   * Create widget-specific optimized config
   */
  createWidgetConfig(): PersistConfig {
    return {
      key: 'widget-store-optimized',
      partialize: (state: any) => ({
        widgets: state.widgets,
        // Don't persist loading states and temporary data
      }),
      version: 1,
      backgroundSync: true,
      cacheEnabled: true,
    };
  }

  /**
   * Create UI state config (minimal persistence)
   */
  createUIConfig(): PersistConfig {
    return {
      key: 'ui-store-optimized',
      partialize: (state: any) => ({
        // Only persist theme and important UI preferences
        theme: state.theme,
        preferences: state.preferences,
        // Don't persist modal states, loading states, errors
      }),
      version: 1,
      backgroundSync: false, // UI state should be immediate
      cacheEnabled: true,
    };
  }

  // Private methods
  private queueBackgroundSync(key: string, data: any): void {
    this.backgroundSyncQueue.push({ key, data });
    
    // Start background sync if not already running
    if (!this.syncInProgress) {
      this.processBackgroundSync();
    }
  }

  private async processBackgroundSync(): Promise<void> {
    if (this.syncInProgress || this.backgroundSyncQueue.length === 0) {
      return;
    }

    this.syncInProgress = true;

    try {
      // Process queue in batches
      const batchSize = 5;
      while (this.backgroundSyncQueue.length > 0) {
        const batch = this.backgroundSyncQueue.splice(0, batchSize);
        
        // Process batch in parallel
        await Promise.all(
          batch.map(async ({ key, data }) => {
            try {
              await AsyncStorage.setItem(key, data);
              
              // Update cache
              await cacheManager.set(key, data, 10 * 60 * 1000);
            } catch (error) {
              console.error(`Background sync failed for ${key}:`, error);
              // Re-queue failed items
              this.backgroundSyncQueue.unshift({ key, data });
            }
          })
        );

        // Small delay between batches to avoid blocking
        await new Promise(resolve => setTimeout(resolve, 10));
      }
    } finally {
      this.syncInProgress = false;
    }
  }

  /**
   * Get sync statistics
   */
  getSyncStats(): {
    queueSize: number;
    syncInProgress: boolean;
    registeredMigrations: number;
  } {
    return {
      queueSize: this.backgroundSyncQueue.length,
      syncInProgress: this.syncInProgress,
      registeredMigrations: Array.from(this.migrations.values())
        .reduce((total, migrations) => total + migrations.length, 0),
    };
  }

  /**
   * Force sync all queued items
   */
  async forceSyncAll(): Promise<void> {
    if (this.backgroundSyncQueue.length > 0) {
      await this.processBackgroundSync();
    }
  }

  /**
   * Clear all cached persistence data
   */
  async clearPersistenceCache(): Promise<void> {
    await cacheManager.invalidate(/^dashboard-store|^widget-store|^ui-store/);
  }
}

// Export singleton instance
export const zustandPersistOptimizer = ZustandPersistOptimizer.getInstance();

// Register default migrations
zustandPersistOptimizer.registerMigration('dashboard-store-optimized', {
  version: 2,
  description: 'Add default fields to dashboards',
  migrate: (state: any) => {
    if (state.dashboards) {
      state.dashboards = state.dashboards.map((dashboard: any) => ({
        ...dashboard,
        createdAt: dashboard.createdAt || new Date().toISOString(),
        lastAccessed: dashboard.lastAccessed || new Date().toISOString(),
        settings: dashboard.settings || {},
        widgets: dashboard.widgets || [],
      }));
    }
    return state;
  },
});

export default ZustandPersistOptimizer;
