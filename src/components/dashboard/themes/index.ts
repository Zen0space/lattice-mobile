/**
 * Dashboard Theme System
 * 
 * Comprehensive theme management for dashboard components including:
 * - Built-in themes (light, dark, ocean, sunset)
 * - Custom theme creation and management
 * - Theme persistence and switching
 * - Theme utilities and hooks
 */

// Theme manager and utilities
export { 
  default as DashboardThemeManager,
  themeManager,
  BUILT_IN_THEMES,
} from './DashboardThemeManager';

// Types
export type { ExtendedDashboardTheme } from './DashboardThemeManager';

// Re-export core theme type
export type { DashboardTheme } from '../DashboardRenderer';
