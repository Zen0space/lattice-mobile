import { DashboardTemplate, DashboardType } from './types';

export const DASHBOARD_TEMPLATES: Record<DashboardType, DashboardTemplate> = {
  overview: {
    type: 'overview',
    name: 'Overview',
    description: 'Complete portfolio overview with key metrics',
    icon: 'home',
    color: '#10a37f',
    defaultSettings: {
      theme: 'dark',
      autoRefresh: true,
      refreshInterval: 30000,
      defaultTimeframe: '1D',
      showPriceAlerts: true,
      compactMode: false
    },
    components: ['totalValue', 'performance', 'topAssets', 'recentActivity']
  },

  stocks: {
    type: 'stocks',
    name: 'Stocks',
    description: 'Stock portfolio and equity market analysis',
    icon: 'bar-chart-2',
    color: '#3b82f6',
    defaultSettings: {
      theme: 'light',
      autoRefresh: true,
      refreshInterval: 60000,
      defaultTimeframe: '1D',
      showPriceAlerts: true,
      compactMode: false
    },
    components: ['stockHoldings', 'sectorAllocation', 'earnings', 'dividends']
  },
  portfolio: {
    type: 'portfolio',
    name: 'Portfolio',
    description: 'Comprehensive portfolio management and analytics',
    icon: 'pie-chart',
    color: '#8b5cf6',
    defaultSettings: {
      theme: 'light',
      autoRefresh: true,
      refreshInterval: 30000,
      defaultTimeframe: '1M',
      showPriceAlerts: true,
      compactMode: false
    },
    components: ['allocation', 'performance', 'riskMetrics', 'rebalancing']
  },
  watchlist: {
    type: 'watchlist',
    name: 'Watchlist',
    description: 'Track assets and market opportunities',
    icon: 'eye',
    color: '#06b6d4',
    defaultSettings: {
      theme: 'dark',
      autoRefresh: true,
      refreshInterval: 15000,
      defaultTimeframe: '1D',
      showPriceAlerts: true,
      compactMode: true
    },
    components: ['watchedAssets', 'priceAlerts', 'technicalIndicators', 'marketScanner']
  },
  analytics: {
    type: 'analytics',
    name: 'Analytics',
    description: 'Advanced analytics and performance metrics',
    icon: 'activity',
    color: '#ef4444',
    defaultSettings: {
      theme: 'light',
      autoRefresh: false,
      refreshInterval: 60000,
      defaultTimeframe: '3M',
      showPriceAlerts: false,
      compactMode: false
    },
    components: ['performanceAnalysis', 'riskAnalysis', 'correlationMatrix', 'backtesting']
  },
  trading: {
    type: 'trading',
    name: 'Trading',
    description: 'Active trading interface and tools',
    icon: 'zap',
    color: '#f97316',
    defaultSettings: {
      theme: 'dark',
      autoRefresh: true,
      refreshInterval: 5000,
      defaultTimeframe: '1D',
      showPriceAlerts: true,
      compactMode: true
    },
    components: ['orderBook', 'tradingCharts', 'positions', 'pnl']
  }
};
