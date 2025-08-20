import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { devtools } from 'zustand/middleware';

export interface UIStore {
  // Modal states
  showCreateModal: boolean;
  showDeleteModal: boolean;
  showWidgetManager: boolean;
  showAllWidgets: boolean;

  // Loading states
  isGlobalLoading: boolean;
  loadingOperations: Record<string, boolean>; // operationId -> isLoading

  // Error states
  globalError: string | null;
  operationErrors: Record<string, string>; // operationId -> error

  // UI state
  activeTab: string;
  sidebarOpen: boolean;

  // Data to delete (for confirmation modals)
  dashboardToDelete: string;
  widgetToDelete: string;

  // Modal Actions
  openCreateModal: () => void;
  closeCreateModal: () => void;
  openDeleteModal: (dashboardId: string) => void;
  closeDeleteModal: () => void;
  openWidgetManager: () => void;
  closeWidgetManager: () => void;
  toggleAllWidgets: () => void;

  // Loading Actions
  setGlobalLoading: (loading: boolean) => void;
  setOperationLoading: (operationId: string, loading: boolean) => void;
  clearOperationLoading: (operationId: string) => void;
  isOperationLoading: (operationId: string) => boolean;

  // Error Actions
  setGlobalError: (error: string | null) => void;
  setOperationError: (operationId: string, error: string | null) => void;
  clearOperationError: (operationId: string) => void;
  clearAllErrors: () => void;

  // UI Actions
  setActiveTab: (tab: string) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;

  // Utility Actions
  resetUI: () => void;
  closeAllModals: () => void;
}

export const useUIStore = create<UIStore>()(
  devtools(
    immer((set, get) => ({
      // Initial state
      showCreateModal: false,
      showDeleteModal: false,
      showWidgetManager: false,
      showAllWidgets: false,

      isGlobalLoading: false,
      loadingOperations: {},

      globalError: null,
      operationErrors: {},

      activeTab: 'overview',
      sidebarOpen: false,

      dashboardToDelete: '',
      widgetToDelete: '',

      // Modal Actions
      openCreateModal: () =>
        set(state => {
          state.showCreateModal = true;
        }),

      closeCreateModal: () =>
        set(state => {
          state.showCreateModal = false;
        }),

      openDeleteModal: dashboardId =>
        set(state => {
          state.showDeleteModal = true;
          state.dashboardToDelete = dashboardId;
        }),

      closeDeleteModal: () =>
        set(state => {
          state.showDeleteModal = false;
          state.dashboardToDelete = '';
        }),

      openWidgetManager: () =>
        set(state => {
          state.showWidgetManager = true;
        }),

      closeWidgetManager: () =>
        set(state => {
          state.showWidgetManager = false;
        }),

      toggleAllWidgets: () =>
        set(state => {
          state.showAllWidgets = !state.showAllWidgets;
        }),

      // Loading Actions
      setGlobalLoading: loading =>
        set(state => {
          state.isGlobalLoading = loading;
        }),

      setOperationLoading: (operationId, loading) =>
        set(state => {
          if (loading) {
            state.loadingOperations[operationId] = true;
          } else {
            delete state.loadingOperations[operationId];
          }
        }),

      clearOperationLoading: operationId =>
        set(state => {
          delete state.loadingOperations[operationId];
        }),

      isOperationLoading: operationId => {
        const state = get();
        return state.loadingOperations[operationId] || false;
      },

      // Error Actions
      setGlobalError: error =>
        set(state => {
          state.globalError = error;
        }),

      setOperationError: (operationId, error) =>
        set(state => {
          if (error) {
            state.operationErrors[operationId] = error;
          } else {
            delete state.operationErrors[operationId];
          }
        }),

      clearOperationError: operationId =>
        set(state => {
          delete state.operationErrors[operationId];
        }),

      clearAllErrors: () =>
        set(state => {
          state.globalError = null;
          state.operationErrors = {};
        }),

      // UI Actions
      setActiveTab: tab =>
        set(state => {
          state.activeTab = tab;
        }),

      toggleSidebar: () =>
        set(state => {
          state.sidebarOpen = !state.sidebarOpen;
        }),

      setSidebarOpen: open =>
        set(state => {
          state.sidebarOpen = open;
        }),

      // Utility Actions
      resetUI: () =>
        set(state => {
          state.showCreateModal = false;
          state.showDeleteModal = false;
          state.showWidgetManager = false;
          state.showAllWidgets = false;
          state.isGlobalLoading = false;
          state.loadingOperations = {};
          state.globalError = null;
          state.operationErrors = {};
          state.activeTab = 'overview';
          state.sidebarOpen = false;
          state.dashboardToDelete = '';
          state.widgetToDelete = '';
        }),

      closeAllModals: () =>
        set(state => {
          state.showCreateModal = false;
          state.showDeleteModal = false;
          state.showWidgetManager = false;
          state.dashboardToDelete = '';
          state.widgetToDelete = '';
        }),
    })),
    {
      name: 'UIStore', // DevTools name
      enabled: __DEV__, // Only enable in development
    }
  )
);

// Convenience hooks for specific UI concerns
export const useModalStore = () => {
  const {
    showCreateModal,
    showDeleteModal,
    showWidgetManager,
    showAllWidgets,
    dashboardToDelete,
    widgetToDelete,
    openCreateModal,
    closeCreateModal,
    openDeleteModal,
    closeDeleteModal,
    openWidgetManager,
    closeWidgetManager,
    toggleAllWidgets,
    closeAllModals,
  } = useUIStore();

  return {
    showCreateModal,
    showDeleteModal,
    showWidgetManager,
    showAllWidgets,
    dashboardToDelete,
    widgetToDelete,
    openCreateModal,
    closeCreateModal,
    openDeleteModal,
    closeDeleteModal,
    openWidgetManager,
    closeWidgetManager,
    toggleAllWidgets,
    closeAllModals,
  };
};

export const useLoadingStore = () => {
  const {
    isGlobalLoading,
    loadingOperations,
    setGlobalLoading,
    setOperationLoading,
    clearOperationLoading,
    isOperationLoading,
  } = useUIStore();

  return {
    isGlobalLoading,
    loadingOperations,
    setGlobalLoading,
    setOperationLoading,
    clearOperationLoading,
    isOperationLoading,
  };
};

export const useErrorStore = () => {
  const {
    globalError,
    operationErrors,
    setGlobalError,
    setOperationError,
    clearOperationError,
    clearAllErrors,
  } = useUIStore();

  return {
    globalError,
    operationErrors,
    setGlobalError,
    setOperationError,
    clearOperationError,
    clearAllErrors,
  };
};
