import React, { useState, useEffect, memo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Activity,
  Clock,
  AlertTriangle,
  ArrowUp,
  ArrowDown,
} from 'react-native-feather';
import { DashboardConfig, AssetData } from './types';
import { DashboardContainer, ActionButton } from './shared';
import OptimizedAssetList from './shared/OptimizedAssetList';
import OptimizedActivityList, { ActivityItem } from './shared/OptimizedActivityList';
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

  const renderStatCard = (title: string, value: string, change: string, changePercent: number, icon: any) => {
    const IconComponent = icon;
    const isPositive = changePercent >= 0;
    
    return (
      <View className="bg-gray-50 rounded-xl p-4 border border-gray-200 shadow-sm" style={{ width: (width - 48) / 2 - 6 }}>
        <View className="flex-row items-center justify-between mb-3">
          <View className="w-10 h-10 bg-primary rounded-lg items-center justify-center">
            <IconComponent width={20} height={20} stroke="#ffffff" />
          </View>
          <View className={`flex-row items-center px-2 py-1 rounded-full ${isPositive ? 'bg-green-100' : 'bg-red-100'}`}>
            {isPositive ? (
              <ArrowUp width={12} height={12} stroke="#10b981" />
            ) : (
              <ArrowDown width={12} height={12} stroke="#ef4444" />
            )}
            <Text className={`text-xs font-medium ml-1 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {Math.abs(changePercent)}%
            </Text>
          </View>
        </View>
        <Text className="text-2xl font-bold text-gray-900 mb-1">{value}</Text>
        <Text className="text-gray-600 text-sm mb-1">{title}</Text>
        <Text className={`text-sm font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
          {change}
        </Text>
      </View>
    );
  };

  const renderAssetRow = (asset: AssetData) => {
    const isPositive = asset.changePercent >= 0;
    
    return (
      <View key={asset.symbol} className="flex-row items-center py-4 border-b border-gray-100 last:border-b-0">
        <View className="w-12 h-12 bg-gray-100 rounded-full items-center justify-center mr-4">
          <Text className="text-gray-700 font-bold text-sm">{asset.symbol}</Text>
        </View>
        <View className="flex-1">
          <Text className="text-gray-900 font-semibold">{asset.name}</Text>
          <Text className="text-gray-500 text-sm">{asset.holdings} {asset.symbol}</Text>
        </View>
        <View className="items-end">
          <Text className="text-gray-900 font-semibold">${asset.value?.toLocaleString()}</Text>
          <View className="flex-row items-center">
            <Text className={`text-sm font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {isPositive ? '+' : ''}{asset.changePercent}%
            </Text>
            <Text className="text-gray-500 text-sm ml-2">{asset.allocation}%</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderActivityItem = (activity: any) => {
    const getActivityColor = (type: string) => {
      switch (type) {
        case 'buy': return 'bg-green-500';
        case 'sell': return 'bg-red-500';
        case 'dividend': return 'bg-blue-500';
        default: return 'bg-gray-500';
      }
    };

    const getActivityText = (activity: any) => {
      switch (activity.type) {
        case 'buy':
          return `Bought ${activity.amount} ${activity.asset} at $${activity.price.toLocaleString()}`;
        case 'sell':
          return `Sold ${activity.amount} ${activity.asset} at $${activity.price.toLocaleString()}`;
        case 'dividend':
          return `Received $${activity.amount} dividend from ${activity.asset}`;
        default:
          return 'Unknown activity';
      }
    };

    return (
      <View key={activity.id} className="flex-row items-center py-3 border-b border-gray-100 last:border-b-0">
        <View className={`w-3 h-3 rounded-full mr-3 ${getActivityColor(activity.type)}`} />
        <View className="flex-1">
          <Text className="text-gray-900 font-medium text-sm">{getActivityText(activity)}</Text>
          <Text className="text-gray-500 text-xs">{activity.time}</Text>
        </View>
      </View>
    );
  };

  return (
    <DashboardContainer>
      {/* Portfolio Summary */}
      <View className="mb-6">
        <Text className="text-2xl font-bold text-gray-900 mb-1">Portfolio Overview</Text>
        <Text className="text-gray-600 mb-4">Welcome back! Here's your portfolio summary.</Text>
        
        <View className="flex-row flex-wrap justify-between gap-3">
          {renderStatCard(
            'Total Value',
            `$${portfolioData.totalValue.toLocaleString()}`,
            `+$${portfolioData.totalChange.toLocaleString()}`,
            portfolioData.totalChangePercent,
            DollarSign
          )}
          {renderStatCard(
            'Today\'s Change',
            `$${portfolioData.dayChange.toLocaleString()}`,
            `${portfolioData.dayChangePercent > 0 ? '+' : ''}${portfolioData.dayChangePercent}%`,
            portfolioData.dayChangePercent,
            Activity
          )}
        </View>
      </View>

      {/* Optimized Top Holdings */}
      <OptimizedAssetList 
        assets={topAssets}
        headerTitle="Top Holdings"
        onViewAll={() => console.log('View All Assets')}
      />

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

      {/* Optimized Recent Activity */}
      <OptimizedActivityList 
        activities={recentActivity}
        headerTitle="Recent Activity"
      />

      {/* Quick Actions */}
      <View className="mb-6">
        <Text className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</Text>
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
