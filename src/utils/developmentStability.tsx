import React, { useEffect, useState, useCallback, ComponentType } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

/**
 * Development Environment Stability Utilities - 2025 Best Practices
 * Handles hot reload issues and development-specific crashes
 */

// Development-only error boundary component
export const DevelopmentFallback: React.FC<{ error?: string }> = ({ error }) => {
  if (!__DEV__) return null;

  return (
    <View className="absolute top-4 left-4 right-4 bg-yellow-50 border border-yellow-300 rounded-lg p-4 z-50">
      <Text className="text-yellow-800 font-semibold text-lg mb-2">
        🔧 Development Mode - Safe Fallback
      </Text>
      <Text className="text-yellow-700 text-sm mb-4">
        {error || 'Component state was corrupted during hot reload. This is normal in development.'}
      </Text>
      <TouchableOpacity
        onPress={() => {
          // In React Native, we can't reload like web, but we can trigger a state reset
          if (__DEV__) {
            console.log('🔄 Development fallback triggered - restart the app');
          }
        }}
        className="bg-yellow-400 px-4 py-2 rounded"
      >
        <Text className="text-yellow-800 font-medium text-center">
          Restart Required
        </Text>
      </TouchableOpacity>
    </View>
  );
};

// Hook for handling hot reload state recovery
export const useHotReloadRecovery = (
  initialState: any,
  stateKey: string = 'defaultState'
) => {
  const [state, setState] = useState(initialState);
  const [recoveryCount, setRecoveryCount] = useState(0);

  useEffect(() => {
    if (__DEV__ && recoveryCount > 0) {
      console.log(`🔄 Hot reload recovery #${recoveryCount} for ${stateKey}`);
    }
  }, [recoveryCount, stateKey]);

  const recoverState = useCallback(() => {
    if (__DEV__) {
      setState(initialState);
      setRecoveryCount(prev => prev + 1);
      console.log(`✅ State recovered for ${stateKey}`);
    }
  }, [initialState, stateKey]);

  return {
    state,
    setState,
    recoverState,
    recoveryCount,
  };
};

// Safe dashboard state management for development
export const useSafeDashboardState = (
  initialDashboards: any[] = [],
  initialActiveDashboardId: string | null = null
) => {
  const [state, setState] = useState({
    dashboards: initialDashboards,
    activeDashboardId: initialActiveDashboardId,
  });

  const safeSetDashboards = useCallback((dashboards: any[]) => {
    if (!Array.isArray(dashboards)) {
      console.warn('⚠️ Invalid dashboards array, ignoring update');
      return;
    }

    setState(prev => ({
      ...prev,
      dashboards,
      // Reset active dashboard if it no longer exists
      activeDashboardId: dashboards.some(d => d.id === prev.activeDashboardId)
        ? prev.activeDashboardId
        : dashboards[0]?.id || null,
    }));
  }, []);

  const safeSetActiveDashboard = useCallback((id: string) => {
    setState(prev => {
      const dashboardExists = prev.dashboards.some(d => d.id === id);
      if (!dashboardExists) {
        console.warn(`⚠️ Dashboard ${id} not found, keeping current active dashboard`);
        return prev;
      }
      return { ...prev, activeDashboardId: id };
    });
  }, []);

  return {
    dashboards: state.dashboards,
    activeDashboardId: state.activeDashboardId,
    safeSetDashboards,
    safeSetActiveDashboard,
  };
};

// Higher-order component for development safety
export const withDevelopmentSafety = <P extends object>(
  Component: ComponentType<P>,
  fallbackProps?: Partial<P>
) => {
  const SafeComponent: React.FC<P> = (props) => {
    if (!__DEV__) {
      return <Component {...props} />;
    }

    try {
      return <Component {...props} />;
    } catch (error) {
      console.error('🚨 Component render error:', error);
      
      if (fallbackProps) {
        try {
          return <Component {...{ ...props, ...fallbackProps }} />;
        } catch (fallbackError) {
          console.error('🚨 Fallback render error:', fallbackError);
        }
      }
      
      return <DevelopmentFallback error={error instanceof Error ? error.message : 'Render error'} />;
    }
  };

  SafeComponent.displayName = `WithDevelopmentSafety(${Component.displayName || Component.name})`;
  return SafeComponent;
};

// Development logging utilities
export const devLog = (message: string, data?: any) => {
  if (__DEV__) {
    console.log(`🔧 [DEV] ${message}`, data || '');
  }
};

export const devWarn = (message: string, data?: any) => {
  if (__DEV__) {
    console.warn(`⚠️ [DEV] ${message}`, data || '');
  }
};

export const devError = (message: string, error?: any) => {
  if (__DEV__) {
    console.error(`🚨 [DEV] ${message}`, error || '');
  }
};

// Development performance monitoring
export const useDevPerformanceMonitor = (componentName: string) => {
  useEffect(() => {
    if (__DEV__) {
      const startTime = performance.now();
      
      return () => {
        const endTime = performance.now();
        const renderTime = endTime - startTime;
        
        if (renderTime > 100) {
          console.warn(`⏱️ Slow render detected in ${componentName}: ${renderTime.toFixed(2)}ms`);
        }
      };
    }
  });
};

// State validation for development
export const validateDashboardState = (state: any): boolean => {
  if (!state || typeof state !== 'object') {
    devWarn('Invalid state object');
    return false;
  }

  if (!Array.isArray(state.dashboards)) {
    devWarn('Dashboards must be an array');
    return false;
  }

  if (state.activeDashboardId && typeof state.activeDashboardId !== 'string') {
    devWarn('Active dashboard ID must be a string or null');
    return false;
  }

  return true;
};

// Export types for better TypeScript support
export interface DevelopmentState {
  dashboards: any[];
  activeDashboardId: string | null;
}

export interface DevelopmentFallbackProps {
  error?: string;
}