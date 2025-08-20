import { Platform } from 'react-native';

/**
 * Platform Utilities for React Native - 2025 Best Practices
 * Provides safe alternatives to web-specific APIs
 */

// Platform detection
export const isWeb = Platform.OS === 'web';
export const isIOS = Platform.OS === 'ios';
export const isAndroid = Platform.OS === 'android';
export const isNative = Platform.OS === 'ios' || Platform.OS === 'android';

// Safe performance API access
export const getPerformanceNow = (): number => {
  if (global.performance?.now) {
    return global.performance.now();
  }
  // Fallback to Date.now() if performance.now() is not available
  return Date.now();
};

// Safe memory information access
export const getMemoryInfo = () => {
  const performance = global.performance || {};
  const memory = (performance as any)?.memory;
  
  if (memory) {
    return {
      used: Math.round(memory.usedJSHeapSize / 1024 / 1024),
      total: Math.round(memory.totalJSHeapSize / 1024 / 1024),
      limit: Math.round(memory.jsHeapSizeLimit / 1024 / 1024),
      available: true,
    };
  }
  
  return {
    used: 0,
    total: 0,
    limit: 0,
    available: false,
  };
};

// Safe setTimeout (React Native uses global setTimeout, not window.setTimeout)
export const safeSetTimeout = (callback: () => void, delay: number): NodeJS.Timeout => {
  return setTimeout(callback, delay);
};

// Safe clearTimeout
export const safeClearTimeout = (timeoutId: NodeJS.Timeout) => {
  clearTimeout(timeoutId);
};

// WebP support detection for React Native
export const isWebPSupported = (): boolean => {
  // React Native supports WebP natively on both iOS and Android
  return true;
};

// Bundle analysis for React Native
export const getBundleInfo = () => {
  if (!__DEV__) {
    return { available: false, reason: 'Only available in development' };
  }
  
  const memoryInfo = getMemoryInfo();
  
  return {
    available: true,
    platform: Platform.OS,
    version: Platform.Version,
    memory: memoryInfo,
    timestamp: new Date().toISOString(),
  };
};

// Development-only logging
export const devLog = (message: string, data?: any) => {
  if (__DEV__) {
    if (__DEV__) {

      console.log(`🔧 [${Platform.OS.toUpperCase()}] ${message}`, data || '');

    }
  }
};

export const devWarn = (message: string, data?: any) => {
  if (__DEV__) {
    console.warn(`⚠️ [${Platform.OS.toUpperCase()}] ${message}`, data || '');
  }
};

export const devError = (message: string, error?: any) => {
  if (__DEV__) {
    console.error(`🚨 [${Platform.OS.toUpperCase()}] ${message}`, error || '');
  }
};
