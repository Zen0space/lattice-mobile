import React from 'react';
import { View, Text, ScrollView, Dimensions } from 'react-native';
import TradingViewChart from './TradingViewChart';
import { getResponsiveWidth } from '../../utils/responsive';

interface ChartConfig {
  symbol: string;
  theme?: 'light' | 'dark';
  interval?: string;
  height?: number;
  width?: string;
  studies?: string[];
  showChart?: boolean;
  type?: string;
  showPieChart?: boolean;
  showPerformanceChart?: boolean;
  showHeatmap?: boolean;
  showCorrelation?: boolean;
}

interface ChatBubbleProps {
  message: string;
  isUser: boolean;
  timestamp: Date;
  isFinancialAdvice?: boolean;
  chartConfig?: ChartConfig;
  financialData?: any;
}

const ChatBubble: React.FC<ChatBubbleProps> = ({ 
  message, 
  isUser, 
  timestamp,
  isFinancialAdvice = false,
  chartConfig,
  financialData
}) => {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatFinancialMessage = (text: string) => {
    // Handle financial advice formatting with proper line breaks
    return text.split('. ').map((sentence, index, array) => {
      if (index === array.length - 1) return sentence;
      return sentence + '.';
    }).join('\n\n');
  };

  const displayMessage = isFinancialAdvice ? formatFinancialMessage(message) : message;

  const renderFinancialSummary = () => {
    if (!financialData || isUser) return null;

    return (
      <View style={{ marginTop: 12, padding: 12, backgroundColor: 'rgba(16, 163, 127, 0.1)', borderRadius: 8 }}>
        {/* Stock/Crypto Price Info */}
        {financialData.currentPrice && (
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
            <Text style={{ color: '#10a37f', fontWeight: '600', fontSize: 16 }}>
              {financialData.symbol || 'N/A'}
            </Text>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={{ color: '#1f2937', fontWeight: '600', fontSize: 16 }}>
                ${typeof financialData.currentPrice === 'number' ? financialData.currentPrice.toLocaleString() : financialData.currentPrice}
              </Text>
              {financialData.changePercent && (
                <Text style={{ 
                  color: financialData.changePercent > 0 ? '#10b981' : '#ef4444', 
                  fontSize: 12 
                }}>
                  {financialData.changePercent > 0 ? '+' : ''}{financialData.changePercent}%
                </Text>
              )}
            </View>
          </View>
        )}

        {/* Technical Indicators */}
        {financialData.technicalAnalysis && (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 8 }}>
            {financialData.technicalAnalysis.rsi && (
              <View style={{ marginRight: 16, marginBottom: 4 }}>
                <Text style={{ fontSize: 10, color: '#6b7280' }}>RSI</Text>
                <Text style={{ fontSize: 12, fontWeight: '500', color: '#1f2937' }}>
                  {financialData.technicalAnalysis.rsi}
                </Text>
              </View>
            )}
            {financialData.technicalAnalysis.trend && (
              <View style={{ marginRight: 16, marginBottom: 4 }}>
                <Text style={{ fontSize: 10, color: '#6b7280' }}>Trend</Text>
                <Text style={{ 
                  fontSize: 12, 
                  fontWeight: '500',
                  color: financialData.technicalAnalysis.trend === 'bullish' ? '#10b981' : 
                         financialData.technicalAnalysis.trend === 'bearish' ? '#ef4444' : '#f59e0b'
                }}>
                  {financialData.technicalAnalysis.trend}
                </Text>
              </View>
            )}
            {financialData.marketCap && (
              <View style={{ marginBottom: 4 }}>
                <Text style={{ fontSize: 10, color: '#6b7280' }}>Market Cap</Text>
                <Text style={{ fontSize: 12, fontWeight: '500', color: '#1f2937' }}>
                  {financialData.marketCap}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Recommendation Badge */}
        {financialData.recommendation?.action && (
          <View style={{ 
            alignSelf: 'flex-start',
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 12,
            backgroundColor: financialData.recommendation.action === 'BUY' ? '#dcfce7' : '#fee2e2'
          }}>
            <Text style={{ 
              fontSize: 10,
              fontWeight: '600',
              color: financialData.recommendation.action === 'BUY' ? '#166534' : '#991b1b'
            }}>
              {financialData.recommendation.action}
            </Text>
          </View>
        )}
      </View>
    );
  };

  const renderChart = () => {
    if (!chartConfig || !chartConfig.showChart || isUser) return null;
    
    return (
      <View style={{ marginTop: 12 }}>
        <TradingViewChart chartConfig={chartConfig} />
      </View>
    );
  };

  const renderMultipleCharts = () => {
    if (!financialData || isUser) return null;

    // Handle portfolio allocation charts
    if (financialData.specificAllocations) {
      return (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 12 }}>
          {financialData.specificAllocations.slice(0, 3).map((allocation: any, index: number) => (
            allocation.chartConfig?.showChart && (
              <View key={index} style={{ marginRight: 12, width: getResponsiveWidth(80) }}>
                <Text style={{ 
                  fontSize: 12, 
                  fontWeight: '600', 
                  color: '#1f2937', 
                  marginBottom: 4,
                  textAlign: 'center'
                }}>
                  {allocation.symbol} - {allocation.percentage}
                </Text>
                <TradingViewChart chartConfig={allocation.chartConfig} />
              </View>
            )
          ))}
        </ScrollView>
      );
    }

    // Handle legacy portfolio allocations (if they still exist)
    if (financialData.specificAllocations && Array.isArray(financialData.specificAllocations)) {
      const allocationsWithCharts = financialData.specificAllocations.filter((allocation: any) => allocation.chartConfig?.showChart);

      if (allocationsWithCharts.length === 0) return null;

      return (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 12 }}>
          {allocationsWithCharts.map((allocation: any, index: number) => (
            <View key={index} style={{ marginRight: 12, width: getResponsiveWidth(80) }}>
              <Text style={{ 
                fontSize: 12, 
                fontWeight: '600', 
                color: '#1f2937', 
                marginBottom: 4,
                textAlign: 'center'
              }}>
                {allocation.symbol} - {allocation.percentage}
              </Text>
              <TradingViewChart chartConfig={allocation.chartConfig} />
            </View>
          ))}
        </ScrollView>
      );
    }

    return null;
  };

  return (
    <View className={`mb-4 ${isUser ? 'items-end' : 'items-start'}`}>
      <View className={`flex-row items-start ${isUser ? 'flex-row-reverse' : ''}`} style={{ maxWidth: '90%' }}>
        {/* Avatar */}
        <View className="w-8 h-8 rounded-full items-center justify-center mt-1 mx-2"
              style={{ 
                backgroundColor: isUser ? '#6B7280' : '#10a37f',
                flexShrink: 0
              }}>
          <Text className="text-white text-xs font-semibold">
            {isUser ? 'You' : 'AI'}
          </Text>
        </View>
        
        {/* Message Bubble Container */}
        <View 
          className={`rounded-2xl px-4 py-3 ${
            isUser 
              ? 'rounded-br-md' 
              : 'rounded-bl-md'
          }`}
          style={{
            backgroundColor: isUser ? '#007AFF' : '#f3f4f6',
            flex: 1,
            maxWidth: '100%'
          }}
        >
          {/* Message Text */}
          <Text 
            className={`text-base leading-5 ${
              isUser ? 'text-white' : 'text-gray-800'
            }`}
            style={{ lineHeight: 20 }}
          >
            {displayMessage}
          </Text>

          {/* Financial Summary */}
          {renderFinancialSummary()}

          {/* Single Chart */}
          {renderChart()}

          {/* Multiple Charts */}
          {renderMultipleCharts()}
          
          {/* Timestamp */}
          <Text 
            className={`text-xs mt-3 ${
              isUser ? 'text-blue-100' : 'text-gray-500'
            }`}
          >
            {formatTime(timestamp)}
          </Text>
        </View>
      </View>
    </View>
  );
};

export default ChatBubble;
