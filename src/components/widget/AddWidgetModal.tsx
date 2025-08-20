import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView, TextInput } from 'react-native';
import { X, Plus } from 'react-native-feather';
import { CHART_TEMPLATES, CHART_DATA_PRESETS, createChartConfig } from './ChartTemplates';
import { ChartTemplate, Widget } from './types';

interface AddWidgetModalProps {
  visible: boolean;
  onClose: () => void;
  onAddWidget: (widget: Omit<Widget, 'id' | 'createdAt' | 'updatedAt'>) => void;
}

const AddWidgetModal: React.FC<AddWidgetModalProps> = ({ visible, onClose, onAddWidget }) => {
  const [selectedTemplate, setSelectedTemplate] = useState<ChartTemplate | null>(null);
  const [selectedDataPreset, setSelectedDataPreset] =
    useState<keyof typeof CHART_DATA_PRESETS>('random');
  const [widgetTitle, setWidgetTitle] = useState('');
  const [step, setStep] = useState<'template' | 'data' | 'customize'>('template');

  const handleClose = () => {
    setStep('template');
    setSelectedTemplate(null);
    setSelectedDataPreset('random');
    setWidgetTitle('');
    onClose();
  };

  const handleTemplateSelect = (template: ChartTemplate) => {
    setSelectedTemplate(template);
    setWidgetTitle(template.name);
    setStep('data');
  };

  const handleDataPresetSelect = (presetKey: keyof typeof CHART_DATA_PRESETS) => {
    setSelectedDataPreset(presetKey);
    setStep('customize');
  };

  const handleCreateWidget = () => {
    if (!selectedTemplate) return;

    const config = createChartConfig(selectedTemplate, selectedDataPreset, widgetTitle);

    const newWidget: Omit<Widget, 'id' | 'createdAt' | 'updatedAt'> = {
      type: 'chart',
      title: widgetTitle,
      config,
      position: { row: 0, col: 0 }, // Will be managed by parent
      size: { width: 1, height: 1 },
    };

    onAddWidget(newWidget);
    handleClose();
  };

  const renderTemplateSelection = () => (
    <View>
      <Text className="text-xl font-bold text-gray-900 mb-2">Choose Chart Type</Text>
      <Text className="text-gray-600 mb-6">Select the type of chart you want to create</Text>

      <ScrollView showsVerticalScrollIndicator={false}>
        {CHART_TEMPLATES.map(template => (
          <TouchableOpacity
            key={template.type}
            onPress={() => handleTemplateSelect(template)}
            className="bg-gray-50 rounded-xl p-4 mb-3 border border-gray-200"
            activeOpacity={0.7}
          >
            <View className="flex-row items-center">
              <View className="w-12 h-12 bg-white rounded-lg items-center justify-center mr-4 shadow-sm">
                <Text className="text-2xl">{template.icon}</Text>
              </View>
              <View className="flex-1">
                <Text className="text-lg font-semibold text-gray-900 mb-1">{template.name}</Text>
                <Text className="text-sm text-gray-600">{template.description}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderDataSelection = () => (
    <View>
      <Text className="text-xl font-bold text-gray-900 mb-2">Choose Data Type</Text>
      <Text className="text-gray-600 mb-6">Select the type of data for your chart</Text>

      <ScrollView showsVerticalScrollIndicator={false}>
        {Object.entries(CHART_DATA_PRESETS).map(([key, preset]) => (
          <TouchableOpacity
            key={key}
            onPress={() => handleDataPresetSelect(key as keyof typeof CHART_DATA_PRESETS)}
            className={`rounded-xl p-4 mb-3 border ${
              selectedDataPreset === key
                ? 'bg-blue-50 border-blue-200'
                : 'bg-gray-50 border-gray-200'
            }`}
            activeOpacity={0.7}
          >
            <Text className="text-lg font-semibold text-gray-900 mb-1">{preset.name}</Text>
            <Text className="text-sm text-gray-600">{preset.description}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderCustomization = () => (
    <View>
      <Text className="text-xl font-bold text-gray-900 mb-2">Customize Widget</Text>
      <Text className="text-gray-600 mb-6">Give your widget a name and finalize settings</Text>

      <View className="mb-6">
        <Text className="text-sm font-medium text-gray-700 mb-2">Widget Title</Text>
        <TextInput
          value={widgetTitle}
          onChangeText={setWidgetTitle}
          placeholder="Enter widget title"
          className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-900"
          placeholderTextColor="#9ca3af"
        />
      </View>

      {selectedTemplate && (
        <View className="bg-gray-50 rounded-xl p-4 mb-6">
          <Text className="text-sm font-medium text-gray-700 mb-2">Preview</Text>
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-lg font-semibold text-gray-900">
                {widgetTitle || 'Untitled Widget'}
              </Text>
              <Text className="text-sm text-gray-600">
                {selectedTemplate.name} • {CHART_DATA_PRESETS[selectedDataPreset].name}
              </Text>
            </View>
            <Text className="text-2xl">{selectedTemplate.icon}</Text>
          </View>
        </View>
      )}
    </View>
  );

  const renderStepContent = () => {
    switch (step) {
      case 'template':
        return renderTemplateSelection();
      case 'data':
        return renderDataSelection();
      case 'customize':
        return renderCustomization();
      default:
        return renderTemplateSelection();
    }
  };

  const renderFooter = () => (
    <View className="flex-row items-center justify-between pt-4 border-t border-gray-200">
      {step !== 'template' ? (
        <TouchableOpacity
          onPress={() => {
            if (step === 'data') setStep('template');
            else if (step === 'customize') setStep('data');
          }}
          className="px-4 py-2 rounded-lg bg-gray-100"
          activeOpacity={0.7}
        >
          <Text className="text-gray-700 font-medium">Back</Text>
        </TouchableOpacity>
      ) : (
        <View />
      )}

      <View className="flex-row items-center space-x-3">
        <TouchableOpacity
          onPress={handleClose}
          className="px-4 py-2 rounded-lg bg-gray-100"
          activeOpacity={0.7}
        >
          <Text className="text-gray-700 font-medium">Cancel</Text>
        </TouchableOpacity>

        {step === 'customize' && (
          <TouchableOpacity
            onPress={handleCreateWidget}
            className="px-6 py-2 rounded-lg bg-blue-600 flex-row items-center"
            activeOpacity={0.7}
            disabled={!widgetTitle.trim()}
          >
            <Plus width={16} height={16} stroke="#ffffff" />
            <Text className="text-white font-medium ml-2">Create Widget</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View className="flex-1 bg-white">
        {/* Header */}
        <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
          <Text className="text-lg font-semibold text-gray-900">Add New Widget</Text>
          <TouchableOpacity
            onPress={handleClose}
            className="p-2 rounded-full bg-gray-100"
            activeOpacity={0.7}
          >
            <X width={20} height={20} stroke="#6b7280" />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
          {renderStepContent()}
        </ScrollView>

        {/* Footer */}
        <View className="p-4 bg-white">{renderFooter()}</View>
      </View>
    </Modal>
  );
};

export default AddWidgetModal;
