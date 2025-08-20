import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { DashboardConfig } from '../types';
import { dashboardStorage } from '../../../stores/storage';
import { DynamicDashboardRenderer } from '../../../utils/core/dynamicImports';

interface DashboardContentProps {
  dashboards: DashboardConfig[];
  activeDashboardId: string;
  onSetActiveDashboard: (dashboardId: string) => void;
  onCreateDashboard: () => void;
}

/**
 * DashboardContent Component
 * 
 * Handles the main content rendering for the active dashboard.
 * Extracted from DashboardManager.tsx for better separation of concerns.
 * 
 * Features:
 * - Safe dashboard rendering with fallback handling
 * - Development-specific error logging
 * - Auto-recovery with fallback dashboard selection
 * - Empty state handling with create dashboard action
 * - Dynamic dashboard rendering for performance
 */
const DashboardContent: React.FC<DashboardContentProps> = ({
  dashboards,
  activeDashboardId,
  onSetActiveDashboard,
  onCreateDashboard,
}) => {
  // Use refs to prevent infinite loops
  const lastAttemptedRecoveryRef = useRef<string>('');
  const isRecoveringRef = useRef(false);
  
  // Fix: Move setState logic to useEffect to prevent "setState during render" error
  useEffect(() => {
    // Prevent infinite loops by checking if we're already recovering or have recently attempted recovery
    if (isRecoveringRef.current || lastAttemptedRecoveryRef.current === activeDashboardId) {
      return;
    }

    const activeDashboard = dashboards.find(d => d.id === activeDashboardId);
    
    // Auto-recovery logic - only run once per activeDashboardId
    if (!activeDashboard && dashboards.length > 0) {
      const fallbackDashboard = dashboards.find(d => d.type === 'overview') || dashboards[0];
      
      if (__DEV__) {
        console.warn(`⚠️ Active Dashboard Not Found: ${activeDashboardId}`);
        console.warn('Available dashboards:', dashboards.map(d => ({ id: d.id, name: d.name, type: d.type })));
        if (__DEV__) {

          console.log(`🔄 Auto-recovering with fallback dashboard: ${fallbackDashboard.id}`);

        }
      }

      // Mark that we're recovering and track the attempt
      isRecoveringRef.current = true;
      lastAttemptedRecoveryRef.current = activeDashboardId;

      // Safe setState in useEffect - Zustand will handle persistence
      onSetActiveDashboard(fallbackDashboard.id);

      // Reset recovery flag after a short delay
      setTimeout(() => {
        isRecoveringRef.current = false;
      }, 1000);
    } else if (activeDashboard) {
      // Reset recovery tracking if we have a valid dashboard
      lastAttemptedRecoveryRef.current = '';
      isRecoveringRef.current = false;
    }
  }, [dashboards, activeDashboardId]);
  
  const renderDashboardContent = () => {
    // Simplified state validation
    if (__DEV__) {
      if (__DEV__) {

        console.log('🔄 Dashboard state updated:', { activeDashboardId, dashboardCount: dashboards.length });

      }
    }

    const activeDashboard = dashboards.find(d => d.id === activeDashboardId);
    
    // Enhanced error handling for undefined activeDashboard
    if (!activeDashboard) {
      // Development-specific fallback handled in useEffect above
      if (dashboards.length > 0) {
        return null; // Will re-render with correct dashboard from useEffect
      }
      
      // No dashboards available - enhanced empty state with development info
      return (
        <View className="flex-1 items-center justify-center p-4 bg-gray-50">
          <Text className="text-lg font-semibold text-gray-900 mb-2">No Dashboards Available</Text>
          <Text className="text-gray-600 text-center mb-4">Create a new dashboard to get started</Text>
          {__DEV__ && (
            <Text className="text-yellow-600 text-xs text-center mb-4 font-mono">
              DEV: activeDashboardId = {activeDashboardId || 'null'}
            </Text>
          )}
          <TouchableOpacity
            onPress={onCreateDashboard}
            className="bg-blue-500 px-6 py-3 rounded-lg"
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Create new dashboard"
          >
            <Text className="text-white font-semibold">Create Dashboard</Text>
          </TouchableOpacity>
        </View>
      );
    }

    // Render the active dashboard using dynamic imports for better performance
    return (
      <DynamicDashboardRenderer
        dashboardType={activeDashboard.type}
        config={activeDashboard}
        key={activeDashboard.id}
      />
    );
  };

  return (
    <View className="flex-1">
      {renderDashboardContent()}
    </View>
  );
};

export default DashboardContent;
