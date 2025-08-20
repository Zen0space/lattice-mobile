/**
 * Common Types and Interfaces
 *
 * Consolidated common interfaces used across multiple modules
 * to reduce duplication and improve maintainability.
 */

// Base entity interface
export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

// Common loading and error states
export interface LoadingState {
  isLoading: boolean;
  error: string | null;
}

// Common pagination interface
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
}

// Common response wrapper
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Theme-related types
export type ThemeMode = 'light' | 'dark' | 'auto';
export type ColorVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';

// Size variants
export type SizeVariant = 'small' | 'medium' | 'large';

// Common component props
export interface BaseComponentProps {
  className?: string;
  testID?: string;
}

// Async operation states
export type AsyncState = 'idle' | 'pending' | 'success' | 'error';

// Sort order
export type SortOrder = 'asc' | 'desc';

// Common filter interface
export interface Filter {
  field: string;
  value: any;
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'contains' | 'in';
}

// Common sort interface
export interface Sort {
  field: string;
  order: SortOrder;
}
