/**
 * Centralized Type Exports
 *
 * Main entry point for all shared types and interfaces.
 * Import from here to get access to common types across the application.
 */

// Common types
export * from './common';
export * from './financial';

// Re-export commonly used types from other modules for convenience
export type { DashboardConfig, DashboardType } from '../components/dashboard/types';
export type { Widget, ChartConfig, CryptoWidgetConfig } from '../components/widget/types';
export type { ChatMessage, ChatSession } from '../stores/storage/chatStorage';

// Navigation types (if needed)
export type RootStackParamList = {
  Home: undefined;
  Dashboard: undefined;
  WidgetDemo: undefined;
};
