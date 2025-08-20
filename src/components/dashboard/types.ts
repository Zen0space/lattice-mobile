export interface DashboardConfig {
  id: string;
  name: string;
  type: DashboardType;
  icon: string;
  color: string;
  isDefault: boolean;
  createdAt: Date;
  lastAccessed: Date;
  settings?: DashboardSettings;
  widgets?: Widget[];
}

// Import Widget type
export interface Widget {
  id: string;
  type: 'chart' | 'crypto-price' | 'crypto-market' | 'crypto-gainers' | 'crypto-portfolio';
  title: string;
  config: any; // ChartConfig | CryptoWidgetConfig
  createdAt: Date;
  updatedAt: Date;
  position: {
    row: number;
    col: number;
  };
  size: {
    width: number;
    height: number;
  };
}

export type DashboardType = 
  | 'overview' 
  | 'stocks' 
  | 'portfolio' 
  | 'watchlist' 
  | 'analytics' 
  | 'trading';

export interface DashboardSettings {
  theme?: 'light' | 'dark';
  autoRefresh?: boolean;
  refreshInterval?: number;
  defaultTimeframe?: '1D' | '1W' | '1M' | '3M' | '1Y';
  showPriceAlerts?: boolean;
  compactMode?: boolean;
}

export interface DashboardData {
  totalValue?: number;
  totalChange?: number;
  totalChangePercent?: number;
  assets?: AssetData[];
  performance?: PerformanceData;
  alerts?: AlertData[];
}

export interface AssetData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume?: string;
  marketCap?: string;
  holdings?: number;
  value?: number;
  allocation?: number;
}

export interface PerformanceData {
  timeframe: string;
  totalReturn: number;
  totalReturnPercent: number;
  bestPerformer: AssetData;
  worstPerformer: AssetData;
  dailyPnL: number[];
  labels: string[];
}

export interface AlertData {
  id: string;
  type: 'price' | 'volume' | 'news' | 'technical';
  title: string;
  message: string;
  severity: 'low' | 'medium' | 'high';
  timestamp: Date;
  isRead: boolean;
}

export interface DashboardTemplate {
  type: DashboardType;
  name: string;
  description: string;
  icon: string;
  color: string;
  defaultSettings: DashboardSettings;
  components: string[];
}
