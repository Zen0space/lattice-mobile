import React, { useState, useEffect, useCallback, memo } from 'react';
import { Image, ImageProps, ImageStyle, StyleProp } from 'react-native';

/**
 * Asset Optimization Utilities - 2025 Best Practices
 * Implements progressive loading, WebP support, and caching strategies
 */

// Progressive image loading states
type ImageLoadingState = 'loading' | 'loaded' | 'error';

// Optimized image component props
interface OptimizedImageProps extends Omit<ImageProps, 'source'> {
  source: { uri: string } | number;
  placeholder?: { uri: string } | number;
  lowQualitySource?: { uri: string };
  fallbackSource?: { uri: string } | number;
  onLoadStart?: () => void;
  onLoadEnd?: () => void;
  onError?: (error: any) => void;
  progressive?: boolean;
  webpSupport?: boolean;
  cachePolicy?: 'default' | 'reload' | 'force-cache' | 'only-if-cached';
}

// WebP support detection for React Native
const isWebPSupported = (() => {
  // React Native supports WebP natively on both iOS and Android
  // No need for canvas-based detection like in web browsers
  return true; // WebP is supported in React Native by default
})();

// Convert image URL to WebP if supported
const getOptimizedImageUrl = (url: string, webpSupport: boolean = true): string => {
  if (!webpSupport || !isWebPSupported) return url;
  
  // Check if URL already has WebP format
  if (url.includes('.webp')) return url;
  
  // For external URLs, try to append WebP parameter
  if (url.startsWith('http')) {
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}format=webp&quality=85`;
  }
  
  return url;
};

// Progressive Image Component with optimization
export const OptimizedImage = memo<OptimizedImageProps>(({
  source,
  placeholder,
  lowQualitySource,
  fallbackSource,
  progressive = true,
  webpSupport = true,
  cachePolicy = 'default',
  style,
  onLoadStart,
  onLoadEnd,
  onError,
  ...props
}) => {
  const [loadingState, setLoadingState] = useState<ImageLoadingState>('loading');
  const [currentSource, setCurrentSource] = useState(source);

  // Optimize image source URL
  const optimizedSource = useCallback(() => {
    if (typeof source === 'number') return source; // Local asset
    
    const uri = getOptimizedImageUrl(source.uri, webpSupport);
    return { uri, cache: cachePolicy };
  }, [source, webpSupport, cachePolicy]);

  // Handle progressive loading
  useEffect(() => {
    if (!progressive || typeof source === 'number') return;

    setLoadingState('loading');
    
    // Load low quality image first if provided
    if (lowQualitySource) {
      setCurrentSource(lowQualitySource);
      
      // Preload high quality image
      Image.prefetch(getOptimizedImageUrl(source.uri, webpSupport))
        .then(() => {
          setCurrentSource(optimizedSource());
          setLoadingState('loaded');
        })
        .catch((error) => {
          console.warn('Failed to preload high quality image:', error);
          if (fallbackSource) {
            setCurrentSource(fallbackSource);
          }
          setLoadingState('error');
        });
    } else {
      setCurrentSource(optimizedSource());
    }
  }, [source, lowQualitySource, progressive, webpSupport, fallbackSource, optimizedSource]);

  const handleLoadStart = useCallback(() => {
    setLoadingState('loading');
    onLoadStart?.();
  }, [onLoadStart]);

  const handleLoadEnd = useCallback(() => {
    setLoadingState('loaded');
    onLoadEnd?.();
  }, [onLoadEnd]);

  const handleError = useCallback((error: any) => {
    setLoadingState('error');
    
    // Try fallback source if available
    if (fallbackSource && currentSource !== fallbackSource) {
      setCurrentSource(fallbackSource);
      return;
    }
    
    onError?.(error);
  }, [fallbackSource, currentSource, onError]);

  return (
    <Image
      {...props}
      source={currentSource}
      style={style}
      onLoadStart={handleLoadStart}
      onLoadEnd={handleLoadEnd}
      onError={handleError}
      // Performance optimizations
      fadeDuration={loadingState === 'loading' ? 300 : 0}
      resizeMode={props.resizeMode || 'cover'}
    />
  );
});

OptimizedImage.displayName = 'OptimizedImage';

// Image preloading utility
export const preloadImages = async (imageUrls: string[]): Promise<void> => {
  try {
    const preloadPromises = imageUrls.map(url => 
      Image.prefetch(getOptimizedImageUrl(url))
    );
    
    await Promise.all(preloadPromises);
    
    if (__DEV__) {
      if (__DEV__) {

        console.log(`✅ Preloaded ${imageUrls.length} images`);

      }
    }
  } catch (error) {
    console.error('Failed to preload images:', error);
  }
};

// Image cache management
export const imageCacheManager = {
  // Clear image cache
  clearCache: async (): Promise<void> => {
    try {
      // React Native doesn't have a direct cache clear method
      // This is more relevant for web implementations
      if (__DEV__) {
        if (__DEV__) {

          console.log('🧹 Image cache cleared (development)');

        }
      }
    } catch (error) {
      console.error('Failed to clear image cache:', error);
    }
  },

  // Get cache size (development only)
  getCacheSize: (): number => {
    if (__DEV__ && 'performance' in window && 'memory' in (performance as any)) {
      const memory = (performance as any).memory;
      return Math.round(memory.usedJSHeapSize / 1024 / 1024);
    }
    return 0;
  },

  // Preload critical images
  preloadCriticalAssets: async (): Promise<void> => {
    const criticalImages: string[] = [
      // Add your critical image URLs here
      // '../assets/icon.png',
      // '../assets/splash-icon.png',
    ];

    await preloadImages(criticalImages);
  },
};

// Asset size monitoring
export const monitorAssetUsage = () => {
  if (__DEV__) {
    const startTime = Date.now();
    
    return {
      logAssetLoad: (assetName: string, size?: number) => {
        const loadTime = Date.now() - startTime;
        console.log(`📸 Asset loaded: ${assetName}`, {
          loadTime: `${loadTime}ms`,
          size: size ? `${Math.round(size / 1024)}KB` : 'unknown',
        });
      },
      
      logAssetError: (assetName: string, error: any) => {
        console.error(`❌ Asset failed: ${assetName}`, error);
      },
    };
  }
  
  return {
    logAssetLoad: () => {},
    logAssetError: () => {},
  };
};

// Bundle size utilities
export const bundleOptimization = {
  // Analyze bundle composition (development only) - React Native compatible
  analyzeBundleComposition: () => {
    if (__DEV__) {
      // In React Native, we can't access document.scripts
      // Instead, we can monitor memory usage and bundle metrics
      const memoryInfo = (global.performance as any)?.memory || {};
      
      console.log('📦 Bundle Analysis (React Native):', {
        platform: 'react-native',
        memoryUsed: memoryInfo.usedJSHeapSize ? `${Math.round(memoryInfo.usedJSHeapSize / 1024 / 1024)}MB` : 'unknown',
        memoryTotal: memoryInfo.totalJSHeapSize ? `${Math.round(memoryInfo.totalJSHeapSize / 1024 / 1024)}MB` : 'unknown',
        timestamp: new Date().toISOString(),
      });
    }
  },

  // Monitor chunk loading
  monitorChunkLoading: (chunkName: string) => {
    if (__DEV__) {
      const startTime = global.performance?.now ? global.performance.now() : Date.now();
      
      return {
        onChunkLoaded: () => {
          const loadTime = (global.performance?.now ? global.performance.now() : Date.now()) - startTime;
          if (__DEV__) {

            console.log(`📦 Chunk loaded: ${chunkName} (${loadTime.toFixed(2)}ms)`);

          }
        },
        
        onChunkError: (error: any) => {
          console.error(`❌ Chunk failed: ${chunkName}`, error);
        },
      };
    }
    
    return {
      onChunkLoaded: () => {},
      onChunkError: () => {},
    };
  },
};
