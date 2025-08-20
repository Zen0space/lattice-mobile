import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { Zap, TrendingUp, BarChart2, DollarSign } from 'react-native-feather';
import { DashboardConfig } from './types';

interface TradingDashboardProps {
  config: DashboardConfig;
}

const TradingDashboard: React.FC<TradingDashboardProps> = ({ config }) => {
  return (
    <ScrollView className="flex-1 bg-white" contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
      <View className="mb-6">
        <Text className="text-2xl font-bold text-gray-900 mb-1">Trading</Text>
        <Text className="text-gray-600">Active trading interface and tools</Text>
      </View>

      <View className="bg-gray-50 rounded-xl p-6 border border-gray-200 shadow-sm mb-6 items-center">
        <Zap width={64} height={64} stroke="#f97316" />
        <Text className="text-lg font-semibold text-gray-900 mt-4 mb-2">Trading Dashboard</Text>
        <Text className="text-gray-600 text-center">Advanced trading tools coming soon</Text>
      </View>

      <View className="flex-row justify-between">
        <TouchableOpacity className="flex-1 bg-orange-500 rounded-xl p-4 mr-2 items-center">
          <TrendingUp width={24} height={24} stroke="#ffffff" />
          <Text className="text-white font-semibold mt-2">Trade</Text>
        </TouchableOpacity>
        <TouchableOpacity className="flex-1 bg-gray-50 border border-gray-200 rounded-xl p-4 ml-2 items-center">
          <BarChart2 width={24} height={24} stroke="#6B7280" />
          <Text className="text-gray-700 font-semibold mt-2">Charts</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default TradingDashboard;
