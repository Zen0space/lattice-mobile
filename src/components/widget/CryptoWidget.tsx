import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  Modal,
  Animated,
} from 'react-native';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Activity, 
  MoreVertical,
  ArrowUp,
  ArrowDown,
  Trash2,
  X,
} from 'react-native-feather';
import { Widget, CryptoWidgetConfig } from './types';

const { width: screenWidth } = Dimensions.get('window');

interface CryptoWidgetProps {
  widget: Widget;
  onDelete: (widgetId: string) => void;
  onUpdate?: (widgetId: string, updates: Partial<Widget>) => void;
  showControls?: boolean;
  compact?: boolean;
}

// Mock crypto data - in a real app, this would come from an API
const mockCryptoData = {
  'BTC': { symbol: 'BTC', name: 'Bitcoin', price: 114523.45, change: -1.23, volume: '28.4B', marketCap: '2.26T' },
  'ETH': { symbol: 'ETH', name: 'Ethereum', price: 4187.92, change: 2.45, volume: '12.8B', marketCap: '503.2B' },
  'BNB': { symbol: 'BNB', name: 'BNB', price: 692.15, change: 1.87, volume: '2.1B', marketCap: '99.8B' },
  'SOL': { symbol: 'SOL', name: 'Solana', price: 248.73, change: 5.23, volume: '4.2B', marketCap: '118.5B' },
  'ADA': { symbol: 'ADA', name: 'Cardano', price: 1.15, change: -2.14, volume: '1.8B', marketCap: '40.3B' },
};

const topGainers = [
  { symbol: 'MATIC', name: 'Polygon', price: 1.87, change: 12.34 },
  { symbol: 'AVAX', name: 'Avalanche', price: 42.15, change: 8.92 },
  { symbol: 'LINK', name: 'Chainlink', price: 23.67, change: 7.65 },
];

const CryptoWidget: React.FC<CryptoWidgetProps> = ({
  widget,
  onDelete,
  onUpdate,
  showControls = true,
  compact = false,
}) => {
  const config = widget.config as CryptoWidgetConfig;
  const chartWidth = screenWidth * (compact ? 0.85 : 0.9);
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

  const handleDelete = () => {
    onDelete(widget.id);
  };

  const renderPriceWidget = () => {
    const symbols = config.cryptoSymbols || ['BTC', 'ETH'];
    
    return (
      <View className="p-4">
        {symbols.slice(0, config.maxItems || 3).map((symbol) => {
          const data = mockCryptoData[symbol as keyof typeof mockCryptoData];
          if (!data) return null;
          
          const isPositive = data.change >= 0;
          
          return (
            <View key={symbol} className="flex-row items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
              <View className="flex-row items-center flex-1">
                <View className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${
                  symbol === 'BTC' ? 'bg-orange-100' : 
                  symbol === 'ETH' ? 'bg-blue-100' : 
                  'bg-gray-100'
                }`}>
                  <Text className="font-bold text-sm">{symbol}</Text>
                </View>
                <View className="flex-1">
                  <Text className="font-semibold text-gray-900">{data.name}</Text>
                  <Text className="text-sm text-gray-500">{symbol}</Text>
                </View>
              </View>
              
              <View className="items-end">
                <Text className="font-bold text-gray-900">${data.price.toLocaleString()}</Text>
                <View className="flex-row items-center">
                  {isPositive ? (
                    <ArrowUp width={12} height={12} stroke="#10b981" />
                  ) : (
                    <ArrowDown width={12} height={12} stroke="#ef4444" />
                  )}
                  <Text className={`text-sm font-medium ml-1 ${
                    isPositive ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {Math.abs(data.change).toFixed(2)}%
                  </Text>
                </View>
              </View>
            </View>
          );
        })}
      </View>
    );
  };

  const renderMarketWidget = () => {
    return (
      <View className="p-4">
        <View className="flex-row justify-between items-center mb-4">
          <View className="flex-1">
            <Text className="text-sm text-gray-500">Total Market Cap</Text>
            <Text className="text-xl font-bold text-gray-900">$3.2T</Text>
            <View className="flex-row items-center mt-1">
              <TrendingUp width={14} height={14} stroke="#10b981" />
              <Text className="text-sm font-medium text-green-600 ml-1">+1.8%</Text>
            </View>
          </View>
          <View className="flex-1 items-end">
            <Text className="text-sm text-gray-500">24h Volume</Text>
            <Text className="text-xl font-bold text-gray-900">$89.2B</Text>
            <View className="flex-row items-center mt-1">
              <TrendingDown width={14} height={14} stroke="#ef4444" />
              <Text className="text-sm font-medium text-red-600 ml-1">-0.3%</Text>
            </View>
          </View>
        </View>
        
        <View className="border-t border-gray-200 pt-4">
          <View className="flex-row justify-between">
            <View>
              <Text className="text-sm text-gray-500">BTC Dominance</Text>
              <Text className="font-semibold text-gray-900">58.4%</Text>
            </View>
            <View className="items-center">
              <Text className="text-sm text-gray-500">Active Addresses</Text>
              <Text className="font-semibold text-gray-900">1.2M</Text>
            </View>
            <View className="items-end">
              <Text className="text-sm text-gray-500">DeFi TVL</Text>
              <Text className="font-semibold text-gray-900">$89.2B</Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const renderGainersWidget = () => {
    return (
      <View className="p-4">
        <Text className="text-sm font-medium text-gray-500 mb-3">Top Gainers (24h)</Text>
        {topGainers.map((crypto, index) => (
          <View key={crypto.symbol} className="flex-row items-center justify-between py-2">
            <View className="flex-row items-center flex-1">
              <Text className="text-xs font-medium text-gray-400 w-6">{index + 1}</Text>
              <View className="w-8 h-8 rounded-full bg-green-100 items-center justify-center mr-3">
                <Text className="font-bold text-xs text-green-700">{crypto.symbol.slice(0, 2)}</Text>
              </View>
              <View className="flex-1">
                <Text className="font-medium text-gray-900 text-sm">{crypto.name}</Text>
                <Text className="text-xs text-gray-500">{crypto.symbol}</Text>
              </View>
            </View>
            
            <View className="items-end">
              <Text className="font-semibold text-gray-900 text-sm">${crypto.price.toFixed(2)}</Text>
              <View className="flex-row items-center">
                <ArrowUp width={10} height={10} stroke="#10b981" />
                <Text className="text-xs font-medium text-green-600 ml-1">
                  +{crypto.change.toFixed(2)}%
                </Text>
              </View>
            </View>
          </View>
        ))}
      </View>
    );
  };

  const renderPortfolioWidget = () => {
    const portfolioValue = 157832.45;
    const portfolioChange = 3102.34;
    const portfolioChangePercent = 2.01;
    
    return (
      <View className="p-4">
        <View className="items-center mb-4">
          <Text className="text-sm text-gray-500 mb-1">Total Portfolio Value</Text>
          <Text className="text-2xl font-bold text-gray-900">${portfolioValue.toLocaleString()}</Text>
          <View className="flex-row items-center mt-1">
            <TrendingUp width={16} height={16} stroke="#10b981" />
            <Text className="text-sm font-medium text-green-600 ml-1">
              +${portfolioChange.toLocaleString()} (+{portfolioChangePercent}%)
            </Text>
          </View>
        </View>
        
        <View className="border-t border-gray-200 pt-4">
          <View className="flex-row justify-between mb-2">
            <View className="flex-1">
              <Text className="text-sm text-gray-500">Bitcoin</Text>
              <Text className="font-semibold text-gray-900">$57,261.73</Text>
              <Text className="text-xs text-gray-500">0.5 BTC</Text>
            </View>
            <View className="flex-1 items-end">
              <Text className="text-sm text-gray-500">Ethereum</Text>
              <Text className="font-semibold text-gray-900">$41,879.20</Text>
              <Text className="text-xs text-gray-500">10 ETH</Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const renderWidgetContent = () => {
    switch (config.widgetType) {
      case 'price':
        return renderPriceWidget();
      case 'market':
        return renderMarketWidget();
      case 'gainers':
        return renderGainersWidget();
      case 'portfolio':
        return renderPortfolioWidget();
      default:
        return renderPriceWidget();
    }
  };

  return (
    <>
    <View 
      className="bg-white rounded-2xl overflow-hidden border border-gray-200"
      style={{}}
    >
      {/* Header */}
      {showControls && (
        <View className="px-5 pt-4 pb-2">
          <View className="flex-row items-start justify-between">
            <View className="flex-1 mr-4">
              <Text className="text-lg font-bold text-gray-900">
                {config.title}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => setShowDeleteModal(true)}
              className="p-2 rounded-lg bg-gray-50"
              activeOpacity={0.7}
            >
              <MoreVertical width={16} height={16} stroke="#9ca3af" />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Widget Content */}
      <View 
        className="rounded-xl overflow-hidden"
        style={{ 
          backgroundColor: '#f8fafc',
          minHeight: compact ? 180 : 240,
        }}
      >
        {renderWidgetContent()}
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
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          padding: 16,
          opacity: fadeAnim,
        }}
      >
        <View 
          className="bg-white rounded-2xl p-6"
          style={{
            width: '100%',
            maxWidth: 320,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.25,
            shadowRadius: 8,
            elevation: 8,
          }}
        >
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
          <Text className="text-gray-600 mb-6 leading-5">
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
                handleDelete();
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

export default CryptoWidget;
