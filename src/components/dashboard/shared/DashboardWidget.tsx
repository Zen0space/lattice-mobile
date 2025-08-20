import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  Modal,
  Animated,
} from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import { MoreVertical, TrendingUp, TrendingDown, Trash2, X } from 'react-native-feather';
import { Widget, ChartConfig, CryptoWidgetConfig } from '../../widget/types';
import { getChartWidth, SCREEN_WIDTH } from '../../../utils/platform/responsive';
import CryptoWidget from '../../widget/CryptoWidget';

const { width: screenWidth } = Dimensions.get('window');

interface DashboardWidgetProps {
  widget: Widget;
  onPress?: () => void;
  onDelete?: (widgetId: string) => void;
  compact?: boolean;
}

const DashboardWidget: React.FC<DashboardWidgetProps> = ({
  widget,
  onPress,
  onDelete,
  compact = false,
}) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (showDeleteModal) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }).start();
    }
  }, [showDeleteModal, fadeAnim]);

  // If this is a crypto widget, render CryptoWidget instead
  if (widget.type !== 'chart') {
    return (
      <CryptoWidget
        widget={widget}
        onDelete={onDelete || (() => {})} // Pass through the delete function
        compact={compact}
        showControls={true} // Show controls including 3-dot menu
      />
    );
  }

  const config = widget.config as ChartConfig;
  // Responsive width using utility function
  const chartWidth = getChartWidth(compact ? 'compact' : 'full'); // Automatically calculates optimal width
  const chartHeight = compact ? 160 : 220; // Taller charts for better visibility

  // Get latest and previous values for trend calculation
  const latestValue = config.data[config.data.length - 1]?.value || 0;
  const previousValue = config.data[config.data.length - 2]?.value || latestValue;
  const change = latestValue - previousValue;
  const changePercent = previousValue !== 0 ? (change / previousValue) * 100 : 0;
  const isPositive = change >= 0;

  // Enhanced colors based on trend
  const colors = {
    primary: isPositive ? '#10b981' : '#ef4444',
    light: isPositive ? '#d1fae5' : '#fee2e2',
    dark: isPositive ? '#065f46' : '#991b1b',
    gradient: {
      start: isPositive ? '#10b981' : '#ef4444',
      end: isPositive ? '#059669' : '#dc2626',
    }
  };

  // Memoize chart rendering to prevent unnecessary re-renders during drag operations
  const renderChart = useMemo(() => {
    if (!config.data || config.data.length === 0) {
      return (
        <View className="flex-1 items-center justify-center py-8">
          <Text className="text-gray-500">No data available</Text>
        </View>
      );
    }

    const chartProps = {
      data: config.data.slice(-15), // Show more points for better trend visibility
      width: chartWidth,
      height: chartHeight,
      color: colors.primary,
      thickness: compact ? 2.5 : 3, // Thicker lines for better visibility
      curved: config.stepChart === true ? false : true, // Step charts must not be curved
      areaChart: config.areaChart === true, // Respect template configuration
      stepChart: config.stepChart || false,
      showDataPoints: false, // Keep clean in compact view
      startFillColor: colors.gradient.start,
      endFillColor: colors.gradient.end,
      startOpacity: 0.4,
      endOpacity: 0.05,
      showVerticalLines: false,
      showHorizontalLines: true,
      yAxisThickness: 0,
      xAxisThickness: 1,
      yAxisColor: 'transparent',
      xAxisColor: '#e5e7eb',
      hideXAxisText: false,
      hideOrigin: false,
      animateOnDataChange: false, // Disable during drag for better performance
      animationDuration: 0, // No animation during drag
      noOfSections: compact ? 3 : 4,
      spacing: compact ? Math.max(30, (chartWidth - 50) / (config.data.length - 1)) : Math.max(40, (chartWidth - 60) / (config.data.length - 1)),
      initialSpacing: compact ? 15 : 20,
      endSpacing: compact ? 15 : 20,
      backgroundColor: '#f8fafc', // Neutral gray-blue background
    };

    return <LineChart {...chartProps} />;
  }, [config.data, chartWidth, chartHeight, colors, compact]);

  return (
    <>
      <View
        className="bg-white rounded-2xl overflow-hidden border border-gray-200"
        style={{}}
      >
        {/* Enhanced Header - Header tap functionality removed for better drag performance */}
        <View className="px-4 pt-4 pb-2">
          <View className="flex-row items-start justify-between mb-3">
            <View className="flex-1 mr-3">
              <Text className="text-lg font-bold text-gray-900 mb-1" numberOfLines={1}>
                {config.title}
              </Text>
              <Text className="text-xs text-gray-500">
                {config.data.length} points
              </Text>
            </View>
            
            <TouchableOpacity 
              onPress={() => setShowDeleteModal(true)}
              className="p-2 rounded-lg bg-gray-50" 
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              activeOpacity={0.7}
            >
              <MoreVertical width={14} height={14} stroke="#9ca3af" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Current Value & Change */}
        <View className="flex-row items-end justify-between px-4">
          <View>
            <Text className="text-2xl font-bold text-gray-900">
              {latestValue.toFixed(2)}
            </Text>
            <View className="flex-row items-center mt-1">
              {isPositive ? (
                <TrendingUp width={14} height={14} stroke={colors.primary} />
              ) : (
                <TrendingDown width={14} height={14} stroke={colors.primary} />
              )}
              <Text 
                className="text-sm font-semibold ml-1"
                style={{ color: colors.primary }}
              >
                {isPositive ? '+' : ''}{change.toFixed(2)} ({changePercent.toFixed(1)}%)
              </Text>
            </View>
          </View>
        </View>

        {/* Chart Section */}
        <View 
          className="rounded-xl overflow-hidden mx-4 mb-4 mt-3"
          style={{ 
            backgroundColor: '#f8fafc',
            minHeight: compact ? 180 : 240,
            paddingVertical: 15,
          }}
        >
          {renderChart}
        </View>

        {/* Enhanced Footer */}
        <View className="border-t border-gray-100 bg-gray-50 px-4 py-3">
          <View className="flex-row items-center justify-between">
            <View className="flex-1">
              <Text className="text-xs font-medium text-gray-500">Range</Text>
              <Text className="text-sm font-semibold text-gray-900">
                {Math.min(...config.data.map(d => d.value)).toFixed(1)} - {Math.max(...config.data.map(d => d.value)).toFixed(1)}
              </Text>
            </View>
            
            <View className="flex-1 items-center">
              <Text className="text-xs font-medium text-gray-500">Trend</Text>
              <Text 
                className="text-sm font-semibold"
                style={{ color: colors.primary }}
              >
                {isPositive ? 'UP' : 'DOWN'}
              </Text>
            </View>
            
            <View className="flex-1 items-end">
              <Text className="text-xs font-medium text-gray-500">Type</Text>
              <View className="bg-gray-100 px-2 py-1 rounded-md mt-0.5">
                <Text className="text-xs font-bold text-gray-700 capitalize">
                  {config.chartType}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* Delete Confirmation Modal */}
      <Modal
        visible={showDeleteModal}
        transparent={true}
        animationType="none"
        onRequestClose={() => setShowDeleteModal(false)}
      >
        <Animated.View 
          className="flex-1 justify-center items-center"
          style={{ 
            opacity: fadeAnim,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            padding: 16,
          }}
        >
          <View className="bg-white rounded-2xl p-6 w-full max-w-sm mx-4">
            {/* Modal Header */}
            <View className="flex-row items-center justify-between mb-4">
              <View className="flex-row items-center">
                <View className="w-10 h-10 bg-red-100 rounded-full items-center justify-center mr-3">
                  <Trash2 width={20} height={20} stroke="#ef4444" />
                </View>
                <Text className="text-lg font-bold text-gray-900">Delete Widget</Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowDeleteModal(false)}
                className="p-1"
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <X width={20} height={20} stroke="#6b7280" />
              </TouchableOpacity>
            </View>

            {/* Modal Content */}
            <Text className="text-gray-600 mb-6 leading-relaxed">
              Are you sure you want to delete "{config.title}"? This action cannot be undone.
            </Text>

            {/* Modal Actions */}
            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={() => setShowDeleteModal(false)}
                className="flex-1 bg-gray-100 py-3 px-4 rounded-xl"
                activeOpacity={0.7}
              >
                <Text className="text-gray-700 font-semibold text-center">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  onDelete?.(widget.id);
                  setShowDeleteModal(false);
                }}
                className="flex-1 bg-red-500 py-3 px-4 rounded-xl"
                activeOpacity={0.7}
              >
                <Text className="text-white font-semibold text-center">Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </Modal>
    </>
  );
};

export default DashboardWidget;