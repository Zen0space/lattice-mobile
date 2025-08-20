import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import {
  Plus,
  X,
  Home,
  TrendingUp,
  BarChart2,
  PieChart,
  Eye,
  Activity,
  Zap,
} from 'react-native-feather';
import { DashboardConfig } from '../types';

interface DashboardTabsProps {
  dashboards: DashboardConfig[];
  activeDashboardId: string;
  onSwitchDashboard: (dashboardId: string) => void;
  onDeleteDashboard: (dashboardId: string) => void;
  onCreateDashboard: () => void;
}

const ICON_MAP = {
  home: Home,
  'trending-up': TrendingUp,
  'bar-chart-2': BarChart2,
  'pie-chart': PieChart,
  eye: Eye,
  activity: Activity,
  zap: Zap,
};

/**
 * DashboardTabs Component
 *
 * Handles the horizontal scrolling tab navigation for dashboards.
 * Extracted from DashboardManager.tsx for better separation of concerns.
 *
 * Features:
 * - Horizontal scrolling tab layout
 * - Active state management
 * - Delete functionality for non-default dashboards
 * - Add new dashboard button
 * - Proper accessibility and touch targets
 */
const DashboardTabs: React.FC<DashboardTabsProps> = ({
  dashboards,
  activeDashboardId,
  onSwitchDashboard,
  onDeleteDashboard,
  onCreateDashboard,
}) => {
  return (
    <View className="bg-white border-b border-gray-200">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="px-4 py-3"
        contentContainerStyle={{ paddingRight: 20 }}
      >
        {dashboards.map(dashboard => {
          const IconComponent = ICON_MAP[dashboard.icon as keyof typeof ICON_MAP] || Home;
          const isActive = dashboard.id === activeDashboardId;

          return (
            <View key={dashboard.id} className="mr-3">
              <TouchableOpacity
                onPress={() => onSwitchDashboard(dashboard.id)}
                className={`flex-row items-center px-4 py-2 rounded-full ${
                  isActive ? 'bg-primary' : 'bg-gray-100'
                }`}
                activeOpacity={0.7}
                accessibilityRole="tab"
                accessibilityState={{ selected: isActive }}
                accessibilityLabel={`${dashboard.name} dashboard${isActive ? ', selected' : ''}`}
              >
                <IconComponent width={16} height={16} stroke={isActive ? '#ffffff' : '#6B7280'} />
                <Text className={`ml-2 font-medium ${isActive ? 'text-white' : 'text-gray-700'}`}>
                  {dashboard.name}
                </Text>
                {!dashboard.isDefault && (
                  <TouchableOpacity
                    onPress={() => onDeleteDashboard(dashboard.id)}
                    className="ml-2 p-1"
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    accessibilityRole="button"
                    accessibilityLabel={`Delete ${dashboard.name} dashboard`}
                  >
                    <X width={14} height={14} stroke={isActive ? '#ffffff' : '#6B7280'} />
                  </TouchableOpacity>
                )}
              </TouchableOpacity>
            </View>
          );
        })}

        {/* Add Dashboard Button */}
        <TouchableOpacity
          onPress={onCreateDashboard}
          className="flex-row items-center px-4 py-2 rounded-full border-2 border-dashed border-gray-300 bg-white"
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Add new dashboard"
        >
          <Plus width={16} height={16} stroke="#6B7280" />
          <Text className="ml-2 font-medium text-gray-700">Add</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default DashboardTabs;
