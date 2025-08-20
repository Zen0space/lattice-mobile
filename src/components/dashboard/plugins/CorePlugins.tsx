import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Dimensions } from 'react-native';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Activity,
  PieChart,
  BarChart2,
  Clock,
  Bell,
  Zap,
  Eye,
} from 'react-native-feather';
import { DashboardPlugin, DashboardPluginProps } from '../DashboardRenderer';
import { StatCard, SectionHeader, AssetCard } from '../shared';
import { pluginRegistry } from './DashboardPluginRegistry';

const { width } = Dimensions.get('window');

/**
 * Core Dashboard Plugins
 *
 * Essential plugins that provide fundamental dashboard functionality
 * These plugins demonstrate the plugin system capabilities and provide
 * commonly needed dashboard components
 */

// Market Overview Plugin
const MarketOverviewPlugin: React.FC<DashboardPluginProps> = ({
  data,
  theme,
  settings,
  onDataUpdate,
}) => {
  const [marketData, setMarketData] = useState({
    sp500: { value: 4825.23, change: 1.2 },
    nasdaq: { value: 15234.56, change: -0.8 },
    dow: { value: 38456.78, change: 0.5 },
  });

  return (
    <View className="mb-6">
      <SectionHeader title="Market Overview" subtitle="Major market indices" variant="compact" />
      <View className="flex-row flex-wrap justify-between gap-3">
        <StatCard
          title="S&P 500"
          value={marketData.sp500.value.toLocaleString()}
          change={`${marketData.sp500.change > 0 ? '+' : ''}${marketData.sp500.change}%`}
          changePercent={marketData.sp500.change}
          icon={TrendingUp}
          variant="compact"
        />
        <StatCard
          title="NASDAQ"
          value={marketData.nasdaq.value.toLocaleString()}
          change={`${marketData.nasdaq.change > 0 ? '+' : ''}${marketData.nasdaq.change}%`}
          changePercent={marketData.nasdaq.change}
          icon={BarChart2}
          variant="compact"
        />
        <StatCard
          title="Dow Jones"
          value={marketData.dow.value.toLocaleString()}
          change={`${marketData.dow.change > 0 ? '+' : ''}${marketData.dow.change}%`}
          changePercent={marketData.dow.change}
          icon={Activity}
          variant="compact"
        />
      </View>
    </View>
  );
};

// News Feed Plugin
const NewsFeedPlugin: React.FC<DashboardPluginProps> = ({ data, theme, settings }) => {
  const [news] = useState([
    {
      id: '1',
      title: 'Market Rally Continues as Tech Stocks Surge',
      summary: 'Technology stocks led the market higher today...',
      timestamp: '2 hours ago',
      category: 'Market',
    },
    {
      id: '2',
      title: 'Federal Reserve Signals Potential Rate Changes',
      summary: 'The Federal Reserve hinted at upcoming monetary policy adjustments...',
      timestamp: '4 hours ago',
      category: 'Economic',
    },
    {
      id: '3',
      title: 'Cryptocurrency Market Shows Mixed Signals',
      summary: 'Bitcoin and major altcoins display varied performance...',
      timestamp: '6 hours ago',
      category: 'Crypto',
    },
  ]);

  return (
    <View className="mb-6">
      <SectionHeader
        title="Market News"
        subtitle="Latest financial news"
        showAction
        actionText="View All"
        onActionPress={() => console.log('View all news')}
      />
      <View className="space-y-3">
        {news.map(item => (
          <TouchableOpacity
            key={item.id}
            className="bg-white rounded-lg border border-gray-200 p-4"
            onPress={() => console.log('News item pressed:', item.id)}
          >
            <View className="flex-row items-start justify-between mb-2">
              <Text className="text-sm font-medium text-blue-600">{item.category}</Text>
              <Text className="text-xs text-gray-500">{item.timestamp}</Text>
            </View>
            <Text className="text-base font-semibold text-gray-900 mb-1">{item.title}</Text>
            <Text className="text-sm text-gray-600" numberOfLines={2}>
              {item.summary}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

// Quick Actions Plugin
const QuickActionsPlugin: React.FC<DashboardPluginProps> = ({ config, theme, settings }) => {
  const actions = [
    { id: 'buy', title: 'Buy', icon: TrendingUp, color: '#10b981' },
    { id: 'sell', title: 'Sell', icon: TrendingDown, color: '#ef4444' },
    { id: 'portfolio', title: 'Portfolio', icon: PieChart, color: '#8b5cf6' },
    { id: 'alerts', title: 'Alerts', icon: Bell, color: '#f59e0b' },
  ];

  return (
    <View className="mb-6">
      <SectionHeader title="Quick Actions" subtitle="Common portfolio actions" variant="compact" />
      <View className="flex-row flex-wrap justify-between gap-3">
        {actions.map(action => {
          const IconComponent = action.icon;
          return (
            <TouchableOpacity
              key={action.id}
              className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 items-center"
              style={{ width: (width - 48) / 2 - 6 }}
              onPress={() => console.log(`${action.title} pressed`)}
            >
              <View
                className="w-12 h-12 rounded-full items-center justify-center mb-3"
                style={{ backgroundColor: action.color }}
              >
                <IconComponent width={24} height={24} stroke="#ffffff" />
              </View>
              <Text className="text-gray-900 font-medium text-sm">{action.title}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

// Watchlist Plugin
const WatchlistPlugin: React.FC<DashboardPluginProps> = ({ data, theme, settings }) => {
  const [watchlist] = useState([
    { symbol: 'AAPL', name: 'Apple Inc.', price: 178.25, change: 2.34, changePercent: 1.33 },
    { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 142.56, change: -1.23, changePercent: -0.85 },
    { symbol: 'MSFT', name: 'Microsoft Corp.', price: 378.91, change: 4.56, changePercent: 1.22 },
  ]);

  return (
    <View className="mb-6">
      <SectionHeader
        title="Watchlist"
        subtitle="Stocks you're tracking"
        showAction
        actionText="Manage"
        onActionPress={() => console.log('Manage watchlist')}
      />
      <View className="space-y-2">
        {watchlist.map(asset => (
          <AssetCard
            key={asset.symbol}
            asset={asset}
            variant="compact"
            onPress={asset => console.log('Watchlist asset pressed:', asset.symbol)}
          />
        ))}
      </View>
    </View>
  );
};

// Performance Summary Plugin
const PerformanceSummaryPlugin: React.FC<DashboardPluginProps> = ({ data, theme, settings }) => {
  const [performance] = useState({
    today: { value: 1247.89, percent: 0.99 },
    week: { value: 3456.78, percent: 2.34 },
    month: { value: -567.89, percent: -0.45 },
    year: { value: 12345.67, percent: 15.67 },
  });

  return (
    <View className="mb-6">
      <SectionHeader
        title="Performance Summary"
        subtitle="Portfolio performance over time"
        variant="compact"
      />
      <View className="flex-row flex-wrap justify-between gap-3">
        <StatCard
          title="Today"
          value={`$${Math.abs(performance.today.value).toLocaleString()}`}
          change={`${performance.today.percent > 0 ? '+' : ''}${performance.today.percent}%`}
          changePercent={performance.today.percent}
          icon={Clock}
          variant="compact"
        />
        <StatCard
          title="This Week"
          value={`$${Math.abs(performance.week.value).toLocaleString()}`}
          change={`${performance.week.percent > 0 ? '+' : ''}${performance.week.percent}%`}
          changePercent={performance.week.percent}
          icon={Activity}
          variant="compact"
        />
        <StatCard
          title="This Month"
          value={`$${Math.abs(performance.month.value).toLocaleString()}`}
          change={`${performance.month.percent > 0 ? '+' : ''}${performance.month.percent}%`}
          changePercent={performance.month.percent}
          icon={TrendingDown}
          variant="compact"
        />
        <StatCard
          title="This Year"
          value={`$${Math.abs(performance.year.value).toLocaleString()}`}
          change={`${performance.year.percent > 0 ? '+' : ''}${performance.year.percent}%`}
          changePercent={performance.year.percent}
          icon={TrendingUp}
          variant="compact"
        />
      </View>
    </View>
  );
};

// Export plugin definitions
export const CORE_PLUGINS: DashboardPlugin[] = [
  {
    id: 'market-overview',
    name: 'Market Overview',
    version: '1.0.0',
    component: MarketOverviewPlugin,
    requiredData: [],
    supportedThemes: ['light', 'dark'],
    settings: {
      showIndices: ['sp500', 'nasdaq', 'dow'],
      updateInterval: 60000,
    },
  },
  {
    id: 'news-feed',
    name: 'News Feed',
    version: '1.0.0',
    component: NewsFeedPlugin,
    requiredData: [],
    supportedThemes: ['light', 'dark'],
    settings: {
      maxItems: 5,
      categories: ['market', 'economic', 'crypto'],
      autoRefresh: true,
    },
  },
  {
    id: 'quick-actions',
    name: 'Quick Actions',
    version: '1.0.0',
    component: QuickActionsPlugin,
    requiredData: [],
    supportedThemes: ['light', 'dark'],
    settings: {
      actions: ['buy', 'sell', 'portfolio', 'alerts'],
      layout: 'grid',
    },
  },
  {
    id: 'watchlist',
    name: 'Watchlist',
    version: '1.0.0',
    component: WatchlistPlugin,
    requiredData: ['assets'],
    supportedThemes: ['light', 'dark'],
    settings: {
      maxItems: 10,
      showPriceAlerts: true,
      compactMode: true,
    },
  },
  {
    id: 'performance-summary',
    name: 'Performance Summary',
    version: '1.0.0',
    component: PerformanceSummaryPlugin,
    requiredData: ['performance'],
    supportedThemes: ['light', 'dark'],
    settings: {
      timeframes: ['today', 'week', 'month', 'year'],
      showPercentage: true,
    },
  },
];

// Auto-register core plugins
export function registerCorePlugins() {
  CORE_PLUGINS.forEach(plugin => {
    pluginRegistry.register(plugin, 'core');
  });

  if (__DEV__) {
    console.log(`✅ Registered ${CORE_PLUGINS.length} core dashboard plugins`);
  }
}

export default CORE_PLUGINS;
