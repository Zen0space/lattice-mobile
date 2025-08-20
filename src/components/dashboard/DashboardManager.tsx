import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  Alert,
  Modal,
  TextInput,
  Animated,
} from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Plus,
  X,
  Edit3,
  Trash2,
  Settings,
  MoreHorizontal,
  Home,
  TrendingUp,
  BarChart2,
  PieChart,
  Eye,
  Activity,
  Zap,
} from 'react-native-feather';
import { DashboardConfig, DashboardType, DashboardTemplate } from './types';
import { DASHBOARD_TEMPLATES } from './DashboardTemplates';
import { DashboardStorage } from '../../utils/DashboardStorage';
import OverviewDashboard from './OverviewDashboard';

import StocksDashboard from './StocksDashboard';
import PortfolioDashboard from './PortfolioDashboard';
import WatchlistDashboard from './WatchlistDashboard';
import AnalyticsDashboard from './AnalyticsDashboard';
import TradingDashboard from './TradingDashboard';

const { width } = Dimensions.get('window');

interface DashboardManagerProps {
  onBack?: () => void;
}

const ICON_MAP = {
  home: Home,
  'trending-up': TrendingUp,
  'bar-chart-2': BarChart2,
  'pie-chart': PieChart,
  eye: Eye,
  activity: Activity,
  zap: Zap,
};

const DashboardManager: React.FC<DashboardManagerProps> = ({ onBack }) => {
  const [dashboards, setDashboards] = useState<DashboardConfig[]>([]);
  const [activeDashboardId, setActiveDashboardId] = useState<string>('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [dashboardToDelete, setDashboardToDelete] = useState<string>('');
  const [dashboardWidgetCount, setDashboardWidgetCount] = useState<number>(0);
  const [newDashboardName, setNewDashboardName] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<DashboardType>('overview');
  
  // Animated values for delete modal
  const deleteModalOpacity = useRef(new Animated.Value(0)).current;
  const deleteModalScale = useRef(new Animated.Value(0.8)).current;

  // Load dashboards from storage and initialize defaults if needed
  useEffect(() => {
    loadDashboards();
  }, []);

  const loadDashboards = async () => {
    try {
      const savedDashboards = await DashboardStorage.loadDashboards();
      
      if (savedDashboards.length === 0) {
        // Initialize default dashboards if none exist
        const defaultDashboards: DashboardConfig[] = [
          {
            id: 'overview-default',
            name: 'Overview',
            type: 'overview',
            icon: 'home',
            color: '#10a37f',
            isDefault: true,
            createdAt: new Date(),
            lastAccessed: new Date(),
            settings: DASHBOARD_TEMPLATES.overview.defaultSettings,
          },
    ];
    
    await DashboardStorage.saveDashboards(defaultDashboards);
    setDashboards(defaultDashboards);
    await DashboardStorage.setActiveDashboard('overview-default');
    setActiveDashboardId('overview-default');
      } else {
        // Load existing dashboards
        setDashboards(savedDashboards);
        const activeDashboard = await DashboardStorage.getActiveDashboard();
        if (activeDashboard) {
          setActiveDashboardId(activeDashboard);
        } else if (savedDashboards.length > 0) {
          setActiveDashboardId(savedDashboards[0].id);
          await DashboardStorage.setActiveDashboard(savedDashboards[0].id);
        }
      }
    } catch (error) {
      console.error('Error loading dashboards:', error);
      Alert.alert('Error', 'Failed to load dashboards');
    }
  };

  const handleCreateDashboard = async () => {
    if (!newDashboardName.trim()) {
      Alert.alert('Error', 'Please enter a dashboard name');
      return;
    }

    try {
      const template = DASHBOARD_TEMPLATES[selectedTemplate];
      const newDashboard: DashboardConfig = {
        id: `${selectedTemplate}-${Date.now()}`,
        name: newDashboardName.trim(),
        type: selectedTemplate,
        icon: template.icon,
        color: template.color,
        isDefault: false,
        createdAt: new Date(),
        lastAccessed: new Date(),
        settings: { ...template.defaultSettings },
      };

      await DashboardStorage.saveDashboard(newDashboard);
      setDashboards(prev => [...prev, newDashboard]);
      setActiveDashboardId(newDashboard.id);
      await DashboardStorage.setActiveDashboard(newDashboard.id);
      setShowCreateModal(false);
      setNewDashboardName('');
      setSelectedTemplate('overview');
    } catch (error) {
      console.error('Error creating dashboard:', error);
      Alert.alert('Error', 'Failed to create dashboard');
    }
  };

  // Animation functions for delete modal
  const showDeleteModalWithAnimation = () => {
    setShowDeleteModal(true);
    Animated.parallel([
      Animated.timing(deleteModalOpacity, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.spring(deleteModalScale, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const hideDeleteModalWithAnimation = (callback?: () => void) => {
    Animated.parallel([
      Animated.timing(deleteModalOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.spring(deleteModalScale, {
        toValue: 0.8,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowDeleteModal(false);
      deleteModalOpacity.setValue(0);
      deleteModalScale.setValue(0.8);
      callback?.();
    });
  };

  const handleDeleteDashboard = async (dashboardId: string) => {
    const dashboard = dashboards.find(d => d.id === dashboardId);
    if (dashboard?.isDefault) {
      Alert.alert('Cannot Delete', 'Default dashboards cannot be deleted');
      return;
    }

    try {
      // CRITICAL: Check widget count BEFORE showing delete modal
      console.log(`🔍 Checking widgets for dashboard: ${dashboard?.name} (${dashboardId})`);
      const widgets = await DashboardStorage.loadDashboardWidgets(dashboardId);
      const widgetCount = widgets.length;
      
      console.log(`📊 Dashboard "${dashboard?.name}" has ${widgetCount} widgets`);
      
      setDashboardToDelete(dashboardId);
      setDashboardWidgetCount(widgetCount);
      showDeleteModalWithAnimation();
    } catch (error) {
      console.error('❌ Error checking dashboard widgets:', error);
      Alert.alert('Error', 'Failed to check dashboard status. Please try again.');
    }
  };

  const confirmDeleteDashboard = async () => {
    try {
      hideDeleteModalWithAnimation(async () => {
        try {
          const dashboardName = dashboards.find(d => d.id === dashboardToDelete)?.name || dashboardToDelete;
          
          // PHASE 0: PRE-DELETION DASHBOARD SWITCH (if deleting active dashboard)
          if (activeDashboardId === dashboardToDelete) {
            console.log(`🔄 PHASE 0: Switching away from active dashboard "${dashboardName}" before deletion`);
            
            // Find default dashboard to switch to
            const defaultDashboard = dashboards.find(d => d.id === 'overview-default' && d.id !== dashboardToDelete);
            const fallbackDashboard = dashboards.find(d => d.type === 'overview' && d.id !== dashboardToDelete);
            const anyOtherDashboard = dashboards.find(d => d.id !== dashboardToDelete);
            
            const switchToDashboard = defaultDashboard || fallbackDashboard || anyOtherDashboard;
            
            if (switchToDashboard) {
              console.log(`  🎯 Switching to dashboard: "${switchToDashboard.name}" (${switchToDashboard.id})`);
              
              // Switch dashboard immediately
              setActiveDashboardId(switchToDashboard.id);
              await DashboardStorage.setActiveDashboard(switchToDashboard.id);
              
              // Wait for UI to update
              await new Promise(resolve => setTimeout(resolve, 200));
              
              console.log(`✅ PHASE 0 COMPLETE: Successfully switched to "${switchToDashboard.name}"`);
            } else {
              console.warn(`⚠️ PHASE 0 WARNING: No other dashboard available to switch to`);
            }
          } else {
            console.log(`📝 PHASE 0 SKIPPED: Not deleting the active dashboard`);
          }
          
          // PHASE 1: SYSTEMATIC WIDGET CLEARING (if widgets exist)
          if (dashboardWidgetCount > 0) {
            console.log(`🧹 PHASE 1: Clearing ${dashboardWidgetCount} widgets from dashboard "${dashboardName}"`);
            
            // Clear widgets one by one for better tracking
            const widgets = await DashboardStorage.loadDashboardWidgets(dashboardToDelete);
            for (let i = 0; i < widgets.length; i++) {
              const widget = widgets[i];
              console.log(`  🗑️ Clearing widget ${i + 1}/${widgets.length}: "${widget.title}" (${widget.type})`);
            }
            
            // Clear all widgets at once
            await DashboardStorage.clearDashboardWidgets(dashboardToDelete);
            console.log(`✅ PHASE 1 COMPLETE: All ${dashboardWidgetCount} widgets cleared from "${dashboardName}"`);
            
            // Wait a moment to ensure clearing is complete
            await new Promise(resolve => setTimeout(resolve, 100));
          } else {
            console.log(`📝 PHASE 1 SKIPPED: No widgets to clear from "${dashboardName}"`);
          }
          
          // PHASE 2: DASHBOARD DELETION
          console.log(`🗑️ PHASE 2: Deleting dashboard "${dashboardName}"`);
          const wasActiveDashboard = await DashboardStorage.deleteDashboard(dashboardToDelete);
          
          // Update local state - filter out the deleted dashboard
          const updatedDashboards = dashboards.filter(d => d.id !== dashboardToDelete);
          
          // PHASE 3: FINAL DASHBOARD STATE UPDATE
          console.log(`🔄 PHASE 3: Updating dashboard state after deletion`);
          
          // The active dashboard should already be switched in Phase 0 if needed
          // But we still need to handle the case where deletion wasn't from active dashboard
          let newActiveDashboardId = activeDashboardId;
          
          // Double-check: if somehow we still have the deleted dashboard as active
          if (activeDashboardId === dashboardToDelete) {
            console.log(`⚠️ PHASE 3: Active dashboard still matches deleted dashboard - finding fallback`);
            
            if (updatedDashboards.length > 0) {
              const defaultDashboard = updatedDashboards.find(d => d.id === 'overview-default');
              const overviewDashboard = updatedDashboards.find(d => d.type === 'overview');
              newActiveDashboardId = defaultDashboard?.id || overviewDashboard?.id || updatedDashboards[0]?.id || '';
              
              if (newActiveDashboardId) {
                await DashboardStorage.setActiveDashboard(newActiveDashboardId);
                console.log(`✅ PHASE 3: Emergency switch to dashboard: ${newActiveDashboardId}`);
              }
            } else {
              newActiveDashboardId = '';
              await DashboardStorage.setActiveDashboard(null);
              console.log(`⚠️ PHASE 3: No dashboards remaining`);
            }
          } else {
            console.log(`📝 PHASE 3: Active dashboard unchanged (${activeDashboardId})`);
          }
          
          // ATOMIC UPDATE: Update both dashboards and activeDashboardId together
          // This prevents the race condition where activeDashboard becomes undefined
          setDashboards(updatedDashboards);
          setActiveDashboardId(newActiveDashboardId);
          
          setDashboardToDelete('');
          console.log('✅ Dashboard deletion completed successfully');
        } catch (deletionError) {
          console.error('Error during dashboard deletion:', deletionError);
          Alert.alert('Error', 'Failed to delete dashboard. Please try again.');
        }
      });
    } catch (error) {
      console.error('Error with delete modal animation:', error);
      hideDeleteModalWithAnimation();
      Alert.alert('Error', 'Failed to delete dashboard');
    }
  };

  const switchDashboard = async (dashboardId: string) => {
    try {
      setActiveDashboardId(dashboardId);
      await DashboardStorage.setActiveDashboard(dashboardId);
      
      // Update last accessed time
      const dashboard = dashboards.find(d => d.id === dashboardId);
      if (dashboard) {
        const updatedDashboard = {
          ...dashboard,
          lastAccessed: new Date(),
        };
        await DashboardStorage.saveDashboard(updatedDashboard);
        setDashboards(prev => 
          prev.map(d => 
            d.id === dashboardId 
              ? { ...d, lastAccessed: new Date() }
              : d
          )
        );
      }
    } catch (error) {
      console.error('Error switching dashboard:', error);
    }
  };

  const renderDashboardContent = () => {
    const activeDashboard = dashboards.find(d => d.id === activeDashboardId);
    
    // Enhanced error handling for undefined activeDashboard
    if (!activeDashboard) {
      console.warn(`⚠️ Active dashboard not found: ${activeDashboardId}, available dashboards:`, dashboards.map(d => d.id));
      
      // Fallback: Try to find any available dashboard
      if (dashboards.length > 0) {
        const fallbackDashboard = dashboards.find(d => d.type === 'overview') || dashboards[0];
        console.log(`🔄 Falling back to dashboard: ${fallbackDashboard.id}`);
        setActiveDashboardId(fallbackDashboard.id);
        DashboardStorage.setActiveDashboard(fallbackDashboard.id);
        return null; // Will re-render with correct dashboard
      }
      
      // No dashboards available - show empty state
      return (
        <View className="flex-1 items-center justify-center p-4 bg-gray-50">
          <Text className="text-lg font-semibold text-gray-900 mb-2">No Dashboards Available</Text>
          <Text className="text-gray-600 text-center mb-4">Create a new dashboard to get started</Text>
          <TouchableOpacity
            onPress={() => setShowCreateModal(true)}
            className="bg-blue-500 px-6 py-3 rounded-lg"
            activeOpacity={0.7}
          >
            <Text className="text-white font-semibold">Create Dashboard</Text>
          </TouchableOpacity>
        </View>
      );
    }

    switch (activeDashboard.type) {
      case 'overview':
        return <OverviewDashboard config={activeDashboard} />;

      case 'stocks':
        return <StocksDashboard config={activeDashboard} />;
      case 'portfolio':
        return <PortfolioDashboard config={activeDashboard} />;
      case 'watchlist':
        return <WatchlistDashboard config={activeDashboard} />;
      case 'analytics':
        return <AnalyticsDashboard config={activeDashboard} />;
      case 'trading':
        return <TradingDashboard config={activeDashboard} />;
      default:
        return <OverviewDashboard config={activeDashboard} />;
    }
  };

  const renderTemplateOption = (template: DashboardTemplate) => {
    const IconComponent = ICON_MAP[template.icon as keyof typeof ICON_MAP] || Home;
    const isSelected = selectedTemplate === template.type;

    return (
      <TouchableOpacity
        key={template.type}
        onPress={() => setSelectedTemplate(template.type)}
        className={`flex-row items-center p-4 rounded-xl border-2 mb-3 ${
          isSelected 
            ? 'border-primary bg-primary/10' 
            : 'border-gray-200 bg-white'
        }`}
        activeOpacity={0.7}
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
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'left', 'right']}>
      {/* Dashboard Tabs */}
      <View className="bg-white border-b border-gray-200">
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          className="px-4 py-3"
          contentContainerStyle={{ paddingRight: 20 }}
        >
          {dashboards.map((dashboard) => {
            const IconComponent = ICON_MAP[dashboard.icon as keyof typeof ICON_MAP] || Home;
            const isActive = dashboard.id === activeDashboardId;
            
            return (
              <View key={dashboard.id} className="mr-3">
                <TouchableOpacity
                  onPress={() => switchDashboard(dashboard.id)}
                  className={`flex-row items-center px-4 py-2 rounded-full ${
                    isActive 
                      ? 'bg-primary' 
                      : 'bg-gray-100'
                  }`}
                  activeOpacity={0.7}
                >
                  <IconComponent 
                    width={16} 
                    height={16} 
                    stroke={isActive ? '#ffffff' : '#6B7280'} 
                  />
                  <Text className={`ml-2 font-medium ${
                    isActive ? 'text-white' : 'text-gray-700'
                  }`}>
                    {dashboard.name}
                  </Text>
                  {!dashboard.isDefault && (
                    <TouchableOpacity
                      onPress={() => handleDeleteDashboard(dashboard.id)}
                      className="ml-2 p-1"
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <X width={14} height={14} stroke={isActive ? '#ffffff' : '#6B7280'} />
                    </TouchableOpacity>
                  )}
                </TouchableOpacity>
              </View>
            );
          })}
          
          {/* Add Dashboard Button */}
          <TouchableOpacity
            onPress={() => setShowCreateModal(true)}
            className="flex-row items-center px-4 py-2 rounded-full border-2 border-dashed border-gray-300 bg-white"
            activeOpacity={0.7}
          >
            <Plus width={16} height={16} stroke="#6B7280" />
            <Text className="ml-2 font-medium text-gray-700">Add</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Dashboard Content */}
      <View className="flex-1">
        {renderDashboardContent()}
      </View>

      {/* Create Dashboard Modal */}
      <Modal
        visible={showCreateModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowCreateModal(false)}
      >
        <SafeAreaView className="flex-1 bg-white">
          <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
            <TouchableOpacity onPress={() => setShowCreateModal(false)}>
              <X width={24} height={24} stroke="#6B7280" />
            </TouchableOpacity>
            <Text className="text-lg font-semibold text-gray-900">Create Dashboard</Text>
            <TouchableOpacity
              onPress={handleCreateDashboard}
              className="px-4 py-2 bg-primary rounded-lg"
            >
              <Text className="text-white font-medium">Create</Text>
            </TouchableOpacity>
          </View>

          <ScrollView className="flex-1 px-4 py-6">
            <View className="mb-6">
              <Text className="text-base font-medium text-gray-900 mb-3">Dashboard Name</Text>
              <TextInput
                value={newDashboardName}
                onChangeText={setNewDashboardName}
                placeholder="Enter dashboard name"
                className="w-full p-4 border border-gray-300 rounded-xl text-base"
                autoFocus
              />
            </View>

            <View className="mb-6">
              <Text className="text-base font-medium text-gray-900 mb-4">Choose Template</Text>
              {Object.values(DASHBOARD_TEMPLATES).map(renderTemplateOption)}
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Enhanced Delete Confirmation Modal with Proper Animations */}
      {showDeleteModal && (
        <Modal
          visible={showDeleteModal}
          transparent
          animationType="none"
          onRequestClose={() => hideDeleteModalWithAnimation()}
        >
          <Animated.View 
            className="flex-1 items-center justify-center px-4"
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              opacity: deleteModalOpacity,
            }}
          >
            <Animated.View 
              className="bg-white rounded-2xl p-6 w-full max-w-sm"
              style={{
                transform: [{ scale: deleteModalScale }],
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 10 },
                shadowOpacity: 0.25,
                shadowRadius: 20,
                elevation: 10,
              }}
            >
              <View className="items-center mb-4">
                                  <View className="w-16 h-16 bg-red-100 rounded-full items-center justify-center mb-4">
                    <X width={32} height={32} stroke="#ef4444" />
                  </View>
                  <Text className="text-xl font-bold text-gray-900 mb-2">Delete Dashboard</Text>
                  
                  {/* Active Dashboard Warning */}
                  {activeDashboardId === dashboardToDelete && (
                    <View className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <Text className="text-blue-800 text-center font-semibold text-sm mb-1">
                        📱 Currently Active Dashboard
                      </Text>
                      <Text className="text-blue-600 text-center text-xs">
                        You'll be automatically switched to the Overview dashboard first
                      </Text>
                    </View>
                  )}
                  
                  {dashboardWidgetCount > 0 ? (
                    <View className="mb-4">
                      <Text className="text-gray-800 text-center font-semibold mb-2">
                        ⚠️ This dashboard contains {dashboardWidgetCount} widget{dashboardWidgetCount !== 1 ? 's' : ''}
                      </Text>
                      <Text className="text-gray-600 text-center leading-5 mb-2">
                        All widgets will be <Text className="font-semibold text-red-600">permanently deleted first</Text>, then the dashboard will be removed.
                      </Text>
                      <Text className="text-gray-500 text-center text-sm">
                        This action cannot be undone.
                      </Text>
                    </View>
                  ) : (
                    <Text className="text-gray-600 text-center leading-5">
                      Are you sure you want to delete this dashboard? This action cannot be undone.
                    </Text>
                  )}
              </View>
              
              <View className="flex-row gap-3">
                <TouchableOpacity
                  onPress={() => hideDeleteModalWithAnimation()}
                  className="flex-1 bg-gray-100 py-3 px-4 rounded-xl"
                  activeOpacity={0.7}
                >
                  <Text className="text-gray-700 font-semibold text-center">Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={confirmDeleteDashboard}
                  className="flex-1 bg-red-500 py-3 px-4 rounded-xl"
                  activeOpacity={0.7}
                >
                  <Text className="text-white font-semibold text-center">Delete</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </Animated.View>
        </Modal>
      )}
    </SafeAreaView>
  );
};

export default DashboardManager;
