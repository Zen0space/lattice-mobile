import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import { Trash2, MoreVertical } from 'react-native-feather';
import { ChartWidgetProps, Widget, ChartConfig } from './types';
import { getChartWidth, SCREEN_WIDTH } from '../../utils/responsive';
import CryptoWidget from './CryptoWidget';

const { width: screenWidth } = Dimensions.get('window');

const ChartWidget: React.FC<ChartWidgetProps> = ({
  widget,
  onDelete,
  onUpdate,
  showControls = true,
}) => {
  // If this is a crypto widget, render CryptoWidget instead
  if (widget.type !== 'chart') {
    return (
      <CryptoWidget
        widget={widget}
        onDelete={onDelete}
        onUpdate={onUpdate}
        showControls={showControls}
      />
    );
  }

  const config = widget.config as ChartConfig;
  // Responsive width using utility function
  const chartWidth = getChartWidth('full'); // Automatically calculates 90% of screen width

  const handleDelete = () => {
    onDelete(widget.id);
  };

  // Calculate trend for better color selection
  const latestValue = config.data[config.data.length - 1]?.value || 0;
  const previousValue = config.data[config.data.length - 2]?.value || latestValue;
  const isUptrend = latestValue >= previousValue;

  // Modern color schemes based on trend
  const getChartColors = () => {
    const baseColor = config.color || (isUptrend ? '#10b981' : '#ef4444'); // Green for up, red for down
    const lightColor = isUptrend ? '#34d399' : '#f87171';
    const darkColor = isUptrend ? '#059669' : '#dc2626';
    
    return {
      primary: baseColor,
      light: lightColor,
      dark: darkColor,
      gradient: {
        start: baseColor,
        end: isUptrend ? '#ecfdf5' : '#fef2f2'
      }
    };
  };

  const colors = getChartColors();

  const renderChart = () => {
    const chartProps = {
      data: config.data,
      width: chartWidth,
      height: config.height || 320, // Much taller for better visibility
      color: colors.primary,
      thickness: config.thickness || 3, // Thicker line for better visibility
      curved: config.stepChart === true ? false : (config.curved !== false), // Step charts must not be curved
      areaChart: config.areaChart === true, // Respect template configuration
      stepChart: config.stepChart || false,
      showDataPoints: config.areaChart === true ? false : (config.showDataPoints !== false), // Show points for line charts, hide for area charts
      dataPointsColor: colors.dark,
      dataPointsRadius: config.dataPointsRadius || 5, // Larger points for touch interaction
      dataPointsWidth: 2,
      dataPointsHeight: 2,
      startFillColor: colors.gradient.start,
      endFillColor: colors.gradient.end,
      startOpacity: 0.6, // More visible gradient
      endOpacity: 0.1,
      showVerticalLines: false, // Cleaner look without grid lines
      showHorizontalLines: true,
      rulesColor: '#f3f4f6', // Subtle grid lines
      rulesThickness: 0.5,
      yAxisThickness: 0, // Remove axis lines for cleaner look
      xAxisThickness: 1, // Show x-axis line for label anchor
      yAxisColor: 'transparent',
      xAxisColor: '#e5e7eb', // Subtle x-axis line for labels
      animateOnDataChange: config.animateOnDataChange !== false,
      animationDuration: config.animationDuration || 1200, // Smoother animation
      maxValue: config.maxValue,
      minValue: config.minValue,
      noOfSections: config.noOfSections || 4, // Less sections for cleaner look
      spacing: config.spacing || Math.max(40, (chartWidth - 70) / (config.data.length - 1)), // Dynamic spacing based on chart width and data points
      initialSpacing: config.initialSpacing || 20, // Reduced to use more chart width
      endSpacing: config.endSpacing || 20, // Reduced to use more chart width
      backgroundColor: config.backgroundColor || 'transparent',
      yAxisTextStyle: {
        color: '#9ca3af',
        fontSize: 11,
        fontWeight: '500',
        ...config.yAxisTextStyle,
      },
      xAxisTextStyle: {
        color: '#6b7280',
        fontSize: 12,
        fontWeight: '500',
        ...config.xAxisTextStyle,
      },
      // Ensure x-axis labels are visible
      hideXAxisText: false,
      xAxisLabelTextStyle: {
        color: '#6b7280',
        fontSize: 12,
        fontWeight: '500',
      },
      // Additional label configuration
      showXAxisIndices: true,
      xAxisIndicesHeight: 2,
      xAxisIndicesWidth: 4,
      xAxisIndicesColor: '#e5e7eb',
      // Enhanced touch interaction
      showTooltip: true,
      tooltipBgColor: colors.dark,
      tooltipTextColor: '#ffffff',
      focusEnabled: true,
      showStripOnFocus: true,
      stripColor: colors.primary,
      stripOpacity: 0.3,
    };

    return <LineChart {...chartProps} />;
  };

  // Calculate change for better stats display
  const change = latestValue - previousValue;
  const changePercent = previousValue !== 0 ? ((change / previousValue) * 100) : 0;
  const minValue = Math.min(...config.data.map(d => d.value));
  const maxValue = Math.max(...config.data.map(d => d.value));

  return (
    <View 
      className="bg-white rounded-2xl overflow-hidden border border-gray-200"
      style={{}}
    >
      {/* Enhanced Header */}
      <View className="px-5 pt-5 pb-3">
        <View className="flex-row items-start justify-between mb-4">
          <View className="flex-1 mr-4">
            <Text className="text-xl font-bold text-gray-900 mb-2">
              {config.title}
            </Text>
            <View className="flex-row items-center">
              <View 
                className="w-3 h-3 rounded-full mr-2"
                style={{ backgroundColor: colors.primary }}
              />
              <Text className="text-sm font-medium text-gray-600">
                {config.data.length} points • {config.chartType}
              </Text>
            </View>
          </View>
          
          {showControls && (
            <View className="flex-row items-center" style={{ gap: 8 }}>
              <TouchableOpacity
                onPress={handleDelete}
                className="p-2.5 rounded-xl bg-red-50"
                activeOpacity={0.7}
                style={{
                  shadowColor: '#ef4444',
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.1,
                  shadowRadius: 2,
                  elevation: 2,
                }}
              >
                <Trash2 width={18} height={18} stroke="#ef4444" />
              </TouchableOpacity>
              
              <TouchableOpacity
                className="p-2.5 rounded-xl bg-gray-50"
                activeOpacity={0.7}
                style={{
                  shadowColor: '#6b7280',
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.1,
                  shadowRadius: 2,
                  elevation: 2,
                }}
              >
                <MoreVertical width={18} height={18} stroke="#6b7280" />
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Current Value Display */}
        <View className="flex-row items-end justify-between mb-1 px-5">
          <View>
            <Text className="text-3xl font-bold text-gray-900">
              {latestValue.toFixed(2)}
            </Text>
            <Text className="text-sm text-gray-500 mt-1">Current Value</Text>
          </View>
          
          <View className="items-end">
            <View 
              className={`flex-row items-center px-3 py-1.5 rounded-full ${
                isUptrend ? 'bg-green-50' : 'bg-red-50'
              }`}
            >
              <Text 
                className={`text-sm font-semibold ${
                  isUptrend ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {isUptrend ? '+' : ''}{changePercent.toFixed(1)}%
              </Text>
            </View>
            <Text className="text-xs text-gray-500 mt-1">
              {isUptrend ? '+' : ''}{change.toFixed(2)} change
            </Text>
          </View>
        </View>
      </View>

      {/* Enhanced Chart Container */}
      <View className="px-5 pb-2">
        <View 
          className="rounded-xl overflow-hidden"
          style={{ 
            backgroundColor: '#f8fafc', // Neutral gray-blue background
            minHeight: 360, // Much taller container
            justifyContent: 'center',
            alignItems: 'center',
            paddingVertical: 20, // Add vertical padding for breathing room
          }}
        >
          {renderChart()}
        </View>
      </View>

      {/* Enhanced Footer Stats */}
      <View className="px-5 py-4 bg-gray-50">
        <View className="flex-row items-center justify-between">
          <View className="flex-1 items-center">
            <Text className="text-xs font-medium text-gray-500 mb-2">Range</Text>
            <Text className="text-sm font-bold text-gray-900">
              {minValue.toFixed(0)} - {maxValue.toFixed(0)}
            </Text>
          </View>
          
          <View className="w-px h-8 bg-gray-200 mx-4" />
          
          <View className="flex-1 items-center">
            <Text className="text-xs font-medium text-gray-500 mb-2">Data Points</Text>
            <Text className="text-sm font-bold text-gray-900">
              {config.data.length}
            </Text>
          </View>
          
          <View className="w-px h-8 bg-gray-200 mx-4" />
          
          <View className="flex-1 items-center">
            <Text className="text-xs font-medium text-gray-500 mb-2">Trend</Text>
            <View 
              className={`px-3 py-1 rounded-full ${
                isUptrend ? 'bg-green-100' : 'bg-red-100'
              }`}
            >
              <Text 
                className={`text-xs font-bold ${
                  isUptrend ? 'text-green-700' : 'text-red-700'
                }`}
              >
                {isUptrend ? 'Bullish' : 'Bearish'}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

export default ChartWidget;
