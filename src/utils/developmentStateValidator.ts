import React, { useEffect, useRef, useState, useCallback } from 'react';
import { DashboardConfig } from '../components/dashboard/types';

/**
 * Development State Validation Utilities - 2025 Best Practices
 * Prevents crashes and improves hot reload stability
 */

// State validation schemas
interface StateValidationSchema {
  [key: string]: {
    type: 'string' | 'number' | 'boolean' | 'object' | 'array';
    required?: boolean;
    validator?: (value: any) => boolean;
    fallback?: any;
  };
}

// Dashboard state schema
const dashboardStateSchema: StateValidationSchema = {
  dashboards: {
    type: 'array',
    required: true,
    validator: (value) => Array.isArray(value) && value.length >= 0,
    fallback: [],
  },
  activeDashboardId: {
    type: 'string',
    required: false,
    validator: (value) => typeof value === 'string' || value === null,
    fallback: null,
  },
  isLoading: {
    type: 'boolean',
    required: true,
    fallback: false,
  },
  error: {
    type: 'string',
    required: false,
    validator: (value) => typeof value === 'string' || value === null,
    fallback: null,
  },
};

// Development state validator hook
export const useStateValidator = <T extends Record<string, any>>(
  state: T,
  schema: StateValidationSchema,
  componentName: string
): T => {
  const [validatedState, setValidatedState] = useState<T>(state);
  const previousStateRef = useRef<T>(state);
  const validationErrorsRef = useRef<string[]>([]);

  const validateState = useCallback((stateToValidate: T): T => {
    if (!__DEV__) return stateToValidate;

    const errors: string[] = [];
    const correctedState = { ...stateToValidate };

          Object.entries(schema).forEach(([key, schemaItem]) => {
      const value = (stateToValidate as any)[key];
      
      // Check if required field is missing
      if (schemaItem.required && (value === undefined || value === null)) {
        errors.push(`${componentName}: Required field '${key}' is missing`);
        if (schemaItem.fallback !== undefined) {
          (correctedState as any)[key] = schemaItem.fallback;
        }
        return;
      }

      // Skip validation if value is null/undefined and not required
      if (value === null || value === undefined) return;

      // Type validation
      const expectedType = schemaItem.type;
      const actualType = Array.isArray(value) ? 'array' : typeof value;
      
      if (actualType !== expectedType) {
        errors.push(`${componentName}: Field '${key}' expected ${expectedType} but got ${actualType}`);
        if (schemaItem.fallback !== undefined) {
          (correctedState as any)[key] = schemaItem.fallback;
        }
      }

      // Custom validator
      if (schemaItem.validator && !schemaItem.validator(value)) {
        errors.push(`${componentName}: Field '${key}' failed custom validation`);
        if (schemaItem.fallback !== undefined) {
          (correctedState as any)[key] = schemaItem.fallback;
        }
      }
    });

    // Log validation errors in development
    if (errors.length > 0) {
      console.group(`⚠️ State Validation Errors - ${componentName}`);
      errors.forEach(error => console.warn(error));
      console.log('Original state:', stateToValidate);
      console.log('Corrected state:', correctedState);
      console.groupEnd();
      
      validationErrorsRef.current = errors;
    } else if (validationErrorsRef.current.length > 0) {
      console.log(`✅ State validation recovered for ${componentName}`);
      validationErrorsRef.current = [];
    }

    return correctedState;
  }, [schema, componentName]);

  useEffect(() => {
    if (__DEV__) {
      const validated = validateState(state);
      
      // Check if state changed significantly (hot reload detection)
      const hasSignificantChange = JSON.stringify(previousStateRef.current) !== JSON.stringify(state);
      
      if (hasSignificantChange) {
        console.log(`🔄 State change detected in ${componentName}:`, {
          previous: previousStateRef.current,
          current: state,
          validated,
        });
        
        setValidatedState(validated);
        previousStateRef.current = state;
      }
    } else {
      setValidatedState(state);
    }
  }, [state, validateState, componentName]);

  return validatedState;
};

// Dashboard-specific state validator
export const useDashboardStateValidator = (
  dashboards: DashboardConfig[],
  activeDashboardId: string | null,
  isLoading: boolean,
  error: string | null,
  componentName: string = 'DashboardComponent'
) => {
  const state = {
    dashboards,
    activeDashboardId,
    isLoading,
    error,
  };

  return useStateValidator(state, dashboardStateSchema, componentName);
};

// Hot reload recovery hook
export const useHotReloadRecovery = (componentName: string) => {
  const mountTimeRef = useRef<number>(Date.now());
  const hotReloadCountRef = useRef<number>(0);

  useEffect(() => {
    if (__DEV__) {
      const currentTime = Date.now();
      const timeSinceMount = currentTime - mountTimeRef.current;

      // If component mounts very quickly after previous mount, it's likely a hot reload
      if (timeSinceMount < 100) {
        hotReloadCountRef.current++;
        console.log(`🔥 Hot reload detected for ${componentName} (count: ${hotReloadCountRef.current})`);
        
        // If too many hot reloads, suggest full refresh
        if (hotReloadCountRef.current > 5) {
          console.warn(`⚠️ Multiple hot reloads detected for ${componentName}. Consider full refresh if experiencing issues.`);
        }
      } else {
        hotReloadCountRef.current = 0;
      }

      mountTimeRef.current = currentTime;
    }
  }, [componentName]);

  return {
    hotReloadCount: hotReloadCountRef.current,
    isLikelyHotReload: hotReloadCountRef.current > 0,
  };
};

// Development fallback component generator
export const createDevelopmentFallbackConfig = (
  componentName: string,
  error?: string
) => {
  if (!__DEV__) return null;

  return {
    componentName,
    error,
    message: `${componentName} encountered an issue during development.`,
    showRetry: true,
    showRefresh: true,
  };
};

// Development debugging helpers
export const devDebugHelpers = {
  // Log component lifecycle
  logLifecycle: (componentName: string, phase: 'mount' | 'update' | 'unmount', data?: any) => {
    if (__DEV__) {
      const emoji = phase === 'mount' ? '🟢' : phase === 'update' ? '🔄' : '🔴';
      console.log(`${emoji} ${componentName} ${phase}`, data || '');
    }
  },

  // Log state changes
  logStateChange: (componentName: string, prevState: any, newState: any) => {
    if (__DEV__) {
      console.group(`🔄 ${componentName} State Change`);
      console.log('Previous:', prevState);
      console.log('New:', newState);
      console.log('Diff:', {
        added: Object.keys(newState).filter(key => !(key in prevState)),
        removed: Object.keys(prevState).filter(key => !(key in newState)),
        changed: Object.keys(newState).filter(key => 
          key in prevState && JSON.stringify(prevState[key]) !== JSON.stringify(newState[key])
        ),
      });
      console.groupEnd();
    }
  },

  // Performance monitoring
  measureRender: (componentName: string, renderFn: () => any) => {
    if (__DEV__) {
      const start = performance.now();
      const result = renderFn();
      const end = performance.now();
      
      if (end - start > 16) { // More than one frame (60fps)
        console.warn(`⏱️ Slow render detected: ${componentName} took ${(end - start).toFixed(2)}ms`);
      }
      
      return result;
    }
    return renderFn();
  },

  // Memory usage tracking
  trackMemoryUsage: (componentName: string) => {
    if (__DEV__ && 'performance' in window && 'memory' in (performance as any)) {
      const memory = (performance as any).memory;
      console.log(`📊 ${componentName} Memory Usage:`, {
        used: Math.round(memory.usedJSHeapSize / 1024 / 1024) + 'MB',
        total: Math.round(memory.totalJSHeapSize / 1024 / 1024) + 'MB',
        limit: Math.round(memory.jsHeapSizeLimit / 1024 / 1024) + 'MB',
        percentage: Math.round((memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100) + '%',
      });
    }
  },
};
