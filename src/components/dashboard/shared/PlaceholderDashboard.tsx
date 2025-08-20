import React from 'react';
import { View, Text } from 'react-native';
import { DashboardConfig } from '../types';
import DashboardContainer from './DashboardContainer';
import ActionButton from './ActionButton';

interface PlaceholderDashboardProps {
  config: DashboardConfig;
  title: string;
  description: string;
  icon: React.ComponentType<{ width: number; height: number; stroke: string }>;
  primaryAction: {
    title: string;
    icon: React.ComponentType<{ width: number; height: number; stroke: string }>;
    color: string;
    onPress: () => void;
  };
  secondaryAction: {
    title: string;
    icon: React.ComponentType<{ width: number; height: number; stroke: string }>;
    onPress: () => void;
  };
}

const PlaceholderDashboard: React.FC<PlaceholderDashboardProps> = ({
  title,
  description,
  icon: IconComponent,
  primaryAction,
  secondaryAction,
}) => {
  return (
    <DashboardContainer>
      <View className="mb-6">
        <Text className="text-2xl font-bold text-gray-900 mb-1">{title}</Text>
        <Text className="text-gray-600">{description}</Text>
      </View>

      <View className="bg-gray-50 rounded-xl p-6 border border-gray-200 shadow-sm mb-6 items-center">
        <IconComponent width={64} height={64} stroke={primaryAction.color} />
        <Text className="text-lg font-semibold text-gray-900 mt-4 mb-2">{title} Dashboard</Text>
        <Text className="text-gray-600 text-center">
          Advanced {title.toLowerCase()} features coming soon
        </Text>
      </View>

      <View className="flex-row justify-between gap-4">
        <ActionButton
          title={primaryAction.title}
          icon={primaryAction.icon}
          color={primaryAction.color}
          onPress={primaryAction.onPress}
          variant="primary"
        />
        <ActionButton
          title={secondaryAction.title}
          icon={secondaryAction.icon}
          onPress={secondaryAction.onPress}
          variant="secondary"
        />
      </View>
    </DashboardContainer>
  );
};

export default PlaceholderDashboard;
