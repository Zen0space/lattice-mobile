import React from 'react';
import { View, Text, Dimensions } from 'react-native';
import { ArrowUp, ArrowDown } from 'react-native-feather';

const { width } = Dimensions.get('window');

export interface StatCardProps {
  title: string;
  value: string;
  change: string;
  changePercent: number;
  icon: React.ComponentType<any>;
  variant?: 'default' | 'compact' | 'large';
  colorScheme?: 'default' | 'primary' | 'secondary';
  showTrend?: boolean;
  customWidth?: number;
}

export interface StatCardData {
  title: string;
  value: string | number;
  change: string | number;
  changePercent: number;
  icon: React.ComponentType<any>;
}

/**
 * Reusable StatCard component for displaying statistics with consistent styling
 * Eliminates duplicate code across dashboard components
 *
 * Features:
 * - Consistent styling and behavior
 * - Icon and color theming support
 * - Different size variants
 * - Loading and error states
 * - Responsive design
 */
const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  changePercent,
  icon: IconComponent,
  variant = 'default',
  colorScheme = 'default',
  showTrend = true,
  customWidth,
}) => {
  const isPositive = changePercent >= 0;

  // Calculate card width based on variant
  const getCardWidth = () => {
    if (customWidth) return customWidth;

    switch (variant) {
      case 'compact':
        return (width - 48) / 3 - 8;
      case 'large':
        return width - 48;
      default:
        return (width - 48) / 2 - 6;
    }
  };

  // Get color scheme
  const getColorScheme = () => {
    switch (colorScheme) {
      case 'primary':
        return {
          background: 'bg-primary-50',
          border: 'border-primary-200',
          iconBg: 'bg-primary',
          iconColor: '#ffffff',
        };
      case 'secondary':
        return {
          background: 'bg-secondary-50',
          border: 'border-secondary-200',
          iconBg: 'bg-secondary',
          iconColor: '#ffffff',
        };
      default:
        return {
          background: 'bg-gray-50',
          border: 'border-gray-200',
          iconBg: 'bg-primary',
          iconColor: '#ffffff',
        };
    }
  };

  // Get variant-specific styles
  const getVariantStyles = () => {
    switch (variant) {
      case 'compact':
        return {
          padding: 'p-3',
          titleSize: 'text-lg',
          valueSize: 'text-xl',
          iconSize: { width: 16, height: 16 },
          iconContainer: 'w-8 h-8',
        };
      case 'large':
        return {
          padding: 'p-6',
          titleSize: 'text-3xl',
          valueSize: 'text-4xl',
          iconSize: { width: 28, height: 28 },
          iconContainer: 'w-14 h-14',
        };
      default:
        return {
          padding: 'p-4',
          titleSize: 'text-2xl',
          valueSize: 'text-2xl',
          iconSize: { width: 20, height: 20 },
          iconContainer: 'w-10 h-10',
        };
    }
  };

  const colors = getColorScheme();
  const styles = getVariantStyles();

  return (
    <View
      className={`${colors.background} rounded-xl ${styles.padding} ${colors.border} border shadow-sm`}
      style={{ width: getCardWidth() }}
    >
      <View className="flex-row items-center justify-between mb-3">
        <View
          className={`${styles.iconContainer} ${colors.iconBg} rounded-lg items-center justify-center`}
        >
          <IconComponent
            width={styles.iconSize.width}
            height={styles.iconSize.height}
            stroke={colors.iconColor}
          />
        </View>
        {showTrend && (
          <View
            className={`flex-row items-center px-2 py-1 rounded-full ${
              isPositive ? 'bg-green-100' : 'bg-red-100'
            }`}
          >
            {isPositive ? (
              <ArrowUp width={12} height={12} stroke="#10b981" />
            ) : (
              <ArrowDown width={12} height={12} stroke="#ef4444" />
            )}
            <Text
              className={`text-xs font-medium ml-1 ${
                isPositive ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {Math.abs(changePercent)}%
            </Text>
          </View>
        )}
      </View>

      <Text className={`${styles.titleSize} font-bold text-gray-900 mb-1`}>{value}</Text>
      <Text className="text-gray-600 text-sm mb-1">{title}</Text>
      <Text className={`text-sm font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
        {change}
      </Text>
    </View>
  );
};

// Loading state component
export const StatCardSkeleton: React.FC<{ variant?: 'default' | 'compact' | 'large' }> = ({
  variant = 'default',
}) => {
  const getCardWidth = () => {
    switch (variant) {
      case 'compact':
        return (width - 48) / 3 - 8;
      case 'large':
        return width - 48;
      default:
        return (width - 48) / 2 - 6;
    }
  };

  const styles = variant === 'compact' ? 'p-3' : variant === 'large' ? 'p-6' : 'p-4';

  return (
    <View
      className={`bg-gray-50 rounded-xl ${styles} border border-gray-200 shadow-sm`}
      style={{ width: getCardWidth() }}
    >
      <View className="flex-row items-center justify-between mb-3">
        <View className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse" />
        <View className="w-12 h-6 bg-gray-200 rounded-full animate-pulse" />
      </View>
      <View className="w-24 h-8 bg-gray-200 rounded animate-pulse mb-1" />
      <View className="w-16 h-4 bg-gray-200 rounded animate-pulse mb-1" />
      <View className="w-20 h-4 bg-gray-200 rounded animate-pulse" />
    </View>
  );
};

// Error state component
export const StatCardError: React.FC<{
  title: string;
  onRetry?: () => void;
  variant?: 'default' | 'compact' | 'large';
}> = ({ title, onRetry, variant = 'default' }) => {
  const getCardWidth = () => {
    switch (variant) {
      case 'compact':
        return (width - 48) / 3 - 8;
      case 'large':
        return width - 48;
      default:
        return (width - 48) / 2 - 6;
    }
  };

  const styles = variant === 'compact' ? 'p-3' : variant === 'large' ? 'p-6' : 'p-4';

  return (
    <View
      className={`bg-red-50 rounded-xl ${styles} border border-red-200 shadow-sm`}
      style={{ width: getCardWidth() }}
    >
      <View className="items-center justify-center h-full">
        <Text className="text-red-600 text-sm font-medium mb-2">Error loading {title}</Text>
        {onRetry && (
          <Text className="text-red-500 text-xs underline" onPress={onRetry}>
            Tap to retry
          </Text>
        )}
      </View>
    </View>
  );
};

export default StatCard;
