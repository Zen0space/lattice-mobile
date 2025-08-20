import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Plus } from 'react-native-feather';
import { CHART_TEMPLATES, CHART_DATA_PRESETS, createChartConfig } from './ChartTemplates';
import { CRYPTO_TEMPLATES, CRYPTO_DATA_PRESETS, createCryptoConfig } from './CryptoTemplates';
import { Widget } from './types';

const { width: screenWidth } = Dimensions.get('window');

interface WidgetGalleryProps {
  onSelectWidget: (widget: Omit<Widget, 'id' | 'createdAt' | 'updatedAt'>) => void;
  maxWidgets?: number;
  currentWidgetCount?: number;
  showHeader?: boolean;
}

const WidgetGallery: React.FC<WidgetGalleryProps> = ({
  onSelectWidget,
  maxWidgets = 10,
  currentWidgetCount = 0,
  showHeader = true,
}) => {
  const cardWidth = (screenWidth - 48) / 2; // 2 columns with padding

  const handleWidgetSelect = (template: any, dataPreset: string, customTitle?: string, widgetType: 'chart' | 'crypto' = 'chart') => {
    let title: string;
    let config: any;
    let type: Widget['type'];
    
    if (widgetType === 'crypto') {
      title = customTitle || `${template.name} - ${CRYPTO_DATA_PRESETS[dataPreset as keyof typeof CRYPTO_DATA_PRESETS]?.name || 'Default'}`;
      config = createCryptoConfig(template, dataPreset as keyof typeof CRYPTO_DATA_PRESETS, title);
      type = template.type;
    } else {
      title = customTitle || `${template.name} - ${CHART_DATA_PRESETS[dataPreset as keyof typeof CHART_DATA_PRESETS].name}`;
      config = createChartConfig(template, dataPreset as keyof typeof CHART_DATA_PRESETS, title);
      type = 'chart';
    }
    
    const newWidget: Omit<Widget, 'id' | 'createdAt' | 'updatedAt'> = {
      type,
      title,
      config,
      position: { row: 0, col: 0 },
      size: { width: 1, height: 1 },
    };

    onSelectWidget(newWidget);
  };

  const popularCombinations = [
    {
      template: CHART_TEMPLATES.find(t => t.type === 'line'),
      dataPreset: 'stock-price',
      title: 'Stock Performance',
      description: 'Track stock price movements',
      color: '#10a37f'
    },
    {
      template: CHART_TEMPLATES.find(t => t.type === 'area'),
      dataPreset: 'revenue',
      title: 'Revenue Growth',
      description: 'Monitor revenue trends',
      color: '#8b5cf6'
    },
    {
      template: CHART_TEMPLATES.find(t => t.type === 'curved'),
      dataPreset: 'user-growth',
      title: 'User Analytics',
      description: 'Analyze user growth patterns',
      color: '#3b82f6'
    },
    {
      template: CHART_TEMPLATES.find(t => t.type === 'step'),
      dataPreset: 'user-growth',
      title: 'Step Analysis',
      description: 'Step-by-step data tracking',
      color: '#06b6d4'
    },
  ];

  const cryptoCombinations = [
    {
      template: CRYPTO_TEMPLATES.find(t => t.type === 'crypto-price'),
      dataPreset: 'btc-eth-bnb',
      title: 'Top Crypto Prices',
      description: 'Bitcoin, Ethereum & BNB prices',
      color: '#f59e0b'
    },
    {
      template: CRYPTO_TEMPLATES.find(t => t.type === 'crypto-market'),
      dataPreset: 'btc-eth-bnb',
      title: 'Market Overview',
      description: 'Total market cap & volume',
      color: '#3b82f6'
    },
    {
      template: CRYPTO_TEMPLATES.find(t => t.type === 'crypto-gainers'),
      dataPreset: 'top-gainers',
      title: 'Top Gainers',
      description: 'Best performing coins',
      color: '#10b981'
    },
    {
      template: CRYPTO_TEMPLATES.find(t => t.type === 'crypto-portfolio'),
      dataPreset: 'btc-eth-bnb',
      title: 'Portfolio Summary',
      description: 'Your crypto holdings',
      color: '#8b5cf6'
    },
  ];

  const isLimitReached = currentWidgetCount >= maxWidgets;

  return (
    <View className="flex-1 bg-gray-50">
      {/* Gallery Header - Only show when not embedded */}
      {showHeader && (
        <View className="px-6 py-4 bg-white border-b border-gray-100">
          <Text className="text-lg font-semibold text-secondary mb-1">
            Widget Gallery
          </Text>
          <Text className="text-sm text-gray-600">
            Tap any widget to add it to your dashboard
          </Text>
          {isLimitReached && (
            <View className="mt-2 px-3 py-1 bg-amber-50 border border-amber-200 rounded-lg">
              <Text className="text-xs text-amber-700 font-medium">
                Maximum {maxWidgets} widgets reached
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Popular Widgets Section */}
      <ScrollView 
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ 
          padding: 16, 
          paddingTop: showHeader ? 16 : 24 // Add more top padding when header is hidden
        }}
      >
        {/* Chart Widgets Section */}
        <Text className="text-base font-semibold text-gray-900 mb-4 px-2">
          📈 Chart Widgets
        </Text>
        
        <View className="flex-row flex-wrap justify-between mb-6">
          {popularCombinations.map((item, index) => {
            if (!item.template) return null;
            
            return (
              <TouchableOpacity
                key={index}
                onPress={() => !isLimitReached && handleWidgetSelect(item.template, item.dataPreset, item.title)}
                className={`mb-4 rounded-xl border ${isLimitReached ? 'opacity-50' : ''}`}
                style={{ 
                  width: cardWidth,
                  backgroundColor: 'white',
                  borderColor: '#e5e7eb',
                  shadowColor: item.color,
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.08,
                  shadowRadius: 8,
                  elevation: 3,
                }}
                activeOpacity={isLimitReached ? 1 : 0.7}
                disabled={isLimitReached}
              >
                {/* Widget Preview */}
                <View 
                  className="h-24 rounded-t-xl items-center justify-center"
                  style={{ backgroundColor: `${item.color}15` }}
                >
                  <View 
                    className="w-12 h-12 rounded-full items-center justify-center"
                    style={{ backgroundColor: item.color }}
                  >
                    <Text className="text-2xl">{item.template.icon}</Text>
                  </View>
                </View>

                {/* Widget Info */}
                <View className="p-4">
                  <View className="flex-row items-center justify-between mb-2">
                    <Text className="text-sm font-semibold text-gray-900 flex-1 mr-2" numberOfLines={1}>
                      {item.title}
                    </Text>
                    {!isLimitReached && (
                      <View className="w-6 h-6 rounded-full bg-gray-100 items-center justify-center">
                        <Plus width={12} height={12} stroke="#6b7280" />
                      </View>
                    )}
                  </View>
                  
                  <Text className="text-xs text-gray-600 mb-2" numberOfLines={2}>
                    {item.description}
                  </Text>
                  
                  <View className="flex-row items-center">
                    <View 
                      className="w-2 h-2 rounded-full mr-2"
                      style={{ backgroundColor: item.color }}
                    />
                    <Text className="text-xs text-gray-500 capitalize">
                      {item.template.type} chart
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Crypto Widgets Section */}
        <Text className="text-base font-semibold text-gray-900 mb-4 px-2">
          💰 Crypto Widgets
        </Text>
        
        <View className="flex-row flex-wrap justify-between mb-6">
          {cryptoCombinations.map((item, index) => {
            if (!item.template) return null;
            
            return (
              <TouchableOpacity
                key={`crypto-${index}`}
                onPress={() => !isLimitReached && handleWidgetSelect(item.template, item.dataPreset, item.title, 'crypto')}
                className={`mb-4 rounded-xl border ${isLimitReached ? 'opacity-50' : ''}`}
                style={{ 
                  width: cardWidth,
                  backgroundColor: 'white',
                  borderColor: '#e5e7eb',
                  shadowColor: item.color,
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.08,
                  shadowRadius: 8,
                  elevation: 3,
                }}
                activeOpacity={isLimitReached ? 1 : 0.7}
                disabled={isLimitReached}
              >
                {/* Widget Preview */}
                <View 
                  className="h-24 rounded-t-xl items-center justify-center"
                  style={{ backgroundColor: `${item.color}15` }}
                >
                  <Text style={{ fontSize: 32 }}>{item.template.icon}</Text>
                  {isLimitReached && (
                    <View className="absolute top-2 right-2">
                      <View className="bg-amber-100 border border-amber-300 rounded-full px-2 py-1">
                        <Text className="text-xs text-amber-700 font-medium">Max</Text>
                      </View>
                    </View>
                  )}
                </View>
                
                {/* Widget Info */}
                <View className="p-3">
                  <Text className="font-semibold text-gray-900 mb-1" numberOfLines={1}>
                    {item.title}
                  </Text>
                  
                  <Text className="text-xs text-gray-600 mb-2" numberOfLines={2}>
                    {item.description}
                  </Text>
                  
                  <View className="flex-row items-center">
                    <View 
                      className="w-2 h-2 rounded-full mr-2"
                      style={{ backgroundColor: item.color }}
                    />
                    <Text className="text-xs text-gray-500">
                      {item.template.defaultConfig.widgetType} widget
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Chart Templates Section */}
        <Text className="text-base font-semibold text-gray-900 mb-4 mt-6 px-2">
          All Chart Types
        </Text>
        
        <View className="space-y-3">
          {CHART_TEMPLATES.map((template) => (
            <View key={template.type} className="bg-white rounded-xl border border-gray-200 p-4">
              <View className="flex-row items-center mb-3">
                <View className="w-10 h-10 bg-gray-100 rounded-lg items-center justify-center mr-3">
                  <Text className="text-lg">{template.icon}</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-base font-semibold text-gray-900">
                    {template.name}
                  </Text>
                  <Text className="text-sm text-gray-600">
                    {template.description}
                  </Text>
                </View>
              </View>
              
              {/* Data Preset Options */}
              <View className="flex-row flex-wrap gap-2">
                {Object.entries(CHART_DATA_PRESETS).map(([key, preset]) => (
                  <TouchableOpacity
                    key={key}
                    onPress={() => !isLimitReached && handleWidgetSelect(template, key)}
                    className={`px-3 py-2 rounded-lg border ${isLimitReached ? 'opacity-50' : ''}`}
                    style={{
                      backgroundColor: isLimitReached ? '#f9fafb' : '#f8fafc',
                      borderColor: '#e2e8f0',
                    }}
                    activeOpacity={isLimitReached ? 1 : 0.7}
                    disabled={isLimitReached}
                  >
                    <Text className="text-xs font-medium text-gray-700">
                      {preset.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))}
        </View>
        
        {/* Bottom Spacing */}
        <View className="h-8" />
      </ScrollView>
    </View>
  );
};

export default WidgetGallery;
