import React, { memo, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  ListRenderItem,
} from 'react-native';

interface ActivityItem {
  id: string;
  type: 'buy' | 'sell' | 'dividend';
  asset: string;
  amount: number;
  price?: number;
  time: string;
}

interface ActivityListProps {
  activities: ActivityItem[];
  showHeader?: boolean;
  headerTitle?: string;
}

// Memoized Activity Row Component
const ActivityRow = memo<{ activity: ActivityItem; index: number }>(({ activity, index }) => {
  const getActivityColor = (type: string) => {
    switch (type) {
      case 'buy': return 'bg-green-500';
      case 'sell': return 'bg-red-500';
      case 'dividend': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getActivityText = (activity: ActivityItem) => {
    switch (activity.type) {
      case 'buy':
        return `Bought ${activity.amount} ${activity.asset} at $${activity.price?.toLocaleString()}`;
      case 'sell':
        return `Sold ${activity.amount} ${activity.asset} at $${activity.price?.toLocaleString()}`;
      case 'dividend':
        return `Received $${activity.amount} dividend from ${activity.asset}`;
      default:
        return 'Unknown activity';
    }
  };

  return (
    <View className="flex-row items-center py-3 border-b border-gray-100 last:border-b-0">
      <View className={`w-3 h-3 rounded-full mr-3 ${getActivityColor(activity.type)}`} />
      <View className="flex-1">
        <Text className="text-gray-900 font-medium text-sm">{getActivityText(activity)}</Text>
        <Text className="text-gray-500 text-xs">{activity.time}</Text>
      </View>
    </View>
  );
});

ActivityRow.displayName = 'ActivityRow';

const OptimizedActivityList: React.FC<ActivityListProps> = ({ 
  activities, 
  showHeader = true, 
  headerTitle = "Recent Activity" 
}) => {
  // Optimized render function
  const renderActivity: ListRenderItem<ActivityItem> = useCallback(({ item, index }) => (
    <ActivityRow activity={item} index={index} />
  ), []);

  // Key extractor
  const keyExtractor = useCallback((item: ActivityItem) => item.id, []);

  // getItemLayout for consistent heights
  const getItemLayout = useCallback((data: ArrayLike<ActivityItem> | null | undefined, index: number) => ({
    length: 56, // Height of each activity row (py-3 = 12px + 12px + content ~32px)
    offset: 56 * index,
    index,
  }), []);

  // Performance optimizations
  const optimizedProps = {
    data: activities,
    renderItem: renderActivity,
    keyExtractor,
    getItemLayout,
    // Performance settings
    removeClippedSubviews: true,
    maxToRenderPerBatch: 8,
    updateCellsBatchingPeriod: 100,
    initialNumToRender: 6,
    windowSize: 12,
    nestedScrollEnabled: false,
    scrollEventThrottle: 16,
  };

  if (activities.length === 0) {
    return (
      <View className="bg-gray-50 rounded-xl border border-gray-200 shadow-sm p-8 items-center">
        <Text className="text-gray-500 text-sm">No recent activity</Text>
      </View>
    );
  }

  return (
    <View className="mb-6">
      {showHeader && (
        <Text className="text-lg font-semibold text-gray-900 mb-4">{headerTitle}</Text>
      )}
      
      <View className="bg-gray-50 rounded-xl border border-gray-200 shadow-sm">
        <FlatList
          {...optimizedProps}
          style={{ paddingHorizontal: 16, paddingVertical: 8 }}
          scrollEnabled={false}
          contentContainerStyle={{ flexGrow: 1 }}
        />
      </View>
    </View>
  );
};

export default memo(OptimizedActivityList);
export type { ActivityItem };
