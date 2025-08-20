import React, { useEffect, useRef, useCallback, useState } from 'react';

/**
 * Memory Leak Prevention Utilities - 2025 Best Practices
 * Based on latest React Native research for preventing common memory leaks
 */

// Hook to prevent state updates on unmounted components
export const useMountedRef = () => {
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  return mountedRef;
};

// Safe state setter that checks if component is mounted
export const useSafeState = <T>(initialState: T): [T, (newState: T | ((prevState: T) => T)) => void] => {
  const [state, setState] = React.useState<T>(initialState);
  const mountedRef = useMountedRef();

  const safeSetState = useCallback((newState: T | ((prevState: T) => T)) => {
    if (mountedRef.current) {
      setState(newState);
    }
  }, [mountedRef]);

  return [state, safeSetState];
};

// Hook for safe async operations
export const useSafeAsync = () => {
  const mountedRef = useMountedRef();

  return useCallback(async <T>(asyncOperation: () => Promise<T>): Promise<T | null> => {
    try {
      const result = await asyncOperation();
      return mountedRef.current ? result : null;
    } catch (error) {
      if (mountedRef.current) {
        throw error;
      }
      return null;
    }
  }, [mountedRef]);
};

// Hook for managing subscriptions with automatic cleanup
export const useSubscription = <T>(
  subscribe: (callback: (data: T) => void) => () => void,
  callback: (data: T) => void,
  deps: React.DependencyList = []
) => {
  const mountedRef = useMountedRef();
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    const safeCallback = (data: T) => {
      if (mountedRef.current) {
        callbackRef.current(data);
      }
    };

    const unsubscribe = subscribe(safeCallback);

    return () => {
      unsubscribe();
    };
  }, [...deps, mountedRef]);
};

// Hook for managing intervals with cleanup
export const useSafeInterval = (
  callback: () => void,
  delay: number | null,
  deps: React.DependencyList = []
) => {
  const mountedRef = useMountedRef();
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    if (delay === null) return;

    const safeCallback = () => {
      if (mountedRef.current) {
        callbackRef.current();
      }
    };

    const intervalId = setInterval(safeCallback, delay);

    return () => {
      clearInterval(intervalId);
    };
  }, [delay, mountedRef, ...deps]);
};

// Hook for managing timeouts with cleanup
export const useSafeTimeout = (
  callback: () => void,
  delay: number | null,
  deps: React.DependencyList = []
) => {
  const mountedRef = useMountedRef();
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    if (delay === null) return;

    const safeCallback = () => {
      if (mountedRef.current) {
        callbackRef.current();
      }
    };

    const timeoutId = setTimeout(safeCallback, delay);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [delay, mountedRef, ...deps]);
};

// Hook for event listeners with automatic cleanup
export const useEventListener = <K extends keyof WindowEventMap>(
  eventName: K,
  handler: (event: WindowEventMap[K]) => void,
  element: Window | Element = window,
  deps: React.DependencyList = []
) => {
  const mountedRef = useMountedRef();
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    const safeHandler = (event: WindowEventMap[K]) => {
      if (mountedRef.current) {
        handlerRef.current(event);
      }
    };

    element.addEventListener(eventName, safeHandler as any);

    return () => {
      element.removeEventListener(eventName, safeHandler as any);
    };
  }, [eventName, element, mountedRef, ...deps]);
};

// Hook for managing fetch requests with cleanup
export const useFetch = <T>(
  url: string,
  options?: RequestInit
): {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
} => {
  const [data, setData] = useSafeState<T | null>(null);
  const [loading, setLoading] = useSafeState(false);
  const [error, setError] = useSafeState<Error | null>(null);
  const safeAsync = useSafeAsync();
  const mountedRef = useMountedRef();

  const fetchData = useCallback(async () => {
    if (!mountedRef.current) return;

    setLoading(true);
    setError(null);

    const result = await safeAsync(async () => {
      const response = await fetch(url, options);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    });

    if (result !== null) {
      setData(result);
    }
    setLoading(false);
  }, [url, options, safeAsync, setData, setLoading, setError, mountedRef]);

  const refetch = useCallback(() => {
    fetchData().catch((err) => {
      if (mountedRef.current) {
        setError(err);
        setLoading(false);
      }
    });
  }, [fetchData, setError, setLoading, mountedRef]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { data, loading, error, refetch };
};

// Development utilities for memory leak detection
export const memoryLeakDetection = {
  // Track component mount/unmount cycles
  useComponentLifecycleLogger: (componentName: string) => {
    useEffect(() => {
      if (__DEV__) {
        if (__DEV__) {

          console.log(`🟢 ${componentName} mounted`);

        }
        return () => {
          if (__DEV__) {

            console.log(`🔴 ${componentName} unmounted`);

          }
        };
      }
    }, [componentName]);
  },

  // Monitor memory usage (development only)
  useMemoryMonitor: (componentName: string, checkInterval: number = 5000) => {
    useSafeInterval(() => {
      if (__DEV__ && 'performance' in window && 'memory' in (performance as any)) {
        const memory = (performance as any).memory;
        if (memory.usedJSHeapSize > memory.jsHeapSizeLimit * 0.8) {
          console.warn(`⚠️ High memory usage detected in ${componentName}:`, {
            used: Math.round(memory.usedJSHeapSize / 1024 / 1024) + 'MB',
            total: Math.round(memory.totalJSHeapSize / 1024 / 1024) + 'MB',
            limit: Math.round(memory.jsHeapSizeLimit / 1024 / 1024) + 'MB',
          });
        }
      }
    }, __DEV__ ? checkInterval : null);
  },

  // Check for potential memory leaks
  useLeakDetector: (componentName: string) => {
    const mountTimeRef = useRef<number>(0);
    const cleanupFunctionsRef = useRef<Array<() => void>>([]);

    useEffect(() => {
      if (__DEV__) {
        mountTimeRef.current = Date.now();
        
        return () => {
          const unmountTime = Date.now();
          const lifespan = unmountTime - (mountTimeRef.current || unmountTime);
          
          if (cleanupFunctionsRef.current.length === 0 && lifespan > 1000) {
            console.warn(`⚠️ Potential memory leak in ${componentName}: No cleanup functions registered for long-lived component (${lifespan}ms)`);
          }
          
          // Execute all cleanup functions
          cleanupFunctionsRef.current.forEach(cleanup => cleanup());
        };
      }
    }, [componentName]);

    return useCallback((cleanupFn: () => void) => {
      if (__DEV__) {
        cleanupFunctionsRef.current.push(cleanupFn);
      }
    }, []);
  },
};
