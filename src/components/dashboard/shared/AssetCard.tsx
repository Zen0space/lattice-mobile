import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { TrendingUp, TrendingDown } from 'react-native-feather';
import { AssetData } from '../types';

export interface AssetCardProps {
  asset: AssetData;
  variant?: 'row' | 'card' | 'compact';
  onPress?: (asset: AssetData) => void;
  showChart?: boolean;
  showVolume?: boolean;
  customIcon?: React.ReactNode;
}

/**
 * Unified asset display component
 * Replaces duplicate code in 3+ components
 * 
 * Features:
 * - Props-driven customization
 * - Multiple display variants (row, card, compact)
 * - Consistent styling and behavior
 * - Optional chart and volume display
 * - Custom icon support
 * - Touch interaction support
 */
const AssetCard: React.FC<AssetCardProps> = ({
  asset,
  variant = 'row',
  onPress,
  showChart = false,
  showVolume = false,
  customIcon,
}) => {
  const isPositive = asset.changePercent >= 0;
  const TrendIcon = isPositive ? TrendingUp : TrendingDown;

  // Format price with proper currency
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
  };

  // Format change percentage
  const formatChangePercent = (percent: number) => {
    const sign = percent >= 0 ? '+' : '';
    return `${sign}${percent.toFixed(2)}%`;
  };

  // Format volume - handles both string and number inputs
  const formatVolume = (volume?: string | number) => {
    if (!volume) return 'N/A';
    
    // Convert string to number if needed
    const numVolume = typeof volume === 'string' ? parseFloat(volume) : volume;
    
    // Handle invalid numbers
    if (isNaN(numVolume)) return 'N/A';
    
    if (numVolume >= 1e9) return `${(numVolume / 1e9).toFixed(1)}B`;
    if (numVolume >= 1e6) return `${(numVolume / 1e6).toFixed(1)}M`;
    if (numVolume >= 1e3) return `${(numVolume / 1e3).toFixed(1)}K`;
    return numVolume.toString();
  };

  // Render asset icon
  const renderAssetIcon = () => {
    if (customIcon) {
      return customIcon;
    }

    return (
      <View className="w-12 h-12 bg-gray-100 rounded-full items-center justify-center mr-4">
        <Text className="text-gray-700 font-bold text-sm">
          {asset.symbol}
        </Text>
      </View>
    );
  };

  // Row variant (list item style)
  const renderRowVariant = () => (
    <TouchableOpacity
      className="flex-row items-center py-4 border-b border-gray-100 last:border-b-0"
      onPress={() => onPress?.(asset)}
      disabled={!onPress}
    >
      {renderAssetIcon()}
      
      <View className="flex-1">
        <View className="flex-row items-center justify-between mb-1">
          <View>
            <Text className="text-gray-900 font-semibold text-base">
              {asset.name}
            </Text>
            <Text className="text-gray-500 text-sm">
              {asset.symbol}
            </Text>
          </View>
          
          <View className="items-end">
            <Text className="text-gray-900 font-semibold text-base">
              {formatPrice(asset.price)}
            </Text>
            <View className="flex-row items-center">
              <TrendIcon 
                width={14} 
                height={14} 
                stroke={isPositive ? '#10b981' : '#ef4444'} 
              />
              <Text className={`text-sm font-medium ml-1 ${
                isPositive ? 'text-green-600' : 'text-red-600'
              }`}>
                {formatChangePercent(asset.changePercent)}
              </Text>
            </View>
          </View>
        </View>
        
        {showVolume && (
          <Text className="text-gray-500 text-xs">
            Vol: {formatVolume(asset.volume)}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  // Card variant (standalone card style)
  const renderCardVariant = () => (
    <TouchableOpacity
      className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm mb-3"
      onPress={() => onPress?.(asset)}
      disabled={!onPress}
    >
      <View className="flex-row items-center justify-between mb-3">
        {renderAssetIcon()}
        
        <View className={`flex-row items-center px-2 py-1 rounded-full ${
          isPositive ? 'bg-green-100' : 'bg-red-100'
        }`}>
          <TrendIcon 
            width={12} 
            height={12} 
            stroke={isPositive ? '#10b981' : '#ef4444'} 
          />
          <Text className={`text-xs font-medium ml-1 ${
            isPositive ? 'text-green-600' : 'text-red-600'
          }`}>
            {formatChangePercent(asset.changePercent)}
          </Text>
        </View>
      </View>
      
      <View className="mb-2">
        <Text className="text-gray-900 font-bold text-lg">
          {asset.name}
        </Text>
        <Text className="text-gray-500 text-sm">
          {asset.symbol}
        </Text>
      </View>
      
      <Text className="text-gray-900 font-semibold text-xl mb-1">
        {formatPrice(asset.price)}
      </Text>
      
      <Text className={`text-sm font-medium ${
        isPositive ? 'text-green-600' : 'text-red-600'
      }`}>
        {asset.change > 0 ? '+' : ''}{formatPrice(asset.change)}
      </Text>
      
      {showVolume && (
        <Text className="text-gray-500 text-xs mt-2">
          Volume: {formatVolume(asset.volume)}
        </Text>
      )}
    </TouchableOpacity>
  );

  // Compact variant (minimal display)
  const renderCompactVariant = () => (
    <TouchableOpacity
      className="flex-row items-center justify-between py-2"
      onPress={() => onPress?.(asset)}
      disabled={!onPress}
    >
      <View className="flex-row items-center flex-1">
        <View className="w-8 h-8 bg-gray-100 rounded-full items-center justify-center mr-3">
          <Text className="text-gray-700 font-bold text-xs">
            {asset.symbol}
          </Text>
        </View>
        <Text className="text-gray-900 font-medium text-sm flex-1">
          {asset.symbol}
        </Text>
      </View>
      
      <View className="items-end">
        <Text className="text-gray-900 font-medium text-sm">
          {formatPrice(asset.price)}
        </Text>
        <Text className={`text-xs ${
          isPositive ? 'text-green-600' : 'text-red-600'
        }`}>
          {formatChangePercent(asset.changePercent)}
        </Text>
      </View>
    </TouchableOpacity>
  );

  // Render based on variant
  switch (variant) {
    case 'card':
      return renderCardVariant();
    case 'compact':
      return renderCompactVariant();
    default:
      return renderRowVariant();
  }
};

// Loading skeleton for AssetCard
export const AssetCardSkeleton: React.FC<{ variant?: 'row' | 'card' | 'compact' }> = ({ 
  variant = 'row' 
}) => {
  switch (variant) {
    case 'card':
      return (
        <View className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm mb-3">
          <View className="flex-row items-center justify-between mb-3">
            <View className="w-12 h-12 bg-gray-200 rounded-full animate-pulse" />
            <View className="w-16 h-6 bg-gray-200 rounded-full animate-pulse" />
          </View>
          <View className="w-32 h-5 bg-gray-200 rounded animate-pulse mb-1" />
          <View className="w-16 h-4 bg-gray-200 rounded animate-pulse mb-2" />
          <View className="w-24 h-6 bg-gray-200 rounded animate-pulse mb-1" />
          <View className="w-20 h-4 bg-gray-200 rounded animate-pulse" />
        </View>
      );
    
    case 'compact':
      return (
        <View className="flex-row items-center justify-between py-2">
          <View className="flex-row items-center flex-1">
            <View className="w-8 h-8 bg-gray-200 rounded-full animate-pulse mr-3" />
            <View className="w-16 h-4 bg-gray-200 rounded animate-pulse" />
          </View>
          <View className="items-end">
            <View className="w-20 h-4 bg-gray-200 rounded animate-pulse mb-1" />
            <View className="w-12 h-3 bg-gray-200 rounded animate-pulse" />
          </View>
        </View>
      );
    
    default:
      return (
        <View className="flex-row items-center py-4 border-b border-gray-100">
          <View className="w-12 h-12 bg-gray-200 rounded-full animate-pulse mr-4" />
          <View className="flex-1">
            <View className="flex-row items-center justify-between mb-1">
              <View>
                <View className="w-24 h-4 bg-gray-200 rounded animate-pulse mb-1" />
                <View className="w-16 h-3 bg-gray-200 rounded animate-pulse" />
              </View>
              <View className="items-end">
                <View className="w-20 h-4 bg-gray-200 rounded animate-pulse mb-1" />
                <View className="w-16 h-3 bg-gray-200 rounded animate-pulse" />
              </View>
            </View>
          </View>
        </View>
      );
  }
};

export default AssetCard;
