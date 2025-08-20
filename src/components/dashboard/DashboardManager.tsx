import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Dimensions, Alert, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DashboardConfig, DashboardType } from './types';
import { preloadCriticalDashboards, monitorBundleSize } from '../../utils/core/dynamicImports';
// Import custom hooks
import { useDashboardManager, useDashboardData, useWidgetManager } from '../../hooks';
// Import stores
import { useModalStore } from '../../stores';
// Import new extracted components
import {
  DashboardTabs,
  DashboardContent,
  CreateDashboardModal,
  DeleteConfirmationModal,
} from './components';

const { width } = Dimensions.get('window');

interface DashboardManagerProps {
  onBack?: () => void;
}

// Icon mapping moved to individual components

const DashboardManager: React.FC<DashboardManagerProps> = ({ onBack }) => {
  // Custom hooks for state management
  const {
    dashboards,
    activeDashboardId,
    isLoading: dashboardLoading,
    error: dashboardError,
    createDashboard,
    deleteDashboard,
    switchDashboard,
    canDeleteDashboard,
    validateDashboardState,
  } = useDashboardManager();

  const {
    dashboardData,
    fetchDashboardData,
    refreshData,
    isLoading: dataLoading,
    error: dataError,
  } = useDashboardData();

  const {
    widgets,
    loadWidgets,
    getWidgetCount,
    isLoading: widgetLoading,
    error: widgetError,
  } = useWidgetManager();

  // UI state from Zustand store
  const {
    showCreateModal,
    showDeleteModal,
    dashboardToDelete,
    openCreateModal,
    closeCreateModal,
    openDeleteModal,
    closeDeleteModal,
  } = useModalStore();

  // Local state for widget count (dashboard-specific)
  const [dashboardWidgetCount, setDashboardWidgetCount] = useState<number>(0);

  // Combined loading state
  const isLoading = dashboardLoading || dataLoading || widgetLoading;

  // Combined error state
  const error = dashboardError || dataError || widgetError;

  // Bundle optimization: preload critical dashboards
  useEffect(() => {
    preloadCriticalDashboards();

    if (__DEV__) {
      monitorBundleSize();
    }
  }, []);

  // Animated values for delete modal
  const deleteModalOpacity = useRef(new Animated.Value(0)).current;
  const deleteModalScale = useRef(new Animated.Value(0.8)).current;

  // Handle dashboard creation using custom hook
  const handleCreateDashboard = async (name: string, template: DashboardType) => {
    await createDashboard(name, template);
    closeCreateModal();
  };

  // Animation functions for delete modal
  const showDeleteModalWithAnimation = () => {
    // Note: Modal visibility is now managed by Zustand store
    // Animation will be handled by the modal component itself
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
      closeDeleteModal();
      deleteModalOpacity.setValue(0);
      deleteModalScale.setValue(0.8);
      callback?.();
    });
  };

  // Handle dashboard deletion using custom hook
  const handleDeleteDashboard = async (dashboardId: string) => {
    const dashboard = dashboards.find((d: DashboardConfig) => d.id === dashboardId);

    if (!canDeleteDashboard(dashboardId)) {
      Alert.alert(
        'Cannot Delete',
        'Default dashboards cannot be deleted or this is the last dashboard'
      );
      return;
    }

    try {
      // Load widgets to get count for confirmation modal
      await loadWidgets(dashboardId);
      const widgetCount = getWidgetCount(dashboardId);

      if (__DEV__) {
        if (__DEV__) {
          console.log(`📊 Dashboard "${dashboard?.name}" has ${widgetCount} widgets`);
        }
      }

      openDeleteModal(dashboardId);
      setDashboardWidgetCount(widgetCount);
      showDeleteModalWithAnimation();
    } catch (error) {
      console.error('❌ Error checking dashboard widgets:', error);
      Alert.alert('Error', 'Failed to check dashboard status. Please try again.');
    }
  };

  // Confirm dashboard deletion using custom hook
  const confirmDeleteDashboard = async () => {
    try {
      hideDeleteModalWithAnimation(async () => {
        await deleteDashboard(dashboardToDelete);
        setDashboardWidgetCount(0);
      });
    } catch (error) {
      console.error('Error with delete modal animation:', error);
      hideDeleteModalWithAnimation();
      Alert.alert('Error', 'Failed to delete dashboard');
    }
  };

  // Handle dashboard switching using custom hook
  const handleSwitchDashboard = useCallback(
    async (dashboardId: string) => {
      try {
        await switchDashboard(dashboardId);
        // Only fetch data if switch was successful
        await fetchDashboardData(dashboardId);
      } catch (error) {
        // Error is already handled in switchDashboard
        if (__DEV__) {
          if (__DEV__) {
            console.log('Switch dashboard failed, skipping data fetch');
          }
        }
      }
    },
    [switchDashboard, fetchDashboardData]
  );

  // Development state validation - only run when dashboards or activeDashboardId actually change
  useEffect(() => {
    if (__DEV__) {
      validateDashboardState();
    }
  }, [dashboards.length, activeDashboardId]);

  // Display error if any hook has an error
  useEffect(() => {
    if (error) {
      console.error('Dashboard Manager Error:', error);
    }
  }, [error]);

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'left', 'right']}>
      {/* Dashboard Tabs - Extracted Component */}
      <DashboardTabs
        dashboards={dashboards}
        activeDashboardId={activeDashboardId}
        onSwitchDashboard={handleSwitchDashboard}
        onDeleteDashboard={handleDeleteDashboard}
        onCreateDashboard={openCreateModal}
      />

      {/* Dashboard Content - Extracted Component */}
      <DashboardContent
        dashboards={dashboards}
        activeDashboardId={activeDashboardId}
        onSetActiveDashboard={handleSwitchDashboard}
        onCreateDashboard={openCreateModal}
      />

      {/* Create Dashboard Modal - Extracted Component */}
      <CreateDashboardModal
        visible={showCreateModal}
        onClose={closeCreateModal}
        onCreateDashboard={handleCreateDashboard}
      />

      {/* Delete Confirmation Modal - Extracted Component */}
      <DeleteConfirmationModal
        visible={showDeleteModal}
        dashboardToDelete={dashboardToDelete}
        activeDashboardId={activeDashboardId}
        dashboardWidgetCount={dashboardWidgetCount}
        onClose={hideDeleteModalWithAnimation}
        onConfirmDelete={confirmDeleteDashboard}
      />
    </SafeAreaView>
  );
};

export default DashboardManager;
