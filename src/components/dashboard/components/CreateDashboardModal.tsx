import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  TextInput,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  X,
  Home,
  TrendingUp,
  BarChart2,
  PieChart,
  Eye,
  Activity,
  Zap,
} from 'react-native-feather';
import { DashboardType, DashboardTemplate } from '../types';
import { DASHBOARD_TEMPLATES } from '../DashboardTemplates';

// Icon mapping for template selection
const ICON_MAP = {
  home: Home,
  'trending-up': TrendingUp,
  'bar-chart-2': BarChart2,
  'pie-chart': PieChart,
  eye: Eye,
  activity: Activity,
  zap: Zap,
};

interface CreateDashboardModalProps {
  visible: boolean;
  onClose: () => void;
  onCreateDashboard: (name: string, template: DashboardType) => void;
}

/**
 * CreateDashboardModal Component
 * 
 * Handles the dashboard creation modal with template selection.
 * Extracted from DashboardManager.tsx for better separation of concerns.
 * 
 * Features:
 * - Modal presentation with proper animations
 * - Dashboard name input with validation
 * - Template selection with visual feedback
 * - Form validation and error handling
 * - Proper accessibility support
 * - Clean, focused UI for dashboard creation
 */
const CreateDashboardModal: React.FC<CreateDashboardModalProps> = ({
  visible,
  onClose,
  onCreateDashboard,
}) => {
  const [dashboardName, setDashboardName] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<DashboardType>('overview');

  const handleCreateDashboard = () => {
    if (dashboardName.trim()) {
      onCreateDashboard(dashboardName.trim(), selectedTemplate);
      // Reset form state
      setDashboardName('');
      setSelectedTemplate('overview');
      onClose();
    }
  };

  const handleClose = () => {
    // Reset form state on close
    setDashboardName('');
    setSelectedTemplate('overview');
    onClose();
  };

  const renderTemplateOption = (template: DashboardTemplate) => {
    const IconComponent = ICON_MAP[template.icon as keyof typeof ICON_MAP] || Home;
    const isSelected = selectedTemplate === template.type;

    return (
      <TouchableOpacity
        key={template.type}
        onPress={() => setSelectedTemplate(template.type)}
        className={`p-4 rounded-xl border-2 mb-3 ${
          isSelected 
            ? 'border-primary bg-blue-50' 
            : 'border-gray-200 bg-white'
        }`}
        activeOpacity={0.7}
        accessibilityRole="radio"
        accessibilityState={{ checked: isSelected }}
        accessibilityLabel={`${template.name} template: ${template.description}`}
      >
        <View 
          className="w-12 h-12 rounded-lg items-center justify-center mr-4"
          style={{ backgroundColor: template.color }}
        >
          <IconComponent width={24} height={24} stroke="#ffffff" />
        </View>
        <View className="flex-1">
          <Text className={`font-semibold text-base ${isSelected ? 'text-primary' : 'text-gray-900'}`}>
            {template.name}
          </Text>
          <Text className="text-gray-600 text-sm mt-1">
            {template.description}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <SafeAreaView className="flex-1 bg-white">
        {/* Header */}
        <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
          <TouchableOpacity 
            onPress={handleClose}
            accessibilityRole="button"
            accessibilityLabel="Close create dashboard modal"
          >
            <X width={24} height={24} stroke="#6B7280" />
          </TouchableOpacity>
          <Text className="text-lg font-semibold text-gray-900">Create Dashboard</Text>
          <TouchableOpacity
            onPress={handleCreateDashboard}
            className="px-4 py-2 bg-primary rounded-lg"
            disabled={!dashboardName.trim()}
            style={{ 
              opacity: dashboardName.trim() ? 1 : 0.5 
            }}
            accessibilityRole="button"
            accessibilityLabel="Create dashboard"
            accessibilityState={{ disabled: !dashboardName.trim() }}
          >
            <Text className="text-white font-medium">Create</Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <ScrollView className="flex-1 px-4 py-6">
          {/* Dashboard Name Input */}
          <View className="mb-6">
            <Text className="text-base font-medium text-gray-900 mb-3">Dashboard Name</Text>
            <TextInput
              value={dashboardName}
              onChangeText={setDashboardName}
              placeholder="Enter dashboard name"
              className="w-full p-4 border border-gray-300 rounded-xl text-base"
              autoFocus
              returnKeyType="done"
              onSubmitEditing={handleCreateDashboard}
              accessibilityLabel="Dashboard name input"
              accessibilityHint="Enter a name for your new dashboard"
            />
            {dashboardName.trim().length === 0 && dashboardName.length > 0 && (
              <Text className="text-red-500 text-sm mt-1">Dashboard name cannot be empty</Text>
            )}
          </View>

          {/* Template Selection */}
          <View className="mb-6">
            <Text className="text-base font-medium text-gray-900 mb-4">Choose Template</Text>
            {Object.values(DASHBOARD_TEMPLATES).map(renderTemplateOption)}
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

export default CreateDashboardModal;
