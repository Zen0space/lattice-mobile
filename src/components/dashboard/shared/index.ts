/**
 * Shared dashboard components
 * Phase 3.1 Component Consolidation & Shared Components
 */

// Original shared components
export { default as ActionButton } from './ActionButton';
export { default as DashboardContainer } from './DashboardContainer';
export { default as DashboardWidget } from './DashboardWidget';
export { default as PlaceholderDashboard } from './PlaceholderDashboard';
export { default as OptimizedAssetList } from './OptimizedAssetList';
export { default as OptimizedActivityList } from './OptimizedActivityList';

// New Phase 3.1 shared components
export { default as StatCard, StatCardSkeleton, StatCardError } from './StatCard';
export type { StatCardProps, StatCardData } from './StatCard';

export { default as AssetCard, AssetCardSkeleton } from './AssetCard';
export type { AssetCardProps } from './AssetCard';

export { 
  default as SectionHeader, 
  SectionHeaderSkeleton,
  WelcomeHeader,
  PortfolioHeader,
  AssetsHeader,
  ActivityHeader,
  AnalyticsHeader,
} from './SectionHeader';
export type { SectionHeaderProps } from './SectionHeader';

export { 
  default as DataRenderer,
  AssetDataRenderer,
  ActivityDataRenderer,
  ValidatedDataRenderer,
} from './DataRenderer';
export type { DataRendererProps } from './DataRenderer';
