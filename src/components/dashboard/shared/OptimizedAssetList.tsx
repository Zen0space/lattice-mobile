import React, { memo, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  ListRenderItem,
  Dimensions,
} from 'react-native';
import { AssetData } from '../types';

const { width } = Dimensions.get('window');

interface AssetListProps {
  assets: AssetData[];
  showHeader?: boolean;
  headerTitle?: string;
  onViewAll?: () => void;
}

// Memoized Asset Row Component for better performance
const AssetRow = memo<{ asset: AssetData; index: number }>(({ asset, index }) => {
  const isPositive = asset.changePercent >= 0;
  
  return (
    <View className="flex-row items-center py-4 border-b border-gray-100 last:border-b-0">
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
});

AssetRow.displayName = 'AssetRow';

const OptimizedAssetList: React.FC<AssetListProps> = ({ 
  assets, 
  showHeader = true, 
  headerTitle = "Top Holdings",
  onViewAll 
}) => {
  // Optimized render function with useCallback
  const renderAsset: ListRenderItem<AssetData> = useCallback(({ item, index }) => (
    <AssetRow asset={item} index={index} />
  ), []);

  // Key extractor for better performance
  const keyExtractor = useCallback((item: AssetData, index: number) => 
    `${item.symbol}-${index}`, []);

  // getItemLayout for consistent item heights (performance boost)
  const getItemLayout = useCallback((data: ArrayLike<AssetData> | null | undefined, index: number) => ({
    length: 72, // Height of each asset row (py-4 = 16px top + 16px bottom + content ~40px)
    offset: 72 * index,
    index,
  }), []);

  // Performance optimizations
  const optimizedProps = {
    data: assets,
    renderItem: renderAsset,
    keyExtractor,
    getItemLayout,
    // Performance settings based on 2025 best practices
    removeClippedSubviews: true, // Unload off-screen views
    maxToRenderPerBatch: 5, // Render 5 items per batch
    updateCellsBatchingPeriod: 100, // Update every 100ms
    initialNumToRender: 4, // Render 4 items initially
    windowSize: 10, // Keep 10 items in memory
    // Disable nested scrolling for better performance
    nestedScrollEnabled: false,
    // Optimize for fixed height items
    scrollEventThrottle: 16, // 60fps scrolling
  };

  if (assets.length === 0) {
    return (
      <View className="bg-gray-50 rounded-xl border border-gray-200 shadow-sm p-8 items-center">
        <Text className="text-gray-500 text-sm">No assets to display</Text>
      </View>
    );
  }

  return (
    <View className="mb-6">
      {showHeader && (
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-lg font-semibold text-gray-900">{headerTitle}</Text>
          {onViewAll && (
            <Text 
              className="text-primary font-medium"
              onPress={onViewAll}
            >
              View All
            </Text>
          )}
        </View>
      )}
      
      <View className="bg-gray-50 rounded-xl border border-gray-200 shadow-sm">
        <FlatList
          {...optimizedProps}
          style={{ paddingHorizontal: 16 }}
          // Prevent FlatList from taking full height
          scrollEnabled={false}
          contentContainerStyle={{ flexGrow: 1 }}
        />
      </View>
    </View>
  );
};

export default memo(OptimizedAssetList);
