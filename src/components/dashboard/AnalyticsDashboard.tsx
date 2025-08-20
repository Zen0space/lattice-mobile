import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { Activity, BarChart2, TrendingUp, PieChart } from 'react-native-feather';
import { DashboardConfig } from './types';

interface AnalyticsDashboardProps {
  config: DashboardConfig;
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ config }) => {
  return (
    <ScrollView className="flex-1 bg-white" contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
      <View className="mb-6">
        <Text className="text-2xl font-bold text-gray-900 mb-1">Analytics</Text>
        <Text className="text-gray-600">Advanced analytics and performance metrics</Text>
      </View>

      <View className="bg-gray-50 rounded-xl p-6 border border-gray-200 shadow-sm mb-6 items-center">
        <Activity width={64} height={64} stroke="#ef4444" />
        <Text className="text-lg font-semibold text-gray-900 mt-4 mb-2">Analytics Dashboard</Text>
        <Text className="text-gray-600 text-center">Advanced analytics and insights coming soon</Text>
      </View>

      <View className="flex-row justify-between">
        <TouchableOpacity className="flex-1 bg-red-500 rounded-xl p-4 mr-2 items-center">
          <BarChart2 width={24} height={24} stroke="#ffffff" />
          <Text className="text-white font-semibold mt-2">Reports</Text>
        </TouchableOpacity>
        <TouchableOpacity className="flex-1 bg-gray-50 border border-gray-200 rounded-xl p-4 ml-2 items-center">
          <PieChart width={24} height={24} stroke="#6B7280" />
          <Text className="text-gray-700 font-semibold mt-2">Analysis</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default AnalyticsDashboard;
