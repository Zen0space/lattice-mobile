import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, Dimensions } from 'react-native';
import { Plus, BarChart, Trash2, Download } from 'react-native-feather';
import { WidgetManagerProps, Widget } from './types';
import ChartWidget from './ChartWidget';
import WidgetGallery from './WidgetGallery';
import { createSampleWidgets } from './SampleWidgets';

const { width: screenWidth } = Dimensions.get('window');

const WidgetManager: React.FC<WidgetManagerProps> = ({
  widgets: initialWidgets = [],
  onAddWidget,
  onDeleteWidget,
  onUpdateWidget,
  maxWidgets = 10,
  gridCols = 1,
  showHeader = true,
}) => {
  const [widgets, setWidgets] = useState<Widget[]>(initialWidgets);
  const [showGallery, setShowGallery] = useState(true);

  useEffect(() => {
    setWidgets(initialWidgets);
  }, [initialWidgets]);

  const handleAddWidget = (newWidgetData: Omit<Widget, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newWidget: Widget = {
      ...newWidgetData,
      id: `widget_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const updatedWidgets = [...widgets, newWidget];
    setWidgets(updatedWidgets);
    onAddWidget?.(newWidgetData);
  };

  const handleDeleteWidget = (widgetId: string) => {
    Alert.alert(
      'Delete Widget',
      'Are you sure you want to delete this widget? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            const updatedWidgets = widgets.filter(w => w.id !== widgetId);
            setWidgets(updatedWidgets);
            onDeleteWidget?.(widgetId);
          },
        },
      ]
    );
  };

  const handleUpdateWidget = (widgetId: string, updates: Partial<Widget>) => {
    const updatedWidgets = widgets.map(widget =>
      widget.id === widgetId ? { ...widget, ...updates, updatedAt: new Date() } : widget
    );
    setWidgets(updatedWidgets);
    onUpdateWidget?.(widgetId, updates);
  };

  const handleClearAllWidgets = () => {
    Alert.alert(
      'Clear All Widgets',
      'Are you sure you want to delete all widgets? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: () => {
            widgets.forEach(widget => onDeleteWidget?.(widget.id));
            setWidgets([]);
          },
        },
      ]
    );
  };

  const handleLoadSamples = () => {
    if (widgets.length > 0) {
      Alert.alert(
        'Load Sample Widgets',
        'This will replace your current widgets with sample charts. Continue?',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Load Samples',
            onPress: () => {
              // Clear existing widgets
              widgets.forEach(widget => onDeleteWidget?.(widget.id));
              // Add sample widgets
              const sampleWidgets = createSampleWidgets();
              setWidgets(sampleWidgets);
              sampleWidgets.forEach(widget => {
                onAddWidget?.({
                  type: widget.type,
                  title: widget.title,
                  config: widget.config,
                  position: widget.position,
                  size: widget.size,
                });
              });
            },
          },
        ]
      );
    } else {
      const sampleWidgets = createSampleWidgets();
      setWidgets(sampleWidgets);
      sampleWidgets.forEach(widget => {
        onAddWidget?.({
          type: widget.type,
          title: widget.title,
          config: widget.config,
          position: widget.position,
          size: widget.size,
        });
      });
    }
  };

  const renderEmptyState = () => (
    <View className="flex-1 items-center justify-center px-8 py-16">
      <View className="w-20 h-20 bg-gray-100 rounded-full items-center justify-center mb-6">
        <BarChart width={32} height={32} stroke="#9ca3af" />
      </View>

      <Text className="text-xl font-semibold text-gray-900 mb-2 text-center">No Widgets Yet</Text>

      <Text className="text-gray-600 text-center mb-8 leading-relaxed">
        Select from the widget gallery below to start visualizing your data with beautiful,
        interactive charts.
      </Text>

      <TouchableOpacity
        onPress={handleLoadSamples}
        className="px-6 py-3 rounded-xl flex-row items-center shadow-sm"
        style={{
          backgroundColor: '#10a37f',
          shadowColor: '#10a37f',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 2,
        }}
        activeOpacity={0.7}
      >
        <Download width={20} height={20} stroke="#ffffff" />
        <Text className="text-white font-semibold ml-2">Load Sample Widgets</Text>
      </TouchableOpacity>
    </View>
  );

  const renderHeader = () => (
    <View className="px-6 py-4 bg-white border-b border-gray-200">
      <View className="flex-row items-center justify-between mb-4">
        <View>
          <Text className="text-2xl font-bold text-secondary">Dashboard Widgets</Text>
          <Text className="text-sm text-gray-600 mt-1">{widgets.length} active widgets</Text>
        </View>

        <View className="flex-row items-center space-x-3">
          {/* Toggle View Button */}
          <TouchableOpacity
            onPress={() => setShowGallery(!showGallery)}
            className="px-4 py-2 rounded-xl border border-gray-200 bg-gray-50"
            activeOpacity={0.7}
          >
            <Text className="text-sm font-medium text-gray-700">
              {showGallery ? 'My Widgets' : 'Gallery'}
            </Text>
          </TouchableOpacity>

          {widgets.length > 0 && !showGallery && (
            <TouchableOpacity
              onPress={handleClearAllWidgets}
              className="p-3 rounded-xl bg-red-50 border border-red-200"
              activeOpacity={0.7}
              style={{
                shadowColor: '#ef4444',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 2,
                elevation: 1,
              }}
            >
              <Trash2 width={18} height={18} stroke="#ef4444" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );

  const renderWidgetGrid = () => {
    if (widgets.length === 0) {
      return renderEmptyState();
    }

    return (
      <ScrollView
        className="flex-1 bg-gray-50"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingVertical: 8 }}
      >
        {widgets.map(widget => (
          <ChartWidget
            key={widget.id}
            widget={widget}
            onDelete={handleDeleteWidget}
            onUpdate={handleUpdateWidget}
            showControls={true}
          />
        ))}

        {/* Add Space at Bottom */}
        <View className="h-6" />
      </ScrollView>
    );
  };

  return (
    <View className="flex-1 bg-gray-50">
      {showHeader && renderHeader()}

      {showGallery ? (
        <WidgetGallery
          onSelectWidget={handleAddWidget}
          maxWidgets={maxWidgets}
          currentWidgetCount={widgets.length}
          showHeader={showHeader}
        />
      ) : (
        renderWidgetGrid()
      )}
    </View>
  );
};

export default WidgetManager;
