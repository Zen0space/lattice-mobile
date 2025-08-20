import React, { memo, useMemo, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import { Trash2, MoreVertical } from 'react-native-feather';
import { ChartWidgetProps, Widget, ChartConfig } from './types';
import { getChartWidth } from '../../utils/responsive';
import { performHeavyOperation } from '../../utils/react19Optimizations';

const { width: screenWidth } = Dimensions.get('window');

// Chart data preprocessing with memoization
const useChartData = (config: ChartConfig) => {
  return useMemo(() => {
    // Cache expensive calculations
    const data = config.data;
    const latestValue = data[data.length - 1]?.value || 0;
    const previousValue = data[data.length - 2]?.value || latestValue;
    const isUptrend = latestValue >= previousValue;
    const change = latestValue - previousValue;
    const changePercent = previousValue !== 0 ? ((change / previousValue) * 100) : 0;
    const minValue = Math.min(...data.map(d => d.value));
    const maxValue = Math.max(...data.map(d => d.value));

    // Color calculations
    const baseColor = config.color || (isUptrend ? '#10b981' : '#ef4444');
    const colors = {
      primary: baseColor,
      light: isUptrend ? '#34d399' : '#f87171',
      dark: isUptrend ? '#059669' : '#dc2626',
      gradient: {
        start: baseColor,
        end: isUptrend ? '#ecfdf5' : '#fef2f2'
      }
    };

    return {
      latestValue,
      previousValue,
      isUptrend,
      change,
      changePercent,
      minValue,
      maxValue,
      colors,
      dataLength: data.length,
    };
  }, [config.data, config.color]);
};

// Memoized chart component to prevent unnecessary re-renders
const MemoizedChart = memo<{
  config: ChartConfig;
  chartWidth: number;
  colors: any;
}>(({ config, chartWidth, colors }) => {
  // Chart configuration with performance optimizations
  const chartProps = useMemo(() => ({
    data: config.data,
    width: chartWidth,
    height: config.height || 320,
    color: colors.primary,
    thickness: config.thickness || 3,
    curved: config.stepChart === true ? false : (config.curved !== false),
    areaChart: config.areaChart === true,
    stepChart: config.stepChart || false,
    showDataPoints: config.areaChart === true ? false : (config.showDataPoints !== false),
    dataPointsColor: colors.dark,
    dataPointsRadius: config.dataPointsRadius || 5,
    dataPointsWidth: 2,
    dataPointsHeight: 2,
    startFillColor: colors.gradient.start,
    endFillColor: colors.gradient.end,
    startOpacity: 0.6,
    endOpacity: 0.1,
    showVerticalLines: false,
    showHorizontalLines: true,
    rulesColor: '#f3f4f6',
    rulesThickness: 0.5,
    yAxisThickness: 0,
    xAxisThickness: 1,
    yAxisColor: 'transparent',
    xAxisColor: '#e5e7eb',
    animateOnDataChange: config.animateOnDataChange !== false,
    animationDuration: config.animationDuration || 800, // Reduced for better performance
    maxValue: config.maxValue,
    minValue: config.minValue,
    noOfSections: config.noOfSections || 4,
    spacing: config.spacing || Math.max(40, (chartWidth - 70) / (config.data.length - 1)),
    initialSpacing: config.initialSpacing || 20,
    endSpacing: config.endSpacing || 20,
    backgroundColor: config.backgroundColor || 'transparent',
          yAxisTextStyle: {
        color: '#9ca3af',
        fontSize: 11,
        fontWeight: '500' as const,
        ...config.yAxisTextStyle,
      },
    xAxisTextStyle: {
      color: '#6b7280',
      fontSize: 12,
      fontWeight: '500',
      ...config.xAxisTextStyle,
    },
    hideXAxisText: false,
    xAxisLabelTextStyle: {
      color: '#6b7280',
      fontSize: 12,
      fontWeight: '500' as const,
    },
    showXAxisIndices: true,
    xAxisIndicesHeight: 2,
    xAxisIndicesWidth: 4,
    xAxisIndicesColor: '#e5e7eb',
    showTooltip: true,
    tooltipBgColor: colors.dark,
    tooltipTextColor: '#ffffff',
    focusEnabled: true,
    showStripOnFocus: true,
    stripColor: colors.primary,
    stripOpacity: 0.3,
  }), [config, chartWidth, colors]);

  return <LineChart {...chartProps} />;
});

MemoizedChart.displayName = 'MemoizedChart';

const OptimizedChartWidget: React.FC<ChartWidgetProps> = ({
  widget,
  onDelete,
  onUpdate,
  showControls = true,
}) => {
  const config = widget.config as ChartConfig;
  const chartWidth = getChartWidth('full');
  const mountedRef = useRef(true);

  // Cleanup on unmount to prevent memory leaks
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Memoized chart data calculations
  const chartData = useChartData(config);

  // Optimized delete handler with React 19 startTransition
  const handleDelete = useCallback(() => {
    if (!mountedRef.current) return;
    
    performHeavyOperation(() => {
      onDelete(widget.id);
    });
  }, [onDelete, widget.id]);

  // Memoized stats for footer
  const footerStats = useMemo(() => ({
    range: `${chartData.minValue.toFixed(0)} - ${chartData.maxValue.toFixed(0)}`,
    dataPoints: chartData.dataLength,
    trend: chartData.isUptrend ? 'Bullish' : 'Bearish',
  }), [chartData]);

  // Early return for crypto widgets
  if (widget.type !== 'chart') {
    const CryptoWidget = require('./CryptoWidget').default;
    return (
      <CryptoWidget
        widget={widget}
        onDelete={onDelete}
        onUpdate={onUpdate}
        showControls={showControls}
      />
    );
  }

  return (
    <View 
      className="bg-white rounded-2xl overflow-hidden border border-gray-200"
      style={{
        // Add shadow for better visual separation
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      }}
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
                style={{ backgroundColor: chartData.colors.primary }}
              />
              <Text className="text-sm font-medium text-gray-600">
                {chartData.dataLength} points • {config.chartType}
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
              {chartData.latestValue.toFixed(2)}
            </Text>
            <Text className="text-sm text-gray-500 mt-1">Current Value</Text>
          </View>
          
          <View className="items-end">
            <View 
              className={`flex-row items-center px-3 py-1.5 rounded-full ${
                chartData.isUptrend ? 'bg-green-50' : 'bg-red-50'
              }`}
            >
              <Text 
                className={`text-sm font-semibold ${
                  chartData.isUptrend ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {chartData.isUptrend ? '+' : ''}{chartData.changePercent.toFixed(1)}%
              </Text>
            </View>
            <Text className="text-xs text-gray-500 mt-1">
              {chartData.isUptrend ? '+' : ''}{chartData.change.toFixed(2)} change
            </Text>
          </View>
        </View>
      </View>

      {/* Optimized Chart Container */}
      <View className="px-5 pb-2">
        <View 
          className="rounded-xl overflow-hidden"
          style={{ 
            backgroundColor: '#f8fafc',
            minHeight: 360,
            justifyContent: 'center',
            alignItems: 'center',
            paddingVertical: 20,
          }}
        >
          <MemoizedChart 
            config={config} 
            chartWidth={chartWidth} 
            colors={chartData.colors} 
          />
        </View>
      </View>

      {/* Enhanced Footer Stats */}
      <View className="px-5 py-4 bg-gray-50">
        <View className="flex-row items-center justify-between">
          <View className="flex-1 items-center">
            <Text className="text-xs font-medium text-gray-500 mb-2">Range</Text>
            <Text className="text-sm font-bold text-gray-900">
              {footerStats.range}
            </Text>
          </View>
          
          <View className="w-px h-8 bg-gray-200 mx-4" />
          
          <View className="flex-1 items-center">
            <Text className="text-xs font-medium text-gray-500 mb-2">Data Points</Text>
            <Text className="text-sm font-bold text-gray-900">
              {footerStats.dataPoints}
            </Text>
          </View>
          
          <View className="w-px h-8 bg-gray-200 mx-4" />
          
          <View className="flex-1 items-center">
            <Text className="text-xs font-medium text-gray-500 mb-2">Trend</Text>
            <View 
              className={`px-3 py-1 rounded-full ${
                chartData.isUptrend ? 'bg-green-100' : 'bg-red-100'
              }`}
            >
              <Text 
                className={`text-xs font-bold ${
                  chartData.isUptrend ? 'text-green-700' : 'text-red-700'
                }`}
              >
                {footerStats.trend}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

export default memo(OptimizedChartWidget);
