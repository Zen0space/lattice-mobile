// Widget System Components
export { default as WidgetManager } from './WidgetManager';
export { default as ChartWidget } from './ChartWidget';
export { default as CryptoWidget } from './CryptoWidget';
export { default as AddWidgetModal } from './AddWidgetModal';
export { default as WidgetGallery } from './WidgetGallery';

// Data and Configuration
export { fakeDataGenerator } from './FakeDataGenerator';
export { CHART_TEMPLATES, CHART_DATA_PRESETS, createChartConfig } from './ChartTemplates';
export { CRYPTO_TEMPLATES, CRYPTO_DATA_PRESETS, createCryptoConfig } from './CryptoTemplates';
export { createSampleWidgets, loadSampleWidgets } from './SampleWidgets';

// Types
export type {
  Widget,
  ChartConfig,
  CryptoWidgetConfig,
  ChartDataPoint,
  WidgetManagerProps,
  ChartWidgetProps,
  ChartType,
  ChartTemplate,
  FakeDataGenerator,
} from './types';
