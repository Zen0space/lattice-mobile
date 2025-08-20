import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import {
  TrendingUp,
  BarChart2,
  DollarSign,
  ArrowUp,
  ArrowDown,
  PieChart,
} from 'react-native-feather';
import { DashboardConfig, AssetData } from './types';

const { width } = Dimensions.get('window');

interface StocksDashboardProps {
  config: DashboardConfig;
}

const StocksDashboard: React.FC<StocksDashboardProps> = ({ config }) => {
  const [stockHoldings] = useState<AssetData[]>([
    {
      symbol: 'TSLA',
      name: 'Tesla Inc',
      price: 367.89,
      change: 6.87,
      changePercent: 1.87,
      holdings: 50,
      value: 18394.50,
    },
    {
      symbol: 'AAPL',
      name: 'Apple Inc',
      price: 227.85,
      change: 1.45,
      changePercent: 0.64,
      holdings: 35,
      value: 7974.75,
    },
    {
      symbol: 'NVDA',
      name: 'NVIDIA Corp',
      price: 142.67,
      change: -3.12,
      changePercent: -2.15,
      holdings: 75,
      value: 10700.25,
    },
  ]);

  const [sectorAllocation] = useState([
    { name: 'Technology', percentage: 45, value: 16847.50, color: '#3b82f6' },
    { name: 'Healthcare', percentage: 20, value: 7487.00, color: '#10b981' },
    { name: 'Financial', percentage: 15, value: 5615.25, color: '#f59e0b' },
    { name: 'Consumer', percentage: 20, value: 7487.00, color: '#8b5cf6' },
  ]);

  const renderStockCard = (stock: AssetData) => {
    const isPositive = stock.changePercent >= 0;
    
    return (
      <View key={stock.symbol} className="bg-gray-50 rounded-xl p-4 border border-gray-200 shadow-sm mb-4">
        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-row items-center">
            <View className="w-12 h-12 bg-blue-100 rounded-full items-center justify-center mr-3">
              <Text className="text-blue-600 font-bold text-sm">{stock.symbol}</Text>
            </View>
            <View>
              <Text className="text-gray-900 font-semibold">{stock.name}</Text>
              <Text className="text-gray-500 text-sm">{stock.holdings} shares</Text>
            </View>
          </View>
          <View className={`px-2 py-1 rounded-full ${isPositive ? 'bg-green-100' : 'bg-red-100'}`}>
            <Text className={`text-xs font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {isPositive ? '+' : ''}{stock.changePercent}%
            </Text>
          </View>
        </View>
        
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-xl font-bold text-gray-900">${stock.price}</Text>
            <Text className={`text-sm font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {isPositive ? '+' : ''}${stock.change}
            </Text>
          </View>
          <View className="items-end">
            <Text className="text-gray-600 text-sm">Total Value</Text>
            <Text className="text-lg font-semibold text-gray-900">${stock.value?.toLocaleString()}</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderSectorCard = (sector: any) => {
    return (
      <View key={sector.name} className="bg-gray-50 rounded-xl p-4 border border-gray-200 shadow-sm mb-3">
        <View className="flex-row items-center justify-between mb-2">
          <View className="flex-row items-center">
            <View 
              className="w-4 h-4 rounded-full mr-3"
              style={{ backgroundColor: sector.color }}
            />
            <Text className="text-gray-900 font-semibold">{sector.name}</Text>
          </View>
          <Text className="text-gray-600 font-medium">{sector.percentage}%</Text>
        </View>
        <Text className="text-lg font-bold text-gray-900">${sector.value.toLocaleString()}</Text>
      </View>
    );
  };

  return (
    <ScrollView className="flex-1 bg-white" contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
      {/* Header */}
      <View className="mb-6">
        <Text className="text-2xl font-bold text-gray-900 mb-1">Stock Portfolio</Text>
        <Text className="text-gray-600">Monitor your equity investments</Text>
      </View>

      {/* Portfolio Summary */}
      <View className="bg-gray-50 rounded-xl p-4 border border-gray-200 shadow-sm mb-6">
        <Text className="text-gray-600 text-sm mb-2">Total Stock Value</Text>
        <Text className="text-3xl font-bold text-gray-900 mb-2">$37,069.50</Text>
        <View className="flex-row items-center">
          <ArrowUp width={16} height={16} stroke="#10b981" />
          <Text className="text-green-600 font-semibold ml-1">+$1,247.32 (3.48%)</Text>
          <Text className="text-gray-500 text-sm ml-2">Today</Text>
        </View>
      </View>

      {/* Holdings */}
      <View className="mb-6">
        <Text className="text-lg font-semibold text-gray-900 mb-4">Your Holdings</Text>
        {stockHoldings.map(renderStockCard)}
      </View>

      {/* Sector Allocation */}
      <View className="mb-6">
        <Text className="text-lg font-semibold text-gray-900 mb-4">Sector Allocation</Text>
        {sectorAllocation.map(renderSectorCard)}
      </View>

      {/* Quick Actions */}
      <View className="mb-6">
        <Text className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</Text>
        <View className="flex-row justify-between gap-4">
          <TouchableOpacity className="flex-1 bg-blue-500 rounded-xl p-4 items-center">
            <TrendingUp width={24} height={24} stroke="#ffffff" />
            <Text className="text-white font-semibold mt-2">Buy Stocks</Text>
          </TouchableOpacity>
          <TouchableOpacity className="flex-1 bg-gray-50 border border-gray-200 rounded-xl p-4 items-center">
            <BarChart2 width={24} height={24} stroke="#6B7280" />
            <Text className="text-gray-700 font-semibold mt-2">Analysis</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

export default StocksDashboard;
