export interface ChartDataPoint {
  value: number;
  label?: string;
  labelTextStyle?: object;
  dataPointText?: string;
  dataPointColor?: string;
  hideDataPoint?: boolean;
  dataPointHeight?: number;
  dataPointWidth?: number;
  dataPointRadius?: number;
  showStrip?: boolean;
  stripHeight?: number;
  stripColor?: string;
  stripOpacity?: number;
  spacing?: number;
  date?: string;
  timestamp?: number;
}

export interface ChartConfig {
  id: string;
  title: string;
  chartType: 'line' | 'area' | 'curved' | 'step';
  data: ChartDataPoint[];
  width?: number;
  height?: number;
  color?: string;
  thickness?: number;
  curved?: boolean;
  areaChart?: boolean;
  stepChart?: boolean;
  showDataPoints?: boolean;
  dataPointsColor?: string;
  dataPointsRadius?: number;
  startFillColor?: string;
  endFillColor?: string;
  startOpacity?: number;
  endOpacity?: number;
  showVerticalLines?: boolean;
  showHorizontalLines?: boolean;
  yAxisThickness?: number;
  xAxisThickness?: number;
  yAxisColor?: string;
  xAxisColor?: string;
  yAxisTextStyle?: object;
  xAxisTextStyle?: object;
  backgroundColor?: string;
  animateOnDataChange?: boolean;
  animationDuration?: number;
  maxValue?: number;
  minValue?: number;
  noOfSections?: number;
  spacing?: number;
  initialSpacing?: number;
  endSpacing?: number;
}

export interface Widget {
  id: string;
  type: 'chart' | 'crypto-price' | 'crypto-market' | 'crypto-gainers' | 'crypto-portfolio';
  title: string;
  config: ChartConfig | CryptoWidgetConfig;
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

export interface CryptoWidgetConfig {
  id: string;
  title: string;
  widgetType: 'price' | 'market' | 'gainers' | 'portfolio';
  cryptoSymbols?: string[]; // For price widgets
  timeframe?: '24h' | '7d' | '30d'; // For market data
  displayMode?: 'list' | 'grid' | 'compact';
  showChange?: boolean;
  showVolume?: boolean;
  showMarketCap?: boolean;
  maxItems?: number;
}

export interface WidgetManagerProps {
  widgets?: Widget[];
  onAddWidget?: (widget: Omit<Widget, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onDeleteWidget?: (widgetId: string) => void;
  onUpdateWidget?: (widgetId: string, updates: Partial<Widget>) => void;
  maxWidgets?: number;
  gridCols?: number;
  showHeader?: boolean;
}

export interface ChartWidgetProps {
  widget: Widget;
  onDelete: (widgetId: string) => void;
  onUpdate?: (widgetId: string, updates: Partial<Widget>) => void;
  showControls?: boolean;
}

export type ChartType = 'line' | 'area' | 'curved' | 'step';

export interface ChartTemplate {
  type: ChartType;
  name: string;
  description: string;
  icon: string;
  defaultConfig: Partial<ChartConfig>;
}

export interface FakeDataGenerator {
  generateLineData: (points: number, options?: {
    min?: number;
    max?: number;
    trend?: 'up' | 'down' | 'random' | 'wave';
    volatility?: number;
    startValue?: number;
  }) => ChartDataPoint[];
  generateTimeSeriesData: (points: number, options?: {
    startDate?: Date;
    interval?: 'hour' | 'day' | 'week' | 'month';
    min?: number;
    max?: number;
    trend?: 'up' | 'down' | 'random' | 'wave';
    volatility?: number;
  }) => ChartDataPoint[];
}
