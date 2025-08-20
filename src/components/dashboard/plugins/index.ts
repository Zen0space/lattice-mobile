/**
 * Dashboard Plugin System
 *
 * Exports all plugin-related functionality including:
 * - Plugin registry for managing plugins
 * - Core plugins that provide essential functionality
 * - Plugin utilities and hooks
 * - Plugin types and interfaces
 */

// Registry and utilities
export {
  default as DashboardPluginRegistry,
  pluginRegistry,
  RegisterPlugin,
  usePlugins,
} from './DashboardPluginRegistry';

// Core plugins
export { CORE_PLUGINS, registerCorePlugins } from './CorePlugins';

// Re-export plugin types from DashboardRenderer
export type { DashboardPlugin, DashboardPluginProps, DashboardTheme } from '../DashboardRenderer';
