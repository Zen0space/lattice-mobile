import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Modal, Animated } from 'react-native';
import { X } from 'react-native-feather';

interface DeleteConfirmationModalProps {
  visible: boolean;
  dashboardToDelete: string;
  activeDashboardId: string;
  dashboardWidgetCount: number;
  onClose: () => void;
  onConfirmDelete: () => void;
}

/**
 * DeleteConfirmationModal Component
 *
 * Handles the dashboard deletion confirmation modal with animations.
 * Extracted from DashboardManager.tsx for better separation of concerns.
 *
 * Features:
 * - Animated modal presentation
 * - Active dashboard warning system
 * - Widget count display and warnings
 * - Proper confirmation flow
 * - Enhanced UX with visual feedback
 * - Accessibility support
 * - Safe deletion with user confirmation
 */
const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  visible,
  dashboardToDelete,
  activeDashboardId,
  dashboardWidgetCount,
  onClose,
  onConfirmDelete,
}) => {
  const modalOpacity = useRef(new Animated.Value(0)).current;
  const modalScale = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    if (visible) {
      // Show animation
      Animated.parallel([
        Animated.timing(modalOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(modalScale, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Hide animation
      Animated.parallel([
        Animated.timing(modalOpacity, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(modalScale, {
          toValue: 0.8,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, modalOpacity, modalScale]);

  const handleClose = () => {
    // Animate out then close
    Animated.parallel([
      Animated.timing(modalOpacity, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(modalScale, {
        toValue: 0.8,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={handleClose}>
      <Animated.View
        className="flex-1 items-center justify-center px-4"
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          opacity: modalOpacity,
        }}
      >
        <Animated.View
          className="bg-white rounded-2xl p-6 w-full max-w-sm"
          style={{
            transform: [{ scale: modalScale }],
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.25,
            shadowRadius: 20,
            elevation: 10,
          }}
        >
          <View className="items-center mb-4">
            {/* Warning Icon */}
            <View className="w-16 h-16 bg-red-100 rounded-full items-center justify-center mb-4">
              <X width={32} height={32} stroke="#ef4444" />
            </View>

            {/* Title */}
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

            {/* Widget Count Warning */}
            {dashboardWidgetCount > 0 ? (
              <View className="mb-4">
                <Text className="text-gray-800 text-center font-semibold mb-2">
                  ⚠️ This dashboard contains {dashboardWidgetCount} widget
                  {dashboardWidgetCount !== 1 ? 's' : ''}
                </Text>
                <Text className="text-gray-600 text-center leading-5 mb-2">
                  All widgets will be{' '}
                  <Text className="font-semibold text-red-600">permanently deleted first</Text>,
                  then the dashboard will be removed.
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

          {/* Action Buttons */}
          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={handleClose}
              className="flex-1 bg-gray-100 py-3 px-4 rounded-xl"
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Cancel dashboard deletion"
            >
              <Text className="text-gray-700 font-semibold text-center">Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onConfirmDelete}
              className="flex-1 bg-red-500 py-3 px-4 rounded-xl"
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Confirm dashboard deletion"
            >
              <Text className="text-white font-semibold text-center">Delete</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

export default DeleteConfirmationModal;
