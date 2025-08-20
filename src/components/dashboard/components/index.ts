/**
 * Dashboard Components - Barrel Export
 * 
 * Centralized exports for all dashboard component modules.
 * These components were extracted from DashboardManager.tsx for better
 * separation of concerns and maintainability.
 */

export { default as DashboardTabs } from './DashboardTabs';
export { default as DashboardContent } from './DashboardContent';
export { default as CreateDashboardModal } from './CreateDashboardModal';
export { default as DeleteConfirmationModal } from './DeleteConfirmationModal';

// Re-export types for convenience
export type { 
  // Add component prop types here if needed for external usage
} from '../types';
