import React from 'react';
import { View, Text, FlatList, ScrollView } from 'react-native';
import { AlertTriangle, Loader } from 'react-native-feather';
import AssetCard, { AssetCardSkeleton } from './AssetCard';
import { AssetData } from '../types';

export interface DataRendererProps<T = any> {
  data: T[];
  loading?: boolean;
  error?: string | null;
  emptyMessage?: string;
  renderItem: (item: T, index: number) => React.ReactElement;
  keyExtractor?: (item: T, index: number) => string;
  variant?: 'list' | 'grid' | 'scroll';
  numColumns?: number;
  showHeader?: boolean;
  headerTitle?: string;
  onRetry?: () => void;
  skeletonComponent?: React.ComponentType<any>;
  skeletonCount?: number;
  nestedInScrollView?: boolean; // NEW: Flag to avoid FlatList nesting
}

/**
 * Unified data rendering component
 * Replaces hardcoded mock data and provides consistent data visualization
 *
 * Features:
 * - Data validation and formatting
 * - Error boundaries for data issues
 * - Loading states with skeletons
 * - Empty states with helpful messages
 * - Multiple visualization modes (list, grid, scroll)
 * - Retry functionality for failed data loads
 */
const DataRenderer = <T extends any>({
  data,
  loading = false,
  error = null,
  emptyMessage = 'No data available',
  renderItem,
  keyExtractor,
  variant = 'list',
  numColumns = 1,
  showHeader = false,
  headerTitle,
  onRetry,
  skeletonComponent: SkeletonComponent,
  skeletonCount = 5,
  nestedInScrollView = false,
}: DataRendererProps<T>) => {
  // Loading state
  if (loading) {
    return (
      <View className="flex-1">
        {showHeader && headerTitle && (
          <Text className="text-lg font-semibold text-gray-900 mb-4">{headerTitle}</Text>
        )}
        <View className="flex-1">
          {SkeletonComponent ? (
            Array.from({ length: skeletonCount }).map((_, index) => (
              <SkeletonComponent key={index} />
            ))
          ) : (
            <View className="space-y-4">
              {Array.from({ length: skeletonCount }).map((_, index) => (
                <View key={index} className="h-16 bg-gray-200 rounded-lg animate-pulse" />
              ))}
            </View>
          )}
        </View>
      </View>
    );
  }

  // Error state
  if (error) {
    return (
      <View className="flex-1 items-center justify-center p-8">
        <AlertTriangle width={48} height={48} stroke="#ef4444" />
        <Text className="text-lg font-semibold text-gray-900 mt-4 mb-2 text-center">
          Something went wrong
        </Text>
        <Text className="text-gray-600 text-center mb-4">{error}</Text>
        {onRetry && (
          <Text className="text-primary font-medium underline" onPress={onRetry}>
            Tap to retry
          </Text>
        )}
      </View>
    );
  }

  // Empty state
  if (!data || data.length === 0) {
    return (
      <View className="flex-1 items-center justify-center p-8">
        <Text className="text-lg font-semibold text-gray-900 mb-2 text-center">No data found</Text>
        <Text className="text-gray-600 text-center">{emptyMessage}</Text>
        {onRetry && (
          <Text className="text-primary font-medium underline mt-4" onPress={onRetry}>
            Refresh
          </Text>
        )}
      </View>
    );
  }

  // Render header if needed
  const renderHeader = () => {
    if (!showHeader || !headerTitle) return null;

    return <Text className="text-lg font-semibold text-gray-900 mb-4">{headerTitle}</Text>;
  };

  // Default key extractor
  const defaultKeyExtractor = (item: T, index: number): string => {
    if (typeof item === 'object' && item !== null) {
      // Try common id fields
      if ('id' in item) return String(item.id);
      if ('key' in item) return String(item.key);
      if ('symbol' in item) return String(item.symbol);
    }
    return String(index);
  };

  // Render based on variant and nesting context
  // When nested in ScrollView, avoid FlatList to prevent VirtualizedList nesting error
  if (nestedInScrollView) {
    return (
      <View className="flex-1">
        {renderHeader()}
        <View style={{ paddingBottom: 20 }}>
          {data.map((item, index) => (
            <View key={keyExtractor ? keyExtractor(item, index) : defaultKeyExtractor(item, index)}>
              {renderItem(item, index)}
            </View>
          ))}
        </View>
      </View>
    );
  }

  // Normal rendering with FlatList when not nested in ScrollView
  switch (variant) {
    case 'grid':
      return (
        <View className="flex-1">
          {renderHeader()}
          <FlatList
            data={data}
            renderItem={({ item, index }) => (
              <React.Fragment
                key={keyExtractor ? keyExtractor(item, index) : defaultKeyExtractor(item, index)}
              >
                {renderItem(item, index)}
              </React.Fragment>
            )}
            keyExtractor={keyExtractor || defaultKeyExtractor}
            numColumns={numColumns}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
          />
        </View>
      );

    case 'scroll':
      return (
        <View className="flex-1">
          {renderHeader()}
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
          >
            {data.map((item, index) => (
              <View
                key={keyExtractor ? keyExtractor(item, index) : defaultKeyExtractor(item, index)}
              >
                {renderItem(item, index)}
              </View>
            ))}
          </ScrollView>
        </View>
      );

    default: // list
      return (
        <View className="flex-1">
          {renderHeader()}
          <FlatList
            data={data}
            renderItem={({ item, index }) => (
              <React.Fragment
                key={keyExtractor ? keyExtractor(item, index) : defaultKeyExtractor(item, index)}
              >
                {renderItem(item, index)}
              </React.Fragment>
            )}
            keyExtractor={keyExtractor || defaultKeyExtractor}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
          />
        </View>
      );
  }
};

// Specialized data renderers for common use cases
export const AssetDataRenderer: React.FC<{
  assets: AssetData[];
  loading?: boolean;
  error?: string | null;
  variant?: 'row' | 'card' | 'compact';
  onAssetPress?: (asset: AssetData) => void;
  onRetry?: () => void;
  nestedInScrollView?: boolean;
}> = ({
  assets,
  loading,
  error,
  variant = 'row',
  onAssetPress,
  onRetry,
  nestedInScrollView = false,
}) => (
  <DataRenderer
    data={assets}
    loading={loading}
    error={error}
    emptyMessage="No assets in your portfolio yet"
    renderItem={(asset: AssetData) => (
      <AssetCard asset={asset} variant={variant} onPress={onAssetPress} />
    )}
    keyExtractor={(asset: AssetData) => asset.symbol}
    skeletonComponent={() => <AssetCardSkeleton variant={variant} />}
    onRetry={onRetry}
    nestedInScrollView={nestedInScrollView}
  />
);

export const ActivityDataRenderer: React.FC<{
  activities: any[];
  loading?: boolean;
  error?: string | null;
  onActivityPress?: (activity: any) => void;
  onRetry?: () => void;
  nestedInScrollView?: boolean;
}> = ({ activities, loading, error, onActivityPress, onRetry, nestedInScrollView = false }) => (
  <DataRenderer
    data={activities}
    loading={loading}
    error={error}
    emptyMessage="No recent activity"
    renderItem={(activity, index) => (
      <View
        key={index}
        className="flex-row items-center py-3 border-b border-gray-100 last:border-b-0"
      >
        <View className="w-10 h-10 bg-primary-100 rounded-full items-center justify-center mr-3">
          <Text className="text-primary font-bold text-sm">
            {activity.type?.charAt(0)?.toUpperCase() || 'A'}
          </Text>
        </View>
        <View className="flex-1">
          <Text className="text-gray-900 font-medium text-sm">
            {activity.description || 'Activity'}
          </Text>
          <Text className="text-gray-500 text-xs">{activity.time || 'Recently'}</Text>
        </View>
        <Text
          className={`font-semibold text-sm ${
            activity.amount > 0 ? 'text-green-600' : 'text-red-600'
          }`}
        >
          {activity.amount > 0 ? '+' : ''}${Math.abs(activity.amount || 0).toFixed(2)}
        </Text>
      </View>
    )}
    onRetry={onRetry}
    nestedInScrollView={nestedInScrollView}
  />
);

// Generic list renderer with validation
export const ValidatedDataRenderer = <T extends any>({
  data,
  validator,
  ...props
}: DataRendererProps<T> & {
  validator?: (item: T) => boolean;
}) => {
  // Validate data if validator is provided
  const validatedData = validator ? data.filter(validator) : data;

  // Show warning if some items were filtered out
  const filteredCount = data.length - validatedData.length;

  return (
    <View className="flex-1">
      {filteredCount > 0 && (
        <View className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
          <View className="flex-row items-center">
            <AlertTriangle width={16} height={16} stroke="#f59e0b" />
            <Text className="text-yellow-800 text-sm font-medium ml-2">
              {filteredCount} invalid items were filtered out
            </Text>
          </View>
        </View>
      )}

      <DataRenderer {...props} data={validatedData} />
    </View>
  );
};

export default DataRenderer;
