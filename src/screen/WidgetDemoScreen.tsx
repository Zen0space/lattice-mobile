import React, { useState } from 'react';
import {
  View,
  SafeAreaView,
} from 'react-native';
import { WidgetManager, Widget, createSampleWidgets } from '../components/widget';

const WidgetDemoScreen: React.FC = () => {
  const [widgets, setWidgets] = useState<Widget[]>([]);

  const handleAddWidget = (newWidgetData: Omit<Widget, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newWidget: Widget = {
      ...newWidgetData,
      id: `widget_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setWidgets((prev) => [...prev, newWidget]);
  };

  const handleDeleteWidget = (widgetId: string) => {
    setWidgets((prev) => prev.filter((w) => w.id !== widgetId));
  };

  const handleUpdateWidget = (widgetId: string, updates: Partial<Widget>) => {
    setWidgets((prev) =>
      prev.map((widget) =>
        widget.id === widgetId
          ? { ...widget, ...updates, updatedAt: new Date() }
          : widget
      )
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <WidgetManager
        widgets={widgets}
        onAddWidget={handleAddWidget}
        onDeleteWidget={handleDeleteWidget}
        onUpdateWidget={handleUpdateWidget}
        maxWidgets={8}
        gridCols={1}
      />
    </SafeAreaView>
  );
};

export default WidgetDemoScreen;
