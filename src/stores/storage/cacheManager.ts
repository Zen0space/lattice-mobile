import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Intelligent Caching System
 * 
 * Features:
 * - Cache invalidation strategies
 * - Memory usage optimization
 * - Cache performance metrics
 * - Automatic cleanup
 * - TTL (Time To Live) support
 */

export interface CacheEntry<T = any> {
  data: T;
  timestamp: number;
  ttl: number;
  accessCount: number;
  lastAccessed: number;
  size: number;
}

export interface CacheConfig {
  maxMemoryUsage: number; // bytes
  defaultTTL: number; // milliseconds
  cleanupInterval: number; // milliseconds
  maxEntries: number;
}

export interface CacheStats {
  entries: number;
  memoryUsage: number;
  hitRate: number;
  missRate: number;
  totalRequests: number;
  averageAccessTime: number;
}

class CacheManager {
  private static instance: CacheManager;
  private cache = new Map<string, CacheEntry>();
  private config: CacheConfig;
  private stats = {
    hits: 0,
    misses: 0,
    accessTimes: [] as number[],
  };
  private cleanupTimer?: NodeJS.Timeout;

  private constructor(config?: Partial<CacheConfig>) {
    this.config = {
      maxMemoryUsage: 50 * 1024 * 1024, // 50MB
      defaultTTL: 30 * 60 * 1000, // 30 minutes
      cleanupInterval: 5 * 60 * 1000, // 5 minutes
      maxEntries: 1000,
      ...config,
    };

    this.startCleanupTimer();
  }

  static getInstance(config?: Partial<CacheConfig>): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager(config);
    }
    return CacheManager.instance;
  }

  /**
   * Get data from cache
   */
  async get<T>(key: string): Promise<T | null> {
    const startTime = Date.now();
    
    try {
      const entry = this.cache.get(key);
      
      if (!entry) {
        this.recordMiss();
        return null;
      }

      // Check if expired
      if (this.isExpired(entry)) {
        this.cache.delete(key);
        this.recordMiss();
        return null;
      }

      // Update access info
      entry.accessCount++;
      entry.lastAccessed = Date.now();
      
      this.recordHit();
      this.recordAccessTime(Date.now() - startTime);
      
      return entry.data as T;
    } catch (error) {
      this.recordMiss();
      throw new Error(`Cache get failed for key ${key}: ${error}`);
    }
  }

  /**
   * Set data in cache
   */
  async set<T>(key: string, data: T, ttl?: number): Promise<void> {
    try {
      const size = this.calculateSize(data);
      const entry: CacheEntry<T> = {
        data,
        timestamp: Date.now(),
        ttl: ttl || this.config.defaultTTL,
        accessCount: 0,
        lastAccessed: Date.now(),
        size,
      };

      // Check if we need to make space
      await this.ensureSpace(size);
      
      this.cache.set(key, entry);
      
      // Persist to AsyncStorage for important data
      if (this.shouldPersist(key)) {
        await this.persistEntry(key, entry);
      }
    } catch (error) {
      throw new Error(`Cache set failed for key ${key}: ${error}`);
    }
  }

  /**
   * Delete from cache
   */
  async delete(key: string): Promise<boolean> {
    try {
      const deleted = this.cache.delete(key);
      
      if (deleted && this.shouldPersist(key)) {
        await AsyncStorage.removeItem(`cache_${key}`);
      }
      
      return deleted;
    } catch (error) {
      throw new Error(`Cache delete failed for key ${key}: ${error}`);
    }
  }

  /**
   * Clear all cache
   */
  async clear(): Promise<void> {
    try {
      this.cache.clear();
      
      // Clear persisted cache entries
      const allKeys = await AsyncStorage.getAllKeys();
      const cacheKeys = allKeys.filter(key => key.startsWith('cache_'));
      await AsyncStorage.multiRemove(cacheKeys);
      
      this.resetStats();
    } catch (error) {
      throw new Error(`Cache clear failed: ${error}`);
    }
  }

  /**
   * Invalidate cache entries by pattern
   */
  async invalidate(pattern: string | RegExp): Promise<number> {
    try {
      const regex = typeof pattern === 'string' ? new RegExp(pattern) : pattern;
      const keysToDelete: string[] = [];
      
      for (const key of this.cache.keys()) {
        if (regex.test(key)) {
          keysToDelete.push(key);
        }
      }
      
      for (const key of keysToDelete) {
        await this.delete(key);
      }
      
      return keysToDelete.length;
    } catch (error) {
      throw new Error(`Cache invalidation failed: ${error}`);
    }
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    const totalRequests = this.stats.hits + this.stats.misses;
    const memoryUsage = Array.from(this.cache.values())
      .reduce((total, entry) => total + entry.size, 0);
    
    return {
      entries: this.cache.size,
      memoryUsage,
      hitRate: totalRequests > 0 ? this.stats.hits / totalRequests : 0,
      missRate: totalRequests > 0 ? this.stats.misses / totalRequests : 0,
      totalRequests,
      averageAccessTime: this.getAverageAccessTime(),
    };
  }

  /**
   * Optimize cache performance
   */
  async optimize(): Promise<void> {
    try {
      // Remove expired entries
      await this.cleanup();
      
      // Remove least recently used entries if over limit
      await this.evictLRU();
      
      // Defragment if needed
      await this.defragment();
    } catch (error) {
      throw new Error(`Cache optimization failed: ${error}`);
    }
  }

  // Private methods
  private isExpired(entry: CacheEntry): boolean {
    return Date.now() - entry.timestamp > entry.ttl;
  }

  private calculateSize(data: any): number {
    try {
      return new Blob([JSON.stringify(data)]).size;
    } catch {
      return 1024; // Default size estimate
    }
  }

  private shouldPersist(key: string): boolean {
    // Persist dashboard and widget data
    return key.includes('dashboard') || key.includes('widget');
  }

  private async persistEntry(key: string, entry: CacheEntry): Promise<void> {
    try {
      const data = JSON.stringify(entry);
      await AsyncStorage.setItem(`cache_${key}`, data);
    } catch (error) {
      // Persistence failure shouldn't break caching
      if (__DEV__) {
        console.warn(`Failed to persist cache entry ${key}:`, error);
      }
    }
  }

  private async ensureSpace(requiredSize: number): Promise<void> {
    const currentUsage = this.getCurrentMemoryUsage();
    
    if (currentUsage + requiredSize > this.config.maxMemoryUsage) {
      await this.evictLRU(requiredSize);
    }
    
    if (this.cache.size >= this.config.maxEntries) {
      await this.evictLRU();
    }
  }

  private getCurrentMemoryUsage(): number {
    return Array.from(this.cache.values())
      .reduce((total, entry) => total + entry.size, 0);
  }

  private async evictLRU(targetSize?: number): Promise<void> {
    const entries = Array.from(this.cache.entries())
      .sort(([, a], [, b]) => a.lastAccessed - b.lastAccessed);
    
    let freedSize = 0;
    const targetFree = targetSize || this.config.maxMemoryUsage * 0.1; // Free 10% by default
    
    for (const [key, entry] of entries) {
      if (freedSize >= targetFree) break;
      
      await this.delete(key);
      freedSize += entry.size;
    }
  }

  private async cleanup(): Promise<void> {
    const expiredKeys: string[] = [];
    
    for (const [key, entry] of this.cache.entries()) {
      if (this.isExpired(entry)) {
        expiredKeys.push(key);
      }
    }
    
    for (const key of expiredKeys) {
      await this.delete(key);
    }
  }

  private async defragment(): Promise<void> {
    // Recreate cache map to optimize memory layout
    const entries = Array.from(this.cache.entries());
    this.cache.clear();
    
    for (const [key, entry] of entries) {
      this.cache.set(key, entry);
    }
  }

  private startCleanupTimer(): void {
    this.cleanupTimer = setInterval(async () => {
      try {
        await this.cleanup();
      } catch (error) {
        if (__DEV__) {
          console.warn('Cache cleanup failed:', error);
        }
      }
    }, this.config.cleanupInterval);
  }

  private recordHit(): void {
    this.stats.hits++;
  }

  private recordMiss(): void {
    this.stats.misses++;
  }

  private recordAccessTime(time: number): void {
    this.stats.accessTimes.push(time);
    // Keep only last 100 measurements
    if (this.stats.accessTimes.length > 100) {
      this.stats.accessTimes.shift();
    }
  }

  private getAverageAccessTime(): number {
    const times = this.stats.accessTimes;
    return times.length > 0 ? times.reduce((a, b) => a + b, 0) / times.length : 0;
  }

  private resetStats(): void {
    this.stats = {
      hits: 0,
      misses: 0,
      accessTimes: [],
    };
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = undefined;
    }
    this.cache.clear();
    this.resetStats();
  }
}

// Export singleton instance
export const cacheManager = CacheManager.getInstance();

export default CacheManager;
