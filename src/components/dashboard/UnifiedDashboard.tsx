import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, LayoutAnimation, Platform, UIManager } from 'react-native';
import { 
  PieChart, 
  TrendingUp, 
  BarChart2, 
  ArrowLeft, 
  Plus, 
  ChevronDown, 
  ChevronUp,
  Home,
  Eye,
  Activity,
  Zap
} from 'react-native-feather';
import DraggableFlatList, { RenderItemParams } from 'react-native-draggable-flatlist';
import { DashboardConfig, DashboardType } from './types';
import { WidgetManager, Widget, createChartConfig, CHART_TEMPLATES, CHART_DATA_PRESETS } from '../widget';
import { DashboardWidget } from './shared';
import { widgetStorage } from '../../stores/storage';
import { DASHBOARD_TEMPLATES } from './DashboardTemplates';

interface UnifiedDashboardProps {
  config: DashboardConfig;
}

// Dashboard configuration mapping for themes and content
const DASHBOARD_CONFIGS = {
  overview: {
    title: 'Portfolio Overview',
    subtitle: 'Complete portfolio overview with key metrics',
    primaryColor: '#10a37f',
    accentColor: '#0d8f6f',
    icon: Home,
    quickActions: [
      { id: 'performance', title: 'Performance', icon: TrendingUp, color: '#3b82f6', chartType: 'line' as const, dataPreset: 'stock-price' as const },
      { id: 'allocation', title: 'Allocation', icon: PieChart, color: '#8b5cf6', chartType: 'curved' as const, dataPreset: 'portfolio-allocation' as const },
      { id: 'analytics', title: 'Analytics', icon: BarChart2, color: '#10b981', chartType: 'area' as const, dataPreset: 'revenue' as const }
    ]
  },
  stocks: {
    title: 'Stock Portfolio',
    subtitle: 'Stock portfolio and equity market analysis',
    primaryColor: '#3b82f6',
    accentColor: '#2563eb',
    icon: BarChart2,
    quickActions: [
      { id: 'stock-performance', title: 'Stock Performance', icon: TrendingUp, color: '#3b82f6', chartType: 'line' as const, dataPreset: 'stock-price' as const },
      { id: 'sector-analysis', title: 'Sector Analysis', icon: PieChart, color: '#8b5cf6', chartType: 'curved' as const, dataPreset: 'market-sectors' as const },
      { id: 'earnings', title: 'Earnings', icon: BarChart2, color: '#10b981', chartType: 'area' as const, dataPreset: 'earnings' as const }
    ]
  },
  portfolio: {
    title: 'Portfolio Management',
    subtitle: 'Comprehensive portfolio analytics and management',
    primaryColor: '#8b5cf6',
    accentColor: '#7c3aed',
    icon: PieChart,
    quickActions: [
      { id: 'allocation', title: 'Asset Allocation', icon: PieChart, color: '#8b5cf6', chartType: 'curved' as const, dataPreset: 'portfolio-allocation' as const },
      { id: 'performance', title: 'Performance', icon: TrendingUp, color: '#3b82f6', chartType: 'line' as const, dataPreset: 'portfolio-performance' as const },
      { id: 'risk-metrics', title: 'Risk Analysis', icon: BarChart2, color: '#ef4444', chartType: 'area' as const, dataPreset: 'risk-analysis' as const }
    ]
  },
  watchlist: {
    title: 'Market Watchlist',
    subtitle: 'Track assets and market opportunities',
    primaryColor: '#06b6d4',
    accentColor: '#0891b2',
    icon: Eye,
    quickActions: [
      { id: 'price-alerts', title: 'Price Alerts', icon: TrendingUp, color: '#06b6d4', chartType: 'line' as const, dataPreset: 'price-alerts' as const },
      { id: 'market-scanner', title: 'Market Scanner', icon: BarChart2, color: '#10b981', chartType: 'area' as const, dataPreset: 'market-scanner' as const },
      { id: 'technical-analysis', title: 'Technical Analysis', icon: Activity, color: '#f59e0b', chartType: 'curved' as const, dataPreset: 'technical-indicators' as const }
    ]
  },
  analytics: {
    title: 'Advanced Analytics',
    subtitle: 'Advanced analytics and performance metrics',
    primaryColor: '#ef4444',
    accentColor: '#dc2626',
    icon: Activity,
    quickActions: [
      { id: 'performance-analysis', title: 'Performance Analysis', icon: TrendingUp, color: '#ef4444', chartType: 'line' as const, dataPreset: 'performance-metrics' as const },
      { id: 'risk-analysis', title: 'Risk Analysis', icon: BarChart2, color: '#f59e0b', chartType: 'area' as const, dataPreset: 'risk-analysis' as const },
      { id: 'correlation', title: 'Correlation Matrix', icon: Activity, color: '#8b5cf6', chartType: 'curved' as const, dataPreset: 'correlation-data' as const }
    ]
  },
  trading: {
    title: 'Active Trading',
    subtitle: 'Active trading interface and tools',
    primaryColor: '#f97316',
    accentColor: '#ea580c',
    icon: Zap,
    quickActions: [
      { id: 'trading-signals', title: 'Trading Signals', icon: Zap, color: '#f97316', chartType: 'line' as const, dataPreset: 'trading-signals' as const },
      { id: 'order-flow', title: 'Order Flow', icon: BarChart2, color: '#10b981', chartType: 'area' as const, dataPreset: 'order-flow' as const },
      { id: 'pnl-analysis', title: 'P&L Analysis', icon: TrendingUp, color: '#3b82f6', chartType: 'curved' as const, dataPreset: 'pnl-data' as const }
    ]
  }
};

/**
 * UnifiedDashboard Component
 * 
 * A single, highly customizable dashboard component that replaces all individual
 * dashboard types (Stocks, Portfolio, Watchlist, Analytics, Trading).
 * 
 * Features:
 * - Theme-based customization using dashboard type
 * - Full widget management and customization
 * - Drag-and-drop widget reordering
 * - Quick action buttons tailored to dashboard type
 * - Consistent UI/UX across all dashboard types
 * - Reduced code duplication and maintenance overhead
 */
const UnifiedDashboard: React.FC<UnifiedDashboardProps> = ({ config }) => {
  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [showWidgetManager, setShowWidgetManager] = useState(false);
  const [showAllWidgets, setShowAllWidgets] = useState(false);
  const [previousDashboardId, setPreviousDashboardId] = useState<string>('');

  // Get dashboard configuration based on type
  const dashboardConfig = DASHBOARD_CONFIGS[config.type] || DASHBOARD_CONFIGS.overview;
  const template = DASHBOARD_TEMPLATES[config.type] || DASHBOARD_TEMPLATES.overview;

  // Enable LayoutAnimation on Android
  useEffect(() => {
    if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
  }, []);

  // Load widgets from local storage when component mounts or dashboard changes
  useEffect(() => {
    let isMounted = true;
    
    const loadDashboardWidgets = async () => {
      try {
        const savedWidgets = await widgetStorage.loadWidgets(config.id);
        if (isMounted) {
          if (savedWidgets.length > 0) {
            setWidgets(savedWidgets);
            if (__DEV__) {

              console.log(`✅ Loaded ${savedWidgets.length} widgets for ${config.name} dashboard`);

            }
          } else {
            setWidgets([]);
            if (__DEV__) {

              console.log(`📝 No widgets found for ${config.name} dashboard`);

            }
          }
        }
      } catch (error) {
        if (isMounted) {
          console.error('❌ Error loading widgets:', error);
          setWidgets([]);
        }
      }
    };

    if (config.id) {
      loadDashboardWidgets();
    }

    return () => {
      isMounted = false;
      if (__DEV__) {

        console.log(`🧹 Cleaning up widget state for dashboard: ${config.name}`);

      }
    };
  }, [config.id, config.name]);

  // Dashboard change detection - reset widget state when switching dashboards
  useEffect(() => {
    if (previousDashboardId && previousDashboardId !== config.id) {
      if (__DEV__) {

        console.log(`🔄 Dashboard changed from ${previousDashboardId} to ${config.id} - resetting widget state`);

      }
      
      setWidgets([]);
      setShowAllWidgets(false);
      setShowWidgetManager(false);
      
      if (Platform.OS === 'android' || Platform.OS === 'ios') {
        LayoutAnimation.configureNext({
          duration: 200,
          create: { type: 'easeInEaseOut', property: 'opacity' },
          update: { type: 'easeInEaseOut' },
        });
      }
    }
    setPreviousDashboardId(config.id);
  }, [config.id, previousDashboardId]);

  const handleAddWidget = async (newWidgetData: Omit<Widget, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      if (!config?.id) {
        console.error('❌ Cannot add widget: Invalid dashboard config', config);
        return;
      }

      if (!newWidgetData?.title || !newWidgetData?.type) {
        console.error('❌ Cannot add widget: Invalid widget data', newWidgetData);
        return;
      }

      if (__DEV__) {


        console.log(`🔧 Adding widget "${newWidgetData.title}" to dashboard "${config.name}" (${config.id})`);


      }

      const newWidget: Widget = {
        ...newWidgetData,
        id: `widget_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      const updatedWidgets = [...widgets, newWidget];
      
      await widgetStorage.saveWidgets(config.id, updatedWidgets);
      if (__DEV__) {

        console.log(`✅ Widget "${newWidget.title}" saved to ${config.name} dashboard`);

      }
      
      setWidgets(updatedWidgets);
    } catch (error) {
      console.error('❌ Error adding widget:', error);
      alert(`Failed to add widget "${newWidgetData?.title || 'Unknown'}". Please try refreshing the app.`);
    }
  };

  const handleDeleteWidget = async (widgetId: string) => {
    try {
      if (!config?.id) {
        console.error('❌ Cannot delete widget: Invalid dashboard config', config);
        return;
      }

      const widgetToDelete = widgets.find(w => w.id === widgetId);
      if (!widgetToDelete) {
        console.warn(`⚠️ Widget ${widgetId} not found for deletion`);
        return;
      }

      if (__DEV__) {


        console.log(`🗑️ Deleting widget "${widgetToDelete.title}" from dashboard "${config.name}"`);


      }

      const newWidgets = widgets.filter((w) => w.id !== widgetId);
      
      await widgetStorage.saveWidgets(config.id, newWidgets);
      if (__DEV__) {

        console.log(`✅ Widget "${widgetToDelete.title}" deleted from ${config.name} dashboard`);

      }
      
      setWidgets(newWidgets);
      
      if (newWidgets.length <= 2) {
        setShowAllWidgets(false);
      }
    } catch (error) {
      console.error('❌ Error deleting widget:', error);
      alert(`Failed to delete widget. Please try refreshing the app.`);
    }
  };

  const handleWidgetReorder = async (data: Widget[]) => {
    try {
      if (!config?.id) {
        console.error('❌ Cannot reorder widgets: Invalid dashboard config', config);
        return;
      }

      if (__DEV__) {


        console.log(`🔄 Reordering ${data.length} widgets in dashboard "${config.name}"`);


      }
      
      await widgetStorage.saveWidgets(config.id, data);
      if (__DEV__) {

        console.log(`✅ Widget order saved for ${config.name} dashboard`);

      }
      
      setWidgets(data);
    } catch (error) {
      console.error('❌ Error saving widget order:', error);
      if (__DEV__) {

        console.log('🔄 Reverting widget order due to save failure');

      }
    }
  };

  const toggleShowAllWidgets = () => {
    LayoutAnimation.configureNext({
      duration: 300,
      create: { type: 'easeInEaseOut', property: 'opacity' },
      update: { type: 'easeInEaseOut' },
      delete: { type: 'easeInEaseOut', property: 'opacity' }
    });
    setShowAllWidgets(!showAllWidgets);
  };

  const handleUpdateWidget = async (widgetId: string, updates: Partial<Widget>) => {
    try {
      if (!config?.id) {
        console.error('❌ Cannot update widget: Invalid dashboard config', config);
        return;
      }

      const existingWidget = widgets.find(w => w.id === widgetId);
      if (!existingWidget) {
        console.warn(`⚠️ Widget ${widgetId} not found for update`);
        return;
      }

      if (__DEV__) {


        console.log(`🔧 Updating widget "${existingWidget.title}" in dashboard "${config.name}"`);


      }

      const updatedWidgets = widgets.map((widget) =>
        widget.id === widgetId
          ? { ...widget, ...updates, updatedAt: new Date() }
          : widget
      );
      
      await widgetStorage.saveWidgets(config.id, updatedWidgets);
      const updatedWidget = updatedWidgets.find(w => w.id === widgetId);
      if (__DEV__) {

        console.log(`✅ Widget "${updatedWidget?.title || widgetId}" updated in ${config.name} dashboard`);

      }
      
      setWidgets(updatedWidgets);
    } catch (error) {
      console.error('❌ Error updating widget:', error);
      alert(`Failed to update widget. Please try refreshing the app.`);
    }
  };

  const handleQuickAddWidget = async (action: typeof dashboardConfig.quickActions[0]) => {
    const template = CHART_TEMPLATES.find(t => t.type === action.chartType);
    if (!template) return;

    const chartConfig = createChartConfig(template, action.dataPreset, action.title);
    const newWidgetData: Omit<Widget, 'id' | 'createdAt' | 'updatedAt'> = {
      type: 'chart',
      title: action.title,
      config: chartConfig,
      position: { row: 0, col: 0 },
      size: { width: 1, height: 1 },
    };
    
    await handleAddWidget(newWidgetData);
  };

  const getWidgetListData = () => {
    const widgetsToShow = showAllWidgets ? widgets : widgets.slice(0, 2);
    return widgetsToShow.map((widget) => ({ ...widget }));
  };

  const renderWidgetItem = ({ item, drag, isActive }: RenderItemParams<any>) => {
    return (
      <TouchableOpacity
        className="mb-4"
        style={{ 
          marginHorizontal: 20,
          opacity: isActive ? 0.9 : 1,
          transform: [{ scale: isActive ? 1.02 : 1 }],
          elevation: isActive ? 8 : 0,
          shadowColor: isActive ? '#000' : 'transparent',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: isActive ? 0.15 : 0,
          shadowRadius: isActive ? 4 : 0,
        }}
        onLongPress={drag}
        delayLongPress={200}
        activeOpacity={0.98}
      >
        <DashboardWidget
          widget={item}
          compact={true}
          onDelete={handleDeleteWidget}
        />
      </TouchableOpacity>
    );
  };

  const renderListHeader = () => (
    <>
      {/* Dynamic Header Based on Dashboard Type */}
      <View className="mb-6" style={{ marginHorizontal: 20, marginTop: 20 }}>
        <Text className="text-2xl font-bold text-gray-900 mb-1">{dashboardConfig.title}</Text>
        <Text className="text-gray-600">{dashboardConfig.subtitle}</Text>
      </View>

      {/* Widgets Section Header */}
      {widgets.length > 0 && (
        <View className="mb-4" style={{ marginHorizontal: 20 }}>
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-lg font-semibold text-gray-900">Your Widgets</Text>
            <TouchableOpacity
              onPress={() => setShowWidgetManager(true)}
              className="px-3 py-1 rounded-full border"
              style={{ 
                backgroundColor: `${dashboardConfig.primaryColor}20`,
                borderColor: dashboardConfig.primaryColor 
              }}
              activeOpacity={0.7}
            >
              <Text className="font-medium text-sm" style={{ color: dashboardConfig.primaryColor }}>
                Manage
              </Text>
            </TouchableOpacity>
          </View>
          <Text className="text-xs text-gray-500 px-1">
            💡 Long press any widget to drag and reorder among other widgets
          </Text>
        </View>
      )}
    </>
  );

  const renderListFooter = () => (
    <>
      {/* View All Button */}
      {widgets.length > 2 && (
        <View className="mb-6" style={{ marginHorizontal: 20 }}>
          <TouchableOpacity
            onPress={toggleShowAllWidgets}
            className="bg-gray-50 border border-gray-200 rounded-xl p-4 items-center justify-center"
            activeOpacity={0.7}
          >
            <View className="flex-row items-center">
              <Text className="text-gray-600 font-medium mr-2">
                {showAllWidgets ? 'Show Less' : `View All ${widgets.length} Widgets`}
              </Text>
              {showAllWidgets ? (
                <ChevronUp width={16} height={16} stroke="#6b7280" />
              ) : (
                <ChevronDown width={16} height={16} stroke="#6b7280" />
              )}
            </View>
          </TouchableOpacity>
        </View>
      )}

      {/* Dashboard-Specific Quick Actions */}
      <View className="mb-6" style={{ marginHorizontal: 20 }}>
        <Text className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</Text>
        <View className="flex-row justify-between">
          {dashboardConfig.quickActions.map((action, index) => {
            const IconComponent = action.icon;
            return (
              <TouchableOpacity
                key={action.id}
                onPress={() => handleQuickAddWidget(action)}
                className="rounded-xl p-4 items-center justify-center flex-1"
                style={{
                  backgroundColor: `${action.color}20`,
                  borderColor: action.color,
                  borderWidth: 1,
                  marginHorizontal: index === 1 ? 4 : 0,
                  marginLeft: index === 0 ? 0 : 2,
                  marginRight: index === dashboardConfig.quickActions.length - 1 ? 0 : 2,
                }}
                activeOpacity={0.7}
              >
                <IconComponent width={24} height={24} stroke={action.color} />
                <Text className="font-semibold mt-2 text-center text-xs" style={{ color: action.color }}>
                  {action.title}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Add Custom Widget Button */}
      <View className="mb-6" style={{ marginHorizontal: 20 }}>
        <TouchableOpacity
          onPress={() => setShowWidgetManager(true)}
          className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-6 items-center justify-center"
          activeOpacity={0.7}
        >
          <View className="items-center">
            <View className="w-12 h-12 bg-gray-100 rounded-full items-center justify-center mb-3">
              <Plus width={24} height={24} stroke="#6b7280" />
            </View>
            <Text className="text-gray-700 font-semibold text-lg mb-1">Add Widget</Text>
            <Text className="text-gray-500 text-sm text-center">
              Choose from charts, analytics, and more
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      <View style={{ height: 100 }} />
    </>
  );

  if (showWidgetManager) {
    return (
      <View className="flex-1 bg-gray-50">
        <View className="bg-white border-b border-gray-200">
          <View className="flex-row items-center px-4 py-4">
            <TouchableOpacity
              onPress={() => setShowWidgetManager(false)}
              className="mr-4 p-2 rounded-xl bg-gray-50 border border-gray-200"
              activeOpacity={0.7}
            >
              <ArrowLeft width={20} height={20} stroke="#374151" />
            </TouchableOpacity>
            <View className="flex-1">
              <Text className="text-lg font-bold text-gray-900">Dashboard Widgets</Text>
              <Text className="text-sm text-gray-600">
                {widgets.length}/6 widgets • {dashboardConfig.title}
              </Text>
            </View>
          </View>
        </View>

        <WidgetManager
          widgets={widgets}
          onAddWidget={handleAddWidget}
          onDeleteWidget={handleDeleteWidget}
          onUpdateWidget={handleUpdateWidget}
          maxWidgets={6}
          gridCols={1}
          showHeader={false}
        />
      </View>
    );
  }

  const widgetListData = getWidgetListData();

  const handleDragEnd = ({ data }: { data: any[] }) => {
    handleWidgetReorder(data);
  };

  return (
    <View className="flex-1 bg-white">
      <DraggableFlatList
        data={widgetListData}
        onDragEnd={handleDragEnd}
        keyExtractor={(item) => item.id}
        renderItem={renderWidgetItem}
        ListHeaderComponent={renderListHeader}
        ListFooterComponent={renderListFooter}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
        activationDistance={5}
        autoscrollThreshold={100}
        autoscrollSpeed={200}
        animationConfig={{
          damping: 20,
          mass: 0.2,
          stiffness: 100,
          overshootClamping: true,
          restDisplacementThreshold: 0.01,
          restSpeedThreshold: 0.01,
        }}
        removeClippedSubviews={true}
        maxToRenderPerBatch={5}
        windowSize={10}
        initialNumToRender={8}
      />
    </View>
  );
};

export default UnifiedDashboard;
