import React, { useState, useEffect, memo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import {
  TrendingUp,
  DollarSign,
  Activity,
} from 'react-native-feather';
import { DashboardConfig, AssetData } from './types';
import { 
  DashboardContainer, 
  ActionButton, 
  StatCard,
  AssetCard,
  SectionHeader,
  WelcomeHeader,
  AssetsHeader,
  ActivityHeader,
  AssetDataRenderer,
  ActivityDataRenderer,
} from './shared';
import { ActivityItem } from './shared/OptimizedActivityList';
import { useMountedRef, memoryLeakDetection } from '../../utils/memoryLeakPrevention';

const { width } = Dimensions.get('window');

interface OverviewDashboardProps {
  config: DashboardConfig;
}

const OverviewDashboard: React.FC<OverviewDashboardProps> = ({ config }) => {
  // Memory leak prevention
  const mountedRef = useMountedRef();
  memoryLeakDetection.useComponentLifecycleLogger('OverviewDashboard');
  memoryLeakDetection.useMemoryMonitor('OverviewDashboard');
  
  const [portfolioData, setPortfolioData] = useState({
    totalValue: 125847.32,
    totalChange: 2847.23,
    totalChangePercent: 2.31,
    dayChange: 1247.89,
    dayChangePercent: 0.99,
  });

  const [topAssets] = useState<AssetData[]>([
    {
      symbol: 'BTC',
      name: 'Bitcoin',
      price: 114523.45,
      change: -1.23,
      changePercent: -1.23,
      holdings: 0.5,
      value: 57261.73,
      allocation: 45.5,
    },
    {
      symbol: 'ETH',
      name: 'Ethereum',
      price: 4187.92,
      change: 2.45,
      changePercent: 2.45,
      holdings: 8.2,
      value: 34341.29,
      allocation: 27.3,
    },
    {
      symbol: 'TSLA',
      name: 'Tesla',
      price: 367.89,
      change: 1.87,
      changePercent: 1.87,
      holdings: 50,
      value: 18394.50,
      allocation: 14.6,
    },
    {
      symbol: 'AAPL',
      name: 'Apple',
      price: 227.85,
      change: 0.64,
      changePercent: 0.64,
      holdings: 35,
      value: 7974.75,
      allocation: 6.3,
    },
  ]);

  const [recentActivity] = useState<ActivityItem[]>([
    {
      id: '1',
      type: 'buy' as const,
      asset: 'BTC',
      amount: 0.1,
      price: 114000,
      time: '2 hours ago',
    },
    {
      id: '2',
      type: 'sell' as const,
      asset: 'ETH',
      amount: 1.5,
      price: 4150,
      time: '5 hours ago',
    },
    {
      id: '3',
      type: 'dividend' as const,
      asset: 'AAPL',
      amount: 47.25,
      time: '1 day ago',
    },
  ]);

  // Removed renderStatCard - now using StatCard component

  // Removed renderAssetRow - now using AssetCard component

  // Removed render functions - now using shared components

  return (
    <DashboardContainer>
      {/* Portfolio Summary */}
      <WelcomeHeader 
        subtitle="Here's your portfolio summary."
      />
      
      <View className="flex-row flex-wrap justify-between gap-3 mb-6">
        <StatCard
          title="Total Value"
          value={`$${portfolioData.totalValue.toLocaleString()}`}
          change={`+$${portfolioData.totalChange.toLocaleString()}`}
          changePercent={portfolioData.totalChangePercent}
          icon={DollarSign}
        />
        <StatCard
          title="Today's Change"
          value={`$${portfolioData.dayChange.toLocaleString()}`}
          change={`${portfolioData.dayChangePercent > 0 ? '+' : ''}${portfolioData.dayChangePercent}%`}
          changePercent={portfolioData.dayChangePercent}
          icon={Activity}
        />
      </View>

      {/* Top Holdings */}
      <View className="mb-6">
        <AssetsHeader 
          totalAssets={topAssets.length}
          onViewAll={() => console.log('View All Assets')}
        />
        <AssetDataRenderer
          assets={topAssets.slice(0, 5)}
          variant="row"
          onAssetPress={(asset) => console.log('Asset pressed:', asset.symbol)}
          nestedInScrollView={true}
        />
      </View>

      {/* Performance Chart Placeholder */}
      <View className="mb-6">
        <Text className="text-lg font-semibold text-gray-900 mb-4">Performance</Text>
        <View className="bg-gray-50 rounded-xl border border-gray-200 shadow-sm p-4">
          <View className="h-32 bg-gradient-to-r from-primary/20 to-primary/5 rounded-lg items-center justify-center">
            <TrendingUp width={32} height={32} stroke="#10a37f" />
            <Text className="text-gray-600 mt-2">Performance Chart</Text>
            <Text className="text-gray-400 text-sm">Coming Soon</Text>
          </View>
        </View>
      </View>

      {/* Recent Activity */}
      <View className="mb-6">
        <ActivityHeader 
          onViewHistory={() => console.log('View Activity History')}
        />
        <ActivityDataRenderer
          activities={recentActivity.slice(0, 5)}
          onActivityPress={(activity) => console.log('Activity pressed:', activity)}
          nestedInScrollView={true}
        />
      </View>

      {/* Quick Actions */}
      <View className="mb-6">
        <SectionHeader 
          title="Quick Actions"
          subtitle="Manage your portfolio with ease"
          variant="compact"
        />
        <View className="flex-row justify-between gap-4">
          <ActionButton
            title="Buy Assets"
            icon={TrendingUp}
            onPress={() => console.log('Buy Assets')}
            variant="primary"
            color="#10a37f"
          />
          <ActionButton
            title="Analytics"
            icon={Activity}
            onPress={() => console.log('Analytics')}
            variant="secondary"
          />
        </View>
      </View>
    </DashboardContainer>
  );
};

// Export with performance optimizations
export default memo(OverviewDashboard);
