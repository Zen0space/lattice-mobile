/**
 * Financial Data Types
 *
 * Common financial data interfaces used across the application
 */

import { BaseEntity } from './common';

// Asset-related types
export interface Asset extends BaseEntity {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume?: number;
  marketCap?: number;
  logo?: string;
}

// Activity/Transaction types
export interface ActivityItem {
  id: string;
  type: 'buy' | 'sell' | 'dividend' | 'transfer';
  asset: string;
  amount: number;
  price?: number;
  time: string;
  fee?: number;
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Portfolio-related types
export interface PortfolioItem {
  asset: Asset;
  quantity: number;
  averagePrice: number;
  currentValue: number;
  totalReturn: number;
  totalReturnPercent: number;
}

// Chart data types
export interface ChartDataPoint {
  x: number | string | Date;
  y: number;
  timestamp?: number;
  volume?: number;
}

export type ChartTimeframe = '1D' | '1W' | '1M' | '3M' | '6M' | '1Y' | 'ALL';
export type ChartType = 'line' | 'area' | 'bar' | 'candlestick';

// Market data
export interface MarketData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  high: number;
  low: number;
  open: number;
  close: number;
  timestamp: Date;
}

// Financial statistics
export interface FinancialStats {
  totalValue: number;
  totalReturn: number;
  totalReturnPercent: number;
  dayChange: number;
  dayChangePercent: number;
  topGainer?: Asset;
  topLoser?: Asset;
}
