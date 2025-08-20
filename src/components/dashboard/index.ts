// Core dashboard components
export { default as DashboardManager } from './DashboardManager';
export { default as UnifiedDashboard } from './UnifiedDashboard';

// Legacy exports - can be removed if not used elsewhere
export { default as OverviewDashboard } from './OverviewDashboard';
export { default as PortfolioDashboard } from './PortfolioDashboard';

// Phase 3.2 Dashboard Template System ✅ NEW
export { default as DashboardRenderer } from './DashboardRenderer';
export { 
  default as DashboardConfigManager,
  dashboardConfigManager,
} from './DashboardConfigManager';

// Dashboard Templates
export { DASHBOARD_TEMPLATES } from './DashboardTemplates';

// Plugin System ✅ NEW
export * from './plugins';

// Theme System ✅ NEW
export * from './themes';

// Shared components
export * from './shared';

// Types
export * from './types';
export type { 
  DashboardLayoutConfig, 
  DashboardPreset,
} from './DashboardConfigManager';
