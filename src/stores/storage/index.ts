/**
 * Simplified Storage Architecture
 * 
 * Clean, focused storage layer that works with Zustand stores
 * - Dashboard storage (~150 lines vs 432 lines)
 * - Separate widget storage with clean API
 * - Intelligent caching system
 * - Optimized Zustand persistence
 */

// Core storage classes
export { 
  default as DashboardStorage, 
  dashboardStorage,
} from './dashboardStorage';

export { 
  default as WidgetStorage, 
  widgetStorage,
} from './widgetStorage';

export { 
  default as CacheManager, 
  cacheManager,
} from './cacheManager';

export { 
  default as ZustandPersistOptimizer, 
  zustandPersistOptimizer,
} from './zustandPersistOptimizer';

export { 
  default as ChatStorage,
} from './chatStorage';

// Types
export type { DashboardMetadata, StorageStats } from './dashboardStorage';
export type { WidgetTemplate, WidgetBackup } from './widgetStorage';
export type { CacheEntry, CacheConfig, CacheStats } from './cacheManager';
export type { PersistConfig, MigrationStrategy } from './zustandPersistOptimizer';
export type { ChatMessage, ChatSession } from './chatStorage';

// Utility functions
export const createOptimizedPersistence = () => {
  const { zustandPersistOptimizer: optimizer } = require('./zustandPersistOptimizer');
  
  return {
    dashboard: optimizer.createDashboardConfig(),
    widget: optimizer.createWidgetConfig(),
    ui: optimizer.createUIConfig(),
    createStorage: optimizer.createOptimizedStorage.bind(optimizer),
  };
};

export const getStorageStats = async () => {
  const { dashboardStorage } = await import('./dashboardStorage');
  const { widgetStorage } = await import('./widgetStorage');
  const { cacheManager } = await import('./cacheManager');
  const { zustandPersistOptimizer } = await import('./zustandPersistOptimizer');

  const [dashboardStats, widgetStats, cacheStats] = await Promise.all([
    dashboardStorage.getStats(),
    widgetStorage.getStats(),
    Promise.resolve(cacheManager.getStats()),
  ]);

  return {
    dashboard: dashboardStats,
    widget: widgetStats,
    cache: cacheStats,
    sync: zustandPersistOptimizer.getSyncStats(),
  };
};

export const optimizeStorage = async () => {
  const { cacheManager } = await import('./cacheManager');
  const { zustandPersistOptimizer } = await import('./zustandPersistOptimizer');

  await Promise.all([
    cacheManager.optimize(),
    zustandPersistOptimizer.forceSyncAll(),
  ]);
};

export const clearAllStorage = async () => {
  const { dashboardStorage } = await import('./dashboardStorage');
  const { widgetStorage } = await import('./widgetStorage');
  const { cacheManager } = await import('./cacheManager');
  const { zustandPersistOptimizer } = await import('./zustandPersistOptimizer');

  await Promise.all([
    dashboardStorage.clearAll(),
    widgetStorage.clearAll(),
    cacheManager.clear(),
    zustandPersistOptimizer.clearPersistenceCache(),
  ]);
};
