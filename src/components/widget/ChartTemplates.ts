import { ChartTemplate, ChartConfig } from './types';
import { fakeDataGenerator } from './FakeDataGenerator';

export const CHART_TEMPLATES: ChartTemplate[] = [
  {
    type: 'line',
    name: 'Basic Line Chart',
    description: 'Simple line chart with data points',
    icon: '📈',
    defaultConfig: {
      chartType: 'line',
      height: 320, // Taller default height
      color: '#3b82f6',
      thickness: 3, // Thicker line
      curved: true, // Default to curved
      areaChart: false,
      showDataPoints: true,
      dataPointsColor: '#3b82f6',
      dataPointsRadius: 5, // Larger points
      showVerticalLines: false,
      showHorizontalLines: true,
      yAxisThickness: 0,
      xAxisThickness: 1,
      yAxisColor: 'transparent',
      xAxisColor: '#e5e7eb',
      animateOnDataChange: true,
      animationDuration: 1200,
      noOfSections: 4,
      spacing: 50, // Will be dynamically calculated in component
      initialSpacing: 20, // Reduced for better full width utilization
      endSpacing: 20, // Reduced for better full width utilization
    },
  },
  {
    type: 'curved',
    name: 'Smooth Curved Line',
    description: 'Curved line chart with smooth transitions',
    icon: '🌊',
    defaultConfig: {
      chartType: 'curved',
      height: 320, // Taller default height
      color: '#10b981',
      thickness: 3,
      curved: true,
      areaChart: false,
      showDataPoints: true,
      dataPointsColor: '#10b981',
      dataPointsRadius: 5,
      showVerticalLines: false,
      showHorizontalLines: true,
      yAxisThickness: 0,
      xAxisThickness: 1,
      yAxisColor: 'transparent',
      xAxisColor: '#e5e7eb',
      animateOnDataChange: true,
      animationDuration: 1200,
      noOfSections: 4,
      spacing: 50, // Will be dynamically calculated in component
      initialSpacing: 20, // Reduced for better full width utilization
      endSpacing: 20, // Reduced for better full width utilization
    },
  },
  {
    type: 'area',
    name: 'Area Chart',
    description: 'Filled area chart with gradient',
    icon: '🏔️',
    defaultConfig: {
      chartType: 'area',
      height: 320, // Taller default height
      color: '#8b5cf6',
      thickness: 3, // Thicker line
      curved: true,
      areaChart: true,
      showDataPoints: false, // Area charts don't need data points
      startFillColor: '#8b5cf6',
      endFillColor: '#ffffff',
      startOpacity: 0.6, // More visible
      endOpacity: 0.1,
      showVerticalLines: false,
      showHorizontalLines: true,
      yAxisThickness: 0,
      xAxisThickness: 1,
      yAxisColor: 'transparent',
      xAxisColor: '#e5e7eb',
      animateOnDataChange: true,
      animationDuration: 1200,
      noOfSections: 4,
      spacing: 50, // Will be dynamically calculated in component
      initialSpacing: 20, // Reduced for better full width utilization
      endSpacing: 20, // Reduced for better full width utilization
    },
  },
  {
    type: 'step',
    name: 'Step Chart',
    description: 'Step-based line chart',
    icon: '📊',
    defaultConfig: {
      chartType: 'step',
      height: 220,
      color: '#f59e0b',
      thickness: 2,
      curved: false,
      areaChart: false,
      stepChart: true,
      showDataPoints: true,
      dataPointsColor: '#f59e0b',
      dataPointsRadius: 4,
      showVerticalLines: true,
      showHorizontalLines: true,
      yAxisThickness: 1,
      xAxisThickness: 1,
      yAxisColor: '#e5e7eb',
      xAxisColor: '#e5e7eb',
      animateOnDataChange: true,
      animationDuration: 800,
      noOfSections: 4,
      spacing: 50, // Will be dynamically calculated in component  
      initialSpacing: 20, // Reduced for better full width utilization
      endSpacing: 20, // Reduced for better full width utilization
    },
  },
];

export const CHART_DATA_PRESETS = {
  'stock-price': {
    name: 'Stock Price',
    description: 'Stock price movement over time',
    generator: () => fakeDataGenerator.generateWeeklyData({
      min: 150,
      max: 200,
      trend: 'random',
      volatility: 0.3,
      startValue: 175,
    }),
  },
  'weekly-performance': {
    name: 'Weekly Performance',
    description: 'Performance data by day of week',
    generator: () => fakeDataGenerator.generateWeeklyData({
      min: 80,
      max: 120,
      trend: 'wave',
      volatility: 0.25,
      startValue: 100,
    }),
  },
  'sales-data': {
    name: 'Monthly Sales',
    description: 'Sales performance by month',
    generator: () => fakeDataGenerator.generateSalesData(12),
  },
  'user-growth': {
    name: 'User Growth',
    description: 'User acquisition over time',
    generator: () => fakeDataGenerator.generateWeeklyData({
      min: 5000,
      max: 12000,
      trend: 'up',
      volatility: 0.2,
      startValue: 7000,
    }),
  },
  'performance': {
    name: 'System Performance',
    description: 'Performance metrics over time',
    generator: () => fakeDataGenerator.generatePerformanceData(24),
  },
  'revenue': {
    name: 'Daily Revenue',
    description: 'Revenue tracking by day',
    generator: () => fakeDataGenerator.generateWeeklyData({
      min: 5000,
      max: 15000,
      trend: 'up',
      volatility: 0.25,
      startValue: 8000,
    }),
  },
  'sales': {
    name: 'Sales Data',
    description: 'Weekly sales performance',
    generator: () => fakeDataGenerator.generateWeeklyData({
      min: 2000,
      max: 8000,
      trend: 'up',
      volatility: 0.3,
      startValue: 4000,
    }),
  },
  'random': {
    name: 'Random Data',
    description: 'Random data points by day',
    generator: () => fakeDataGenerator.generateWeeklyData({
      min: 10,
      max: 90,
      trend: 'random',
      volatility: 0.4,
      startValue: 50,
    }),
  },
  // Dashboard-specific data presets
  'portfolio-allocation': {
    name: 'Portfolio Allocation',
    description: 'Asset allocation breakdown',
    generator: () => fakeDataGenerator.generateWeeklyData({
      min: 20,
      max: 80,
      trend: 'wave',
      volatility: 0.15,
      startValue: 45,
    }),
  },
  'portfolio-performance': {
    name: 'Portfolio Performance',
    description: 'Portfolio performance over time',
    generator: () => fakeDataGenerator.generateWeeklyData({
      min: 95,
      max: 115,
      trend: 'up',
      volatility: 0.2,
      startValue: 100,
    }),
  },
  'market-sectors': {
    name: 'Market Sectors',
    description: 'Sector performance analysis',
    generator: () => fakeDataGenerator.generateWeeklyData({
      min: 85,
      max: 125,
      trend: 'random',
      volatility: 0.25,
      startValue: 105,
    }),
  },
  'earnings': {
    name: 'Earnings Data',
    description: 'Quarterly earnings performance',
    generator: () => fakeDataGenerator.generateWeeklyData({
      min: 0.5,
      max: 3.2,
      trend: 'up',
      volatility: 0.3,
      startValue: 1.8,
    }),
  },
  'risk-analysis': {
    name: 'Risk Analysis',
    description: 'Risk metrics and volatility',
    generator: () => fakeDataGenerator.generateWeeklyData({
      min: 5,
      max: 25,
      trend: 'down',
      volatility: 0.2,
      startValue: 15,
    }),
  },
  'price-alerts': {
    name: 'Price Alerts',
    description: 'Price alert triggers',
    generator: () => fakeDataGenerator.generateWeeklyData({
      min: 140,
      max: 180,
      trend: 'random',
      volatility: 0.4,
      startValue: 160,
    }),
  },
  'market-scanner': {
    name: 'Market Scanner',
    description: 'Market scanning results',
    generator: () => fakeDataGenerator.generateWeeklyData({
      min: 30,
      max: 70,
      trend: 'wave',
      volatility: 0.3,
      startValue: 50,
    }),
  },
  'technical-indicators': {
    name: 'Technical Indicators',
    description: 'Technical analysis indicators',
    generator: () => fakeDataGenerator.generateWeeklyData({
      min: 20,
      max: 80,
      trend: 'random',
      volatility: 0.35,
      startValue: 45,
    }),
  },
  'performance-metrics': {
    name: 'Performance Metrics',
    description: 'Advanced performance analysis',
    generator: () => fakeDataGenerator.generateWeeklyData({
      min: 85,
      max: 115,
      trend: 'up',
      volatility: 0.15,
      startValue: 100,
    }),
  },
  'correlation-data': {
    name: 'Correlation Data',
    description: 'Asset correlation analysis',
    generator: () => fakeDataGenerator.generateWeeklyData({
      min: -0.8,
      max: 0.8,
      trend: 'wave',
      volatility: 0.2,
      startValue: 0.3,
    }),
  },
  'trading-signals': {
    name: 'Trading Signals',
    description: 'Buy/sell signal indicators',
    generator: () => fakeDataGenerator.generateWeeklyData({
      min: 0,
      max: 100,
      trend: 'random',
      volatility: 0.4,
      startValue: 50,
    }),
  },
  'order-flow': {
    name: 'Order Flow',
    description: 'Order flow analysis',
    generator: () => fakeDataGenerator.generateWeeklyData({
      min: 1000,
      max: 5000,
      trend: 'wave',
      volatility: 0.3,
      startValue: 2500,
    }),
  },
  'pnl-data': {
    name: 'P&L Data',
    description: 'Profit and loss tracking',
    generator: () => fakeDataGenerator.generateWeeklyData({
      min: -500,
      max: 1500,
      trend: 'up',
      volatility: 0.4,
      startValue: 200,
    }),
  },
};

export function createChartConfig(
  template: ChartTemplate,
  dataPreset: keyof typeof CHART_DATA_PRESETS,
  title: string = 'New Chart'
): ChartConfig {
  const preset = CHART_DATA_PRESETS[dataPreset];
  const data = preset.generator();
  
  return {
    id: `chart_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    title,
    data,
    ...template.defaultConfig,
  } as ChartConfig;
}
