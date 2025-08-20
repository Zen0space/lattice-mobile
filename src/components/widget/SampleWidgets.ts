import { Widget } from './types';
import { fakeDataGenerator } from './FakeDataGenerator';
import { createChartConfig, CHART_TEMPLATES } from './ChartTemplates';

export const createSampleWidgets = (): Widget[] => {
  const now = new Date();
  
  return [
    {
      id: 'sample_1',
      type: 'chart',
      title: 'Stock Performance',
      config: createChartConfig(
        CHART_TEMPLATES[0], // Basic Line Chart
        'stock-price',
        'Stock Performance'
      ),
      createdAt: now,
      updatedAt: now,
      position: { row: 0, col: 0 },
      size: { width: 1, height: 1 },
    },
    {
      id: 'sample_2',
      type: 'chart',
      title: 'Revenue Growth',
      config: createChartConfig(
        CHART_TEMPLATES[2], // Area Chart
        'revenue',
        'Revenue Growth'
      ),
      createdAt: now,
      updatedAt: now,
      position: { row: 1, col: 0 },
      size: { width: 1, height: 1 },
    },
    {
      id: 'sample_3',
      type: 'chart',
      title: 'User Activity',
      config: createChartConfig(
        CHART_TEMPLATES[1], // Curved Line
        'user-growth',
        'User Activity'
      ),
      createdAt: now,
      updatedAt: now,
      position: { row: 2, col: 0 },
      size: { width: 1, height: 1 },
    },
  ];
};

export const loadSampleWidgets = (setSampleWidgets: (widgets: Widget[]) => void) => {
  const sampleWidgets = createSampleWidgets();
  setSampleWidgets(sampleWidgets);
};
