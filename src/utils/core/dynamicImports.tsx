import React, { lazy, ComponentType, Suspense } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { DashboardConfig } from '../../components/dashboard/types';

/**
 * Dynamic Import Utilities for Bundle Optimization - 2025 Best Practices
 * Implements code splitting and lazy loading for dashboard components
 */

// Dashboard component props interface
interface DashboardProps {
  config: DashboardConfig;
}

// Loading component for lazy-loaded dashboards
const DashboardLoadingFallback: React.FC = () => (
  <View className="flex-1 items-center justify-center bg-gray-50">
    <ActivityIndicator size="large" color="#10a37f" />
    <Text className="text-gray-600 mt-4 text-sm">Loading dashboard...</Text>
  </View>
);

// Error fallback component
const DashboardErrorFallback: React.FC<{ dashboardName: string }> = ({ dashboardName }) => (
  <View className="flex-1 items-center justify-center p-4">
    <Text className="text-red-600 text-center text-lg font-semibold mb-2">
      Failed to load {dashboardName}
    </Text>
    <Text className="text-gray-600 text-center text-sm">
      Please try refreshing the page or contact support if the issue persists.
    </Text>
  </View>
);

// Create lazy component with proper error handling
const createLazyDashboard = (
  importFn: () => Promise<{ default: ComponentType<DashboardProps> }>,
  dashboardName: string
) => {
  return lazy(() =>
    importFn().catch(error => {
      console.error(`Failed to load ${dashboardName}:`, error);
      // Return a proper fallback component
      return {
        default: () => <DashboardErrorFallback dashboardName={dashboardName} />,
      };
    })
  );
};

// Dashboard components with lazy loading
const OverviewDashboard = createLazyDashboard(
  () => import('../../components/dashboard/OverviewDashboard'),
  'Overview Dashboard'
);

const UnifiedDashboard = createLazyDashboard(
  () => import('../../components/dashboard/UnifiedDashboard'),
  'Unified Dashboard'
);

// Dashboard component registry - Overview uses dedicated component, others use UnifiedDashboard
export const LAZY_DASHBOARD_COMPONENTS: Record<string, ComponentType<DashboardProps>> = {
  overview: OverviewDashboard, // ✅ Uses dedicated OverviewDashboard.tsx
  stocks: UnifiedDashboard, // ✅ Uses UnifiedDashboard with stocks theme
  portfolio: UnifiedDashboard, // ✅ Uses UnifiedDashboard with portfolio theme
  watchlist: UnifiedDashboard, // ✅ Uses UnifiedDashboard with watchlist theme
  analytics: UnifiedDashboard, // ✅ Uses UnifiedDashboard with analytics theme
  trading: UnifiedDashboard, // ✅ Uses UnifiedDashboard with trading theme
};

// Higher-order component for lazy loading with suspense
export const withLazyLoading = <P extends object>(
  LazyComponent: ComponentType<P>,
  fallback?: React.ComponentType
): React.FC<P> => {
  const FallbackComponent = fallback || DashboardLoadingFallback;

  const LazyLoadedComponent: React.FC<P> = props => (
    <Suspense fallback={<FallbackComponent />}>
      <LazyComponent {...props} />
    </Suspense>
  );

  LazyLoadedComponent.displayName = `LazyLoaded(${LazyComponent.displayName || LazyComponent.name || 'Component'})`;

  return LazyLoadedComponent;
};

// Dynamic dashboard renderer with code splitting
export const DynamicDashboardRenderer: React.FC<{
  dashboardType: string;
  config: DashboardConfig;
}> = ({ dashboardType, config }) => {
  const LazyComponent = LAZY_DASHBOARD_COMPONENTS[dashboardType];

  if (!LazyComponent) {
    console.warn(`Dashboard type "${dashboardType}" not found, falling back to overview`);
    const FallbackComponent = LAZY_DASHBOARD_COMPONENTS.overview;
    const LazyLoadedComponent = withLazyLoading(FallbackComponent);
    return <LazyLoadedComponent config={config} />;
  }

  const LazyLoadedComponent = withLazyLoading(LazyComponent);
  return <LazyLoadedComponent config={config} />;
};

// Preload dashboard components for better UX - Overview uses dedicated component, others use UnifiedDashboard
export const preloadDashboardComponent = async (dashboardType: string): Promise<void> => {
  try {
    switch (dashboardType) {
      case 'overview':
        await import('../../components/dashboard/OverviewDashboard');
        break;
      case 'stocks':
      case 'portfolio':
      case 'watchlist':
      case 'analytics':
      case 'trading':
        await import('../../components/dashboard/UnifiedDashboard');
        break;
      default:
        console.warn(`Unknown dashboard type for preloading: ${dashboardType}`);
        // Fallback to UnifiedDashboard for unknown types
        await import('../../components/dashboard/UnifiedDashboard');
    }
  } catch (error) {
    console.error(`Failed to preload dashboard component ${dashboardType}:`, error);
  }
};

// Preload critical dashboard components - Overview + UnifiedDashboard
export const preloadCriticalDashboards = async (): Promise<void> => {
  try {
    // Preload both OverviewDashboard (for overview tab) and UnifiedDashboard (for other tabs)
    await Promise.all([
      import('../../components/dashboard/OverviewDashboard'),
      import('../../components/dashboard/UnifiedDashboard'),
    ]);

    if (__DEV__) {
      if (__DEV__) {
        console.log('✅ OverviewDashboard and UnifiedDashboard components preloaded');
      }
    }
  } catch (error) {
    console.error('Failed to preload critical dashboards:', error);
  }
};

// Bundle size monitoring (development only) - React Native compatible
export const monitorBundleSize = (): void => {
  if (__DEV__) {
    // In React Native, we use global.performance instead of window.performance
    const performance = global.performance || {};
    const memory = (performance as any)?.memory;

    if (memory) {
      console.log('📦 Bundle Memory Usage (React Native):', {
        used: Math.round(memory.usedJSHeapSize / 1024 / 1024) + 'MB',
        total: Math.round(memory.totalJSHeapSize / 1024 / 1024) + 'MB',
        limit: Math.round(memory.jsHeapSizeLimit / 1024 / 1024) + 'MB',
        platform: 'react-native',
      });
    } else {
      if (__DEV__) {
        console.log('📦 Bundle monitoring: Memory API not available on this platform');
      }
    }
  }
};

// Chunk loading performance tracker
export const trackChunkLoad = (chunkName: string) => {
  if (__DEV__) {
    const startTime = global.performance?.now ? global.performance.now() : Date.now();

    return {
      onSuccess: () => {
        const loadTime =
          (global.performance?.now ? global.performance.now() : Date.now()) - startTime;
        if (__DEV__) {
          console.log(`✅ Chunk "${chunkName}" loaded in ${loadTime.toFixed(2)}ms`);
        }
      },
      onError: (error: Error) => {
        const loadTime =
          (global.performance?.now ? global.performance.now() : Date.now()) - startTime;
        console.error(`❌ Chunk "${chunkName}" failed after ${loadTime.toFixed(2)}ms:`, error);
      },
    };
  }

  return {
    onSuccess: () => {},
    onError: () => {},
  };
};

// Export types for better TypeScript support
export type { DashboardProps };
export type LazyDashboardComponent = ComponentType<DashboardProps>;
