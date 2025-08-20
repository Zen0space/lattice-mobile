/**
 * Bundle Analysis Utilities - 2025 Best Practices
 * Tools for monitoring and optimizing bundle size in React Native/Expo
 */

// Bundle analysis configuration
export interface BundleAnalysisConfig {
  enableLogging: boolean;
  trackChunkLoading: boolean;
  monitorMemoryUsage: boolean;
  reportThreshold: number; // MB
}

// Default configuration
const defaultConfig: BundleAnalysisConfig = {
  enableLogging: __DEV__,
  trackChunkLoading: __DEV__,
  monitorMemoryUsage: __DEV__,
  reportThreshold: 50, // Report if bundle size exceeds 50MB
};

// Bundle analysis class
export class BundleAnalyzer {
  private config: BundleAnalysisConfig;
  private startTime: number;
  private chunkLoadTimes: Map<string, number> = new Map();
  private memorySnapshots: Array<{ timestamp: number; usage: number }> = [];

  constructor(config: Partial<BundleAnalysisConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
    this.startTime = Date.now();

    if (this.config.enableLogging) {
      this.initializeAnalysis();
    }
  }

  private initializeAnalysis() {
    if (!__DEV__) return;

    if (__DEV__) {
      console.log('📦 Bundle Analysis initialized');
    }

    if (this.config.monitorMemoryUsage) {
      this.startMemoryMonitoring();
    }
  }

  private startMemoryMonitoring() {
    const monitorMemory = () => {
      if ('performance' in window && 'memory' in (performance as any)) {
        const memory = (performance as any).memory;
        const usage = Math.round(memory.usedJSHeapSize / 1024 / 1024);

        this.memorySnapshots.push({
          timestamp: Date.now(),
          usage,
        });

        // Keep only last 100 snapshots
        if (this.memorySnapshots.length > 100) {
          this.memorySnapshots.shift();
        }

        // Report if usage exceeds threshold
        if (usage > this.config.reportThreshold) {
          console.warn(`⚠️ High memory usage detected: ${usage}MB`);
        }
      }
    };

    // Monitor every 5 seconds
    setInterval(monitorMemory, 5000);
    monitorMemory(); // Initial measurement
  }

  // Track chunk loading performance
  trackChunkLoad(chunkName: string): () => void {
    if (!this.config.trackChunkLoading) {
      return () => {};
    }

    const startTime = performance.now();
    this.chunkLoadTimes.set(chunkName, startTime);

    return () => {
      const endTime = performance.now();
      const loadTime = endTime - startTime;

      if (__DEV__) {
        console.log(`📦 Chunk "${chunkName}" loaded in ${loadTime.toFixed(2)}ms`);
      }

      if (loadTime > 1000) {
        console.warn(`⚠️ Slow chunk loading detected: ${chunkName} (${loadTime.toFixed(2)}ms)`);
      }
    };
  }

  // Generate performance report
  generateReport(): BundleReport {
    const currentTime = Date.now();
    const totalTime = currentTime - this.startTime;

    const report: BundleReport = {
      timestamp: new Date().toISOString(),
      totalAnalysisTime: totalTime,
      chunkLoadTimes: Object.fromEntries(this.chunkLoadTimes),
      memoryUsage: this.getMemoryStats(),
      recommendations: this.generateRecommendations(),
    };

    if (this.config.enableLogging) {
      console.group('📊 Bundle Analysis Report');
      if (__DEV__) {
        console.log('Total Analysis Time:', `${totalTime}ms`);
      }
      if (__DEV__) {
        console.log('Chunk Load Times:', report.chunkLoadTimes);
      }
      if (__DEV__) {
        console.log('Memory Usage:', report.memoryUsage);
      }
      if (__DEV__) {
        console.log('Recommendations:', report.recommendations);
      }
      console.groupEnd();
    }

    return report;
  }

  private getMemoryStats() {
    if (this.memorySnapshots.length === 0) {
      return {
        current: 0,
        peak: 0,
        average: 0,
        trend: 'stable' as const,
      };
    }

    const current = this.memorySnapshots[this.memorySnapshots.length - 1].usage;
    const peak = Math.max(...this.memorySnapshots.map(s => s.usage));
    const average = Math.round(
      this.memorySnapshots.reduce((sum, s) => sum + s.usage, 0) / this.memorySnapshots.length
    );

    // Calculate trend (simple linear regression)
    const trend = this.calculateMemoryTrend();

    return {
      current,
      peak,
      average,
      trend,
    };
  }

  private calculateMemoryTrend(): 'increasing' | 'decreasing' | 'stable' {
    if (this.memorySnapshots.length < 5) return 'stable';

    const recent = this.memorySnapshots.slice(-5);
    const first = recent[0].usage;
    const last = recent[recent.length - 1].usage;
    const diff = last - first;

    if (Math.abs(diff) < 5) return 'stable';
    return diff > 0 ? 'increasing' : 'decreasing';
  }

  private generateRecommendations(): string[] {
    const recommendations: string[] = [];
    const memoryStats = this.getMemoryStats();

    // Memory-based recommendations
    if (memoryStats.peak > this.config.reportThreshold) {
      recommendations.push(
        `Consider lazy loading more components (peak usage: ${memoryStats.peak}MB)`
      );
    }

    if (memoryStats.trend === 'increasing') {
      recommendations.push('Memory usage is trending upward - check for memory leaks');
    }

    // Chunk loading recommendations
    const slowChunks = Array.from(this.chunkLoadTimes.entries()).filter(
      ([_, time]) => performance.now() - time > 1000
    );

    if (slowChunks.length > 0) {
      recommendations.push(
        `Optimize slow-loading chunks: ${slowChunks.map(([name]) => name).join(', ')}`
      );
    }

    // General recommendations
    if (recommendations.length === 0) {
      recommendations.push('Bundle performance looks good! 🎉');
    }

    return recommendations;
  }

  // Reset analysis data
  reset() {
    this.startTime = Date.now();
    this.chunkLoadTimes.clear();
    this.memorySnapshots = [];
  }
}

// Bundle report interface
export interface BundleReport {
  timestamp: string;
  totalAnalysisTime: number;
  chunkLoadTimes: Record<string, number>;
  memoryUsage: {
    current: number;
    peak: number;
    average: number;
    trend: 'increasing' | 'decreasing' | 'stable';
  };
  recommendations: string[];
}

// Global bundle analyzer instance
let globalAnalyzer: BundleAnalyzer | null = null;

// Initialize global analyzer
export const initializeBundleAnalysis = (config?: Partial<BundleAnalysisConfig>) => {
  if (!__DEV__) return;

  globalAnalyzer = new BundleAnalyzer(config);

  // Auto-generate report every 5 minutes in development
  setInterval(
    () => {
      if (globalAnalyzer) {
        globalAnalyzer.generateReport();
      }
    },
    5 * 60 * 1000
  );
};

// Get global analyzer instance
export const getBundleAnalyzer = (): BundleAnalyzer | null => globalAnalyzer;

// Convenience functions
export const trackChunkLoad = (chunkName: string) => {
  return globalAnalyzer?.trackChunkLoad(chunkName) || (() => {});
};

export const generateBundleReport = (): BundleReport | null => {
  return globalAnalyzer?.generateReport() || null;
};

// Bundle optimization suggestions
export const bundleOptimizationTips = {
  // Code splitting tips
  codeSplitting: [
    'Use React.lazy() for component-level code splitting',
    'Implement route-based code splitting for better initial load',
    'Split vendor libraries into separate chunks',
    'Use dynamic imports for feature-specific modules',
  ],

  // Asset optimization tips
  assetOptimization: [
    'Convert images to WebP format for better compression',
    'Implement progressive image loading',
    'Use image sprites for small icons',
    'Optimize SVG assets by removing unnecessary elements',
  ],

  // Bundle size tips
  bundleSize: [
    'Remove unused dependencies with bundle analysis',
    'Use tree shaking to eliminate dead code',
    'Implement proper import/export patterns',
    'Consider using lighter alternatives for heavy libraries',
  ],

  // Performance tips
  performance: [
    'Preload critical resources',
    'Implement service worker caching',
    'Use resource hints (preload, prefetch)',
    'Optimize third-party script loading',
  ],
};
