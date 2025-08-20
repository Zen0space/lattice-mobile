import { startTransition, useMemo, useCallback, memo } from 'react';

/**
 * React 19 Performance Optimization Utilities
 * Leverages new React 19 features for better performance
 */

// Utility for heavy operations with startTransition
export const performHeavyOperation = (operation: () => void) => {
  startTransition(() => {
    operation();
  });
};

// Dashboard switching with startTransition for smooth UX
export const switchDashboardWithTransition = (
  dashboardId: string,
  setActiveDashboard: (id: string) => void
) => {
  startTransition(() => {
    setActiveDashboard(dashboardId);
  });
};

// Optimized dashboard data processing
export const useDashboardDataMemo = (
  dashboards: any[],
  activeDashboardId: string
) => {
  return useMemo(() => {
    if (!dashboards.length || !activeDashboardId) {
      return null;
    }

    const activeDashboard = dashboards.find(d => d.id === activeDashboardId);
    
    if (!activeDashboard) {
      console.warn(`⚠️ Active dashboard not found: ${activeDashboardId}`);
      return dashboards.find(d => d.type === 'overview') || dashboards[0] || null;
    }

    return activeDashboard;
  }, [dashboards, activeDashboardId]);
};

// Optimized dashboard actions with useCallback
export const useDashboardActions = (
  onUpdate: (id: string, data: any) => void,
  onDelete: (id: string) => void
) => {
  const handleUpdate = useCallback((id: string, data: any) => {
    performHeavyOperation(() => {
      onUpdate(id, data);
    });
  }, [onUpdate]);

  const handleDelete = useCallback((id: string) => {
    performHeavyOperation(() => {
      onDelete(id);
    });
  }, [onDelete]);

  return { handleUpdate, handleDelete };
};

// HOC for React.memo with custom comparison
export const withDashboardMemo = <T extends object>(
  Component: React.ComponentType<T>
) => {
  return memo(Component, (prevProps, nextProps) => {
    // Custom comparison for dashboard props
    if ('dashboard' in prevProps && 'dashboard' in nextProps) {
      const prevDashboard = prevProps.dashboard as any;
      const nextDashboard = nextProps.dashboard as any;
      
      return (
        prevDashboard?.id === nextDashboard?.id &&
        prevDashboard?.lastAccessed === nextDashboard?.lastAccessed &&
        JSON.stringify(prevDashboard?.widgets) === JSON.stringify(nextDashboard?.widgets)
      );
    }
    
    // Default shallow comparison
    return JSON.stringify(prevProps) === JSON.stringify(nextProps);
  });
};

// Development mode performance monitoring
export const usePerformanceMonitor = (componentName: string) => {
  if (__DEV__) {
    const startTime = performance.now();
    
    return useCallback(() => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      if (renderTime > 16) { // More than one frame (16ms)
        console.warn(`⚠️ Slow render detected in ${componentName}: ${renderTime.toFixed(2)}ms`);
      }
    }, [componentName, startTime]);
  }
  
  return () => {}; // No-op in production
};

// Batch state updates for better performance
export const batchStateUpdates = (updates: Array<() => void>) => {
  startTransition(() => {
    updates.forEach(update => update());
  });
};

// Development-specific utilities
export const developmentUtils = {
  // Safe state update with validation
  safeStateUpdate: (updateFn: () => void, validationFn?: () => boolean) => {
    if (__DEV__ && validationFn && !validationFn()) {
      console.warn('⚠️ State update validation failed, skipping update');
      return;
    }
    
    performHeavyOperation(updateFn);
  },

  // Performance boundary for development
  withPerformanceBoundary: <T extends any[]>(
    fn: (...args: T) => void,
    threshold: number = 100
  ) => {
    return (...args: T) => {
      if (!__DEV__) {
        fn(...args);
        return;
      }

      const start = performance.now();
      fn(...args);
      const end = performance.now();
      
      if (end - start > threshold) {
        console.warn(`⚠️ Performance threshold exceeded: ${(end - start).toFixed(2)}ms`);
      }
    };
  },
};
