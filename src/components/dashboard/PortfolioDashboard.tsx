import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, LayoutAnimation, Platform, UIManager, ScrollView } from 'react-native';
import { PieChart, TrendingUp, BarChart2, ArrowLeft, Plus, ChevronDown, ChevronUp } from 'react-native-feather';
import DraggableFlatList, { RenderItemParams } from 'react-native-draggable-flatlist';
import { DashboardConfig } from './types';
import { WidgetManager, Widget, createChartConfig, CHART_TEMPLATES, CHART_DATA_PRESETS } from '../widget';
import { DashboardWidget } from './shared';
import { DashboardStorage } from '../../utils/DashboardStorage';

interface PortfolioDashboardProps {
  config: DashboardConfig;
}

const PortfolioDashboard: React.FC<PortfolioDashboardProps> = ({ config }) => {
  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [showWidgetManager, setShowWidgetManager] = useState(false);
  const [showAllWidgets, setShowAllWidgets] = useState(false);
  const [previousDashboardId, setPreviousDashboardId] = useState<string>('');

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
        const savedWidgets = await DashboardStorage.loadDashboardWidgets(config.id);
        if (isMounted) {
          if (savedWidgets.length > 0) {
            setWidgets(savedWidgets);
            console.log(`✅ Loaded ${savedWidgets.length} widgets for ${config.name} dashboard`);
          } else {
            setWidgets([]);
            console.log(`📝 No widgets found for ${config.name} dashboard`);
          }
        }
      } catch (error) {
        if (isMounted) {
          console.error('❌ Error loading widgets:', error);
          setWidgets([]); // Clear widgets on error to prevent stale state
        }
      }
    };

    if (config.id) {
      loadDashboardWidgets();
    }

    // CRITICAL: Cleanup function to prevent state updates after unmount
    return () => {
      isMounted = false;
      console.log(`🧹 Cleaning up widget state for dashboard: ${config.name}`);
    };
  }, [config.id, config.name]);

  // Dashboard change detection - reset widget state when switching dashboards
  useEffect(() => {
    if (previousDashboardId && previousDashboardId !== config.id) {
      console.log(`🔄 Dashboard changed from ${previousDashboardId} to ${config.id} - resetting widget state`);
      
      // Dashboard changed - reset widget-related state
      setWidgets([]);
      setShowAllWidgets(false);
      setShowWidgetManager(false);
      
      // Optional: Add smooth transition animation
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
      // CRITICAL: Validate dashboard config before widget operations
      if (!config?.id) {
        console.error('❌ Cannot add widget: Invalid dashboard config', config);
        return;
      }

      // Validate widget data
      if (!newWidgetData?.title || !newWidgetData?.type) {
        console.error('❌ Cannot add widget: Invalid widget data', newWidgetData);
        return;
      }

      console.log(`🔧 Adding widget "${newWidgetData.title}" to dashboard "${config.name}" (${config.id})`);

      const newWidget: Widget = {
        ...newWidgetData,
        id: `widget_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      const updatedWidgets = [...widgets, newWidget];
      
      // CRITICAL: Save to storage FIRST to validate dashboard exists
      await DashboardStorage.saveDashboardWidgets(config.id, updatedWidgets);
      console.log(`✅ Widget "${newWidget.title}" saved to ${config.name} dashboard`);
      
      // Only update state if storage operation succeeded
      setWidgets(updatedWidgets);
    } catch (error) {
      console.error('❌ Error adding widget:', error);
      console.error('Dashboard config:', config);
      console.error('Widget data:', newWidgetData);
      
      // Don't update state if save failed - keeps UI consistent
      alert(`Failed to add widget "${newWidgetData?.title || 'Unknown'}". Please try refreshing the app.`);
    }
  };

  const handleDeleteWidget = async (widgetId: string) => {
    try {
      // CRITICAL: Validate dashboard config
      if (!config?.id) {
        console.error('❌ Cannot delete widget: Invalid dashboard config', config);
        return;
      }

      const widgetToDelete = widgets.find(w => w.id === widgetId);
      if (!widgetToDelete) {
        console.warn(`⚠️ Widget ${widgetId} not found for deletion`);
        return;
      }

      console.log(`🗑️ Deleting widget "${widgetToDelete.title}" from dashboard "${config.name}"`);

      const newWidgets = widgets.filter((w) => w.id !== widgetId);
      
      // CRITICAL: Save to storage FIRST
      await DashboardStorage.saveDashboardWidgets(config.id, newWidgets);
      console.log(`✅ Widget "${widgetToDelete.title}" deleted from ${config.name} dashboard`);
      
      // Only update state if storage operation succeeded
      setWidgets(newWidgets);
      
      // Auto-collapse if we now have 2 or fewer widgets
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
      // CRITICAL: Validate dashboard config
      if (!config?.id) {
        console.error('❌ Cannot reorder widgets: Invalid dashboard config', config);
        return;
      }

      console.log(`🔄 Reordering ${data.length} widgets in dashboard "${config.name}"`);
      
      // CRITICAL: Save to storage FIRST
      await DashboardStorage.saveDashboardWidgets(config.id, data);
      console.log(`✅ Widget order saved for ${config.name} dashboard`);
      
      // Only update state if storage operation succeeded
      setWidgets(data);
    } catch (error) {
      console.error('❌ Error saving widget order:', error);
      // Revert to original order if save failed
      console.log('🔄 Reverting widget order due to save failure');
    }
  };

  const toggleShowAllWidgets = () => {
    // Configure smooth animation
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
      // CRITICAL: Validate dashboard config
      if (!config?.id) {
        console.error('❌ Cannot update widget: Invalid dashboard config', config);
        return;
      }

      const existingWidget = widgets.find(w => w.id === widgetId);
      if (!existingWidget) {
        console.warn(`⚠️ Widget ${widgetId} not found for update`);
        return;
      }

      console.log(`🔧 Updating widget "${existingWidget.title}" in dashboard "${config.name}"`);

      const updatedWidgets = widgets.map((widget) =>
        widget.id === widgetId
          ? { ...widget, ...updates, updatedAt: new Date() }
          : widget
      );
      
      // CRITICAL: Save to storage FIRST
      await DashboardStorage.saveDashboardWidgets(config.id, updatedWidgets);
      const updatedWidget = updatedWidgets.find(w => w.id === widgetId);
      console.log(`✅ Widget "${updatedWidget?.title || widgetId}" updated in ${config.name} dashboard`);
      
      // Only update state if storage operation succeeded
      setWidgets(updatedWidgets);
    } catch (error) {
      console.error('❌ Error updating widget:', error);
      alert(`Failed to update widget. Please try refreshing the app.`);
    }
  };

  const handleQuickAddWidget = async (templateType: 'line' | 'area' | 'curved', dataPreset: keyof typeof CHART_DATA_PRESETS, title: string) => {
    const template = CHART_TEMPLATES.find(t => t.type === templateType);
    if (!template) return;

    const config = createChartConfig(template, dataPreset, title);
    const newWidgetData: Omit<Widget, 'id' | 'createdAt' | 'updatedAt'> = {
      type: 'chart',
      title,
      config,
      position: { row: 0, col: 0 },
      size: { width: 1, height: 1 },
    };
    
    // Use the proper handleAddWidget function to save to storage
    await handleAddWidget(newWidgetData);
  };

  // Get only widgets for the draggable list - no static content mixed in
  const getWidgetListData = () => {
    const widgetsToShow = showAllWidgets ? widgets : widgets.slice(0, 2);
    return widgetsToShow.map((widget) => ({
      ...widget,
      // Preserve original widget properties without additional metadata
    }));
  };

  const renderListItem = ({ item, drag, isActive }: RenderItemParams<any>) => {
    if (item.listItemType === 'header') {
      return (
        <View className="mb-6" style={{ marginHorizontal: 20, marginTop: 20 }}>
          <Text className="text-2xl font-bold text-gray-900 mb-1">Portfolio Management</Text>
          <Text className="text-gray-600">Comprehensive portfolio analytics and management</Text>
        </View>
      );
    }

    if (item.listItemType === 'widget-header') {
      return (
        <View className="mb-4" style={{ marginHorizontal: 20 }}>
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-lg font-semibold text-gray-900">Your Widgets</Text>
            <TouchableOpacity
              onPress={() => setShowWidgetManager(true)}
              className="bg-blue-50 px-3 py-1 rounded-full border border-blue-200"
              activeOpacity={0.7}
            >
              <Text className="text-blue-600 font-medium text-sm">Manage</Text>
            </TouchableOpacity>
          </View>
          <Text className="text-xs text-gray-500 px-1">
            💡 Long press any widget to drag and reorder
          </Text>
        </View>
      );
    }

    if (item.listItemType === 'widget') {
      return (
        <TouchableOpacity
          className="mb-4"
          style={{ 
            marginHorizontal: 20,
            opacity: isActive ? 0.9 : 1,
            transform: [{ 
              scale: isActive ? 1.02 : 1, // Reduced scale for smoother animation
            }],
            elevation: isActive ? 8 : 0,
            shadowColor: isActive ? '#000' : 'transparent',
            shadowOffset: { width: 0, height: 2 }, // Reduced shadow offset
            shadowOpacity: isActive ? 0.15 : 0, // Reduced shadow opacity
            shadowRadius: isActive ? 4 : 0, // Reduced shadow radius
            // Hardware acceleration achieved through elevation and transform
          }}
          onLongPress={drag}
          delayLongPress={200} // Faster response time
          activeOpacity={0.98} // Subtle opacity change
        >
          <DashboardWidget
            widget={item}
            compact={true}
            onDelete={handleDeleteWidget}
          />
        </TouchableOpacity>
      );
    }

    if (item.listItemType === 'view-all-button') {
      return (
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
      );
    }

    if (item.listItemType === 'quick-actions') {
      return (
        <View className="mb-6" style={{ marginHorizontal: 20 }}>
          <Text className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</Text>
          <View className="flex-row justify-between">
            <TouchableOpacity
              onPress={() => handleQuickAddWidget('line', 'stock-price', 'Stock Performance')}
              className="bg-blue-50 border border-blue-200 rounded-xl p-4 items-center justify-center flex-1 mr-2"
              activeOpacity={0.7}
            >
              <TrendingUp width={24} height={24} stroke="#3b82f6" />
              <Text className="text-blue-700 font-semibold mt-2">Line Chart</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={() => handleQuickAddWidget('area', 'revenue', 'Revenue Growth')}
              className="bg-green-50 border border-green-200 rounded-xl p-4 items-center justify-center flex-1 mx-1"
              activeOpacity={0.7}
            >
              <BarChart2 width={24} height={24} stroke="#10b981" />
              <Text className="text-green-700 font-semibold mt-2">Area Chart</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={() => handleQuickAddWidget('curved', 'user-growth', 'User Analytics')}
              className="bg-purple-50 border border-purple-200 rounded-xl p-4 items-center justify-center flex-1 ml-2"
              activeOpacity={0.7}
            >
              <PieChart width={24} height={24} stroke="#8b5cf6" />
              <Text className="text-purple-700 font-semibold mt-2">Curved Chart</Text>
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity
            onPress={() => setShowWidgetManager(true)}
            className="mt-4 bg-white border border-gray-300 rounded-xl p-4 items-center justify-center"
            style={{
              backgroundColor: '#10b981',
              borderColor: '#059669',
              shadowColor: '#10b981',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 8,
            }}
            activeOpacity={0.9}
          >
            <View className="flex-row items-center">
              <Plus width={20} height={20} stroke="white" />
              <Text className="text-white font-bold ml-2 text-base">Create Custom Widget</Text>
            </View>
          </TouchableOpacity>
        </View>
      );
    }

    return null;
  };

  if (showWidgetManager) {
    return (
      <View className="flex-1 bg-gray-50">
        {/* Proper Header with Back Button */}
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
                {widgets.length}/6 widgets • Portfolio Dashboard
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
    // All items in data are widgets, so we can directly reorder them
    handleWidgetReorder(data);
  };

  // Simplified render function for widgets only
  const renderWidgetItem = ({ item, drag, isActive }: RenderItemParams<any>) => {
    return (
      <TouchableOpacity
        className="mb-4"
        style={{ 
          marginHorizontal: 20,
          opacity: isActive ? 0.9 : 1,
          transform: [{ 
            scale: isActive ? 1.02 : 1, // Reduced scale for smoother animation
          }],
          elevation: isActive ? 8 : 0,
          shadowColor: isActive ? '#000' : 'transparent',
          shadowOffset: { width: 0, height: 2 }, // Reduced shadow offset
          shadowOpacity: isActive ? 0.15 : 0, // Reduced shadow opacity
          shadowRadius: isActive ? 4 : 0, // Reduced shadow radius
          // Hardware acceleration achieved through elevation and transform
        }}
        onLongPress={drag}
        delayLongPress={200} // Faster response time
        activeOpacity={0.98} // Subtle opacity change
      >
        <DashboardWidget
          widget={item}
          compact={true}
          onDelete={handleDeleteWidget}
        />
      </TouchableOpacity>
    );
  };

  // Header component with static content
  const renderListHeader = () => (
    <>
      {/* Static Header - Not draggable */}
      <View className="mb-6" style={{ marginHorizontal: 20, marginTop: 20 }}>
        <Text className="text-2xl font-bold text-gray-900 mb-1">Portfolio Management</Text>
        <Text className="text-gray-600">Comprehensive portfolio analytics and management</Text>
      </View>

      {/* Widgets Section Header - Not draggable */}
      {widgets.length > 0 && (
        <View className="mb-4" style={{ marginHorizontal: 20 }}>
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-lg font-semibold text-gray-900">Your Widgets</Text>
            <TouchableOpacity
              onPress={() => setShowWidgetManager(true)}
              className="bg-blue-50 px-3 py-1 rounded-full border border-blue-200"
              activeOpacity={0.7}
            >
              <Text className="text-blue-600 font-medium text-sm">Manage</Text>
            </TouchableOpacity>
          </View>
          <Text className="text-xs text-gray-500 px-1">
            💡 Long press any widget to drag and reorder among other widgets
          </Text>
        </View>
      )}
    </>
  );

  // Footer component with static content
  const renderListFooter = () => (
    <>
      {/* View All Button - Not draggable */}
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

      {/* Quick Actions - Not draggable */}
      <View className="mb-6" style={{ marginHorizontal: 20 }}>
        <Text className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</Text>
        <View className="flex-row justify-between">
          <TouchableOpacity
            onPress={() => handleQuickAddWidget('line', 'stock-price', 'Stock Performance')}
            className="bg-blue-50 border border-blue-200 rounded-xl p-4 items-center justify-center flex-1 mr-2"
            activeOpacity={0.7}
          >
            <TrendingUp width={24} height={24} stroke="#3b82f6" />
            <Text className="text-blue-700 font-semibold mt-2">Line Chart</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={() => handleQuickAddWidget('area', 'revenue', 'Revenue Growth')}
            className="bg-green-50 border border-green-200 rounded-xl p-4 items-center justify-center flex-1 mx-1"
            activeOpacity={0.7}
          >
            <BarChart2 width={24} height={24} stroke="#10b981" />
            <Text className="text-green-700 font-semibold mt-2">Area Chart</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={() => handleQuickAddWidget('curved', 'user-growth', 'User Analytics')}
            className="bg-purple-50 border border-purple-200 rounded-xl p-4 items-center justify-center flex-1 ml-2"
            activeOpacity={0.7}
          >
            <PieChart width={24} height={24} stroke="#8b5cf6" />
            <Text className="text-purple-700 font-semibold mt-2">Curved Chart</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Add Widget Button - Below Quick Actions */}
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

      {/* Bottom padding for scroll area */}
      <View style={{ height: 100 }} />
    </>
  );

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
        // Performance optimizations for smoother drag experience
        activationDistance={5} // Reduced activation distance for faster response
        autoscrollThreshold={100} // Better auto-scroll behavior
        autoscrollSpeed={200} // Smooth auto-scroll speed
        animationConfig={{
          damping: 20, // Smooth spring animation
          mass: 0.2, // Light mass for responsive feel
          stiffness: 100, // Balanced stiffness
          overshootClamping: true, // Prevent overshoot
          restDisplacementThreshold: 0.01, // Fine-tuned rest threshold
          restSpeedThreshold: 0.01, // Fine-tuned speed threshold
        }}
        // Re-enabled optimizations now that we're not nested in ScrollView
        removeClippedSubviews={true}
        maxToRenderPerBatch={5}
        windowSize={10}
        initialNumToRender={8}
      />
    </View>
  );
};

export default PortfolioDashboard;