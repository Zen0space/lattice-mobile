import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ChevronRight, Plus, MoreHorizontal } from 'react-native-feather';

export interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  variant?: 'default' | 'large' | 'compact';
  showAction?: boolean;
  actionText?: string;
  actionIcon?: React.ComponentType<any>;
  onActionPress?: () => void;
  showMoreMenu?: boolean;
  onMorePress?: () => void;
  customAction?: React.ReactNode;
  centerAlign?: boolean;
}

/**
 * Standardized section headers component
 * Eliminates duplicate header patterns across dashboard components
 *
 * Features:
 * - Consistent spacing and typography
 * - Action button integration
 * - Multiple header variants (default, large, compact)
 * - Accessibility features
 * - Customizable actions and icons
 */
const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  subtitle,
  variant = 'default',
  showAction = false,
  actionText = 'View All',
  actionIcon: ActionIcon = ChevronRight,
  onActionPress,
  showMoreMenu = false,
  onMorePress,
  customAction,
  centerAlign = false,
}) => {
  // Get variant-specific styles
  const getVariantStyles = () => {
    switch (variant) {
      case 'large':
        return {
          titleSize: 'text-3xl',
          subtitleSize: 'text-lg',
          spacing: 'mb-8',
          titleSpacing: 'mb-2',
        };
      case 'compact':
        return {
          titleSize: 'text-lg',
          subtitleSize: 'text-sm',
          spacing: 'mb-4',
          titleSpacing: 'mb-1',
        };
      default:
        return {
          titleSize: 'text-2xl',
          subtitleSize: 'text-base',
          spacing: 'mb-6',
          titleSpacing: 'mb-1',
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <View className={`${styles.spacing} ${centerAlign ? 'items-center' : ''}`}>
      <View className={`flex-row items-center justify-between ${centerAlign ? 'w-full' : ''}`}>
        <View className={`flex-1 ${centerAlign ? 'items-center' : ''}`}>
          <Text
            className={`${styles.titleSize} font-bold text-gray-900 ${styles.titleSpacing} ${
              centerAlign ? 'text-center' : ''
            }`}
          >
            {title}
          </Text>
          {subtitle && (
            <Text
              className={`${styles.subtitleSize} text-gray-600 ${centerAlign ? 'text-center' : ''}`}
            >
              {subtitle}
            </Text>
          )}
        </View>

        {/* Action buttons container */}
        <View className="flex-row items-center space-x-2">
          {/* Custom action */}
          {customAction && customAction}

          {/* Default action button */}
          {showAction && onActionPress && (
            <TouchableOpacity
              className="flex-row items-center px-3 py-1 rounded-lg bg-primary-50 border border-primary-200"
              onPress={onActionPress}
              accessibilityRole="button"
              accessibilityLabel={actionText}
            >
              <Text className="text-primary font-medium text-sm mr-1">{actionText}</Text>
              <ActionIcon width={16} height={16} stroke="#3b82f6" />
            </TouchableOpacity>
          )}

          {/* More menu button */}
          {showMoreMenu && onMorePress && (
            <TouchableOpacity
              className="p-2 rounded-lg bg-gray-50 border border-gray-200"
              onPress={onMorePress}
              accessibilityRole="button"
              accessibilityLabel="More options"
            >
              <MoreHorizontal width={16} height={16} stroke="#6b7280" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

// Specialized header variants for common use cases
export const WelcomeHeader: React.FC<{
  userName?: string;
  subtitle?: string;
}> = ({ userName, subtitle }) => (
  <SectionHeader
    title={userName ? `Welcome back, ${userName}!` : 'Welcome back!'}
    subtitle={subtitle || "Here's your portfolio summary."}
    variant="large"
  />
);

export const PortfolioHeader: React.FC<{
  onAddAsset?: () => void;
  onSettings?: () => void;
}> = ({ onAddAsset, onSettings }) => (
  <SectionHeader
    title="Portfolio Overview"
    subtitle="Track your investments and performance"
    showAction={!!onAddAsset}
    actionText="Add Asset"
    actionIcon={Plus}
    onActionPress={onAddAsset}
    showMoreMenu={!!onSettings}
    onMorePress={onSettings}
  />
);

export const AssetsHeader: React.FC<{
  onViewAll?: () => void;
  totalAssets?: number;
}> = ({ onViewAll, totalAssets }) => (
  <SectionHeader
    title="Top Assets"
    subtitle={totalAssets ? `${totalAssets} assets in your portfolio` : 'Your investment holdings'}
    showAction={!!onViewAll}
    actionText="View All"
    onActionPress={onViewAll}
  />
);

export const ActivityHeader: React.FC<{
  onViewHistory?: () => void;
}> = ({ onViewHistory }) => (
  <SectionHeader
    title="Recent Activity"
    subtitle="Latest transactions and updates"
    showAction={!!onViewHistory}
    actionText="View History"
    onActionPress={onViewHistory}
  />
);

export const AnalyticsHeader: React.FC<{
  period?: string;
  onPeriodChange?: () => void;
}> = ({ period = 'Last 30 days', onPeriodChange }) => (
  <SectionHeader
    title="Analytics"
    subtitle="Performance insights and trends"
    customAction={
      onPeriodChange ? (
        <TouchableOpacity
          className="px-3 py-1 rounded-lg bg-gray-50 border border-gray-200"
          onPress={onPeriodChange}
        >
          <Text className="text-gray-700 text-sm font-medium">{period}</Text>
        </TouchableOpacity>
      ) : undefined
    }
  />
);

// Loading skeleton for SectionHeader
export const SectionHeaderSkeleton: React.FC<{
  variant?: 'default' | 'large' | 'compact';
  showAction?: boolean;
}> = ({ variant = 'default', showAction = false }) => {
  const styles = variant === 'large' ? 'mb-8' : variant === 'compact' ? 'mb-4' : 'mb-6';
  const titleWidth = variant === 'large' ? 'w-48' : variant === 'compact' ? 'w-32' : 'w-40';
  const titleHeight = variant === 'large' ? 'h-8' : variant === 'compact' ? 'h-5' : 'h-6';

  return (
    <View className={styles}>
      <View className="flex-row items-center justify-between">
        <View className="flex-1">
          <View className={`${titleWidth} ${titleHeight} bg-gray-200 rounded animate-pulse mb-1`} />
          <View className="w-56 h-4 bg-gray-200 rounded animate-pulse" />
        </View>

        {showAction && <View className="w-20 h-8 bg-gray-200 rounded-lg animate-pulse" />}
      </View>
    </View>
  );
};

export default SectionHeader;
