import { ChartDataPoint, FakeDataGenerator } from './types';

class FakeDataGeneratorImpl implements FakeDataGenerator {
  /**
   * Generate fake line chart data with various patterns
   */
  generateLineData(
    points: number,
    options: {
      min?: number;
      max?: number;
      trend?: 'up' | 'down' | 'random' | 'wave';
      volatility?: number;
      startValue?: number;
    } = {}
  ): ChartDataPoint[] {
    const {
      min = 0,
      max = 100,
      trend = 'random',
      volatility = 0.3,
      startValue = (min + max) / 2,
    } = options;

    const data: ChartDataPoint[] = [];
    let currentValue = startValue;

    for (let i = 0; i < points; i++) {
      // Apply trend
      let trendFactor = 0;
      switch (trend) {
        case 'up':
          trendFactor = ((max - min) / points) * 0.5;
          break;
        case 'down':
          trendFactor = (-(max - min) / points) * 0.5;
          break;
        case 'wave':
          trendFactor = Math.sin((i / points) * Math.PI * 2) * (max - min) * 0.1;
          break;
        case 'random':
        default:
          trendFactor = 0;
          break;
      }

      // Add volatility
      const volatilityFactor = (Math.random() - 0.5) * (max - min) * volatility;

      // Calculate next value
      currentValue += trendFactor + volatilityFactor;

      // Ensure value stays within bounds
      currentValue = Math.max(min, Math.min(max, currentValue));

      data.push({
        value: Math.round(currentValue * 100) / 100,
        label: `P${i + 1}`, // Shorter label for basic data
        dataPointText: Math.round(currentValue).toString(),
      });
    }

    return data;
  }

  /**
   * Generate time series data with dates
   */
  generateTimeSeriesData(
    points: number,
    options: {
      startDate?: Date;
      interval?: 'hour' | 'day' | 'week' | 'month';
      min?: number;
      max?: number;
      trend?: 'up' | 'down' | 'random' | 'wave';
      volatility?: number;
    } = {}
  ): ChartDataPoint[] {
    const {
      startDate = new Date(),
      interval = 'day',
      min = 0,
      max = 100,
      trend = 'random',
      volatility = 0.3,
    } = options;

    const data = this.generateLineData(points, { min, max, trend, volatility });

    // Add time information
    const intervalMs = this.getIntervalMs(interval);

    return data.map((point, index) => {
      const date = new Date(startDate.getTime() + index * intervalMs);
      return {
        ...point,
        label: this.formatDate(date, interval),
        date: date.toISOString(),
        timestamp: date.getTime(),
      };
    });
  }

  private getIntervalMs(interval: 'hour' | 'day' | 'week' | 'month'): number {
    switch (interval) {
      case 'hour':
        return 60 * 60 * 1000;
      case 'day':
        return 24 * 60 * 60 * 1000;
      case 'week':
        return 7 * 24 * 60 * 60 * 1000;
      case 'month':
        return 30 * 24 * 60 * 60 * 1000;
      default:
        return 24 * 60 * 60 * 1000;
    }
  }

  private formatDate(date: Date, interval: 'hour' | 'day' | 'week' | 'month'): string {
    switch (interval) {
      case 'hour':
        return date.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
        });
      case 'day':
        return date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        });
      case 'week':
        return `Week ${Math.ceil(date.getDate() / 7)}`;
      case 'month':
        return date.toLocaleDateString('en-US', {
          month: 'short',
          year: 'numeric',
        });
      default:
        return date.toLocaleDateString();
    }
  }

  /**
   * Generate specific chart patterns
   */
  generateStockPriceData(points: number = 30): ChartDataPoint[] {
    return this.generateTimeSeriesData(points, {
      min: 100,
      max: 200,
      trend: 'up',
      volatility: 0.4,
      interval: 'day',
    });
  }

  generateSalesData(points: number = 12): ChartDataPoint[] {
    return this.generateTimeSeriesData(points, {
      min: 1000,
      max: 5000,
      trend: 'wave',
      volatility: 0.3,
      interval: 'month',
    });
  }

  generateUserGrowthData(points: number = 20): ChartDataPoint[] {
    return this.generateTimeSeriesData(points, {
      min: 0,
      max: 10000,
      trend: 'up',
      volatility: 0.2,
      interval: 'week',
    });
  }

  generatePerformanceData(points: number = 24): ChartDataPoint[] {
    return this.generateTimeSeriesData(points, {
      min: 60,
      max: 100,
      trend: 'random',
      volatility: 0.15,
      interval: 'hour',
    });
  }

  generateRevenueData(points: number = 7): ChartDataPoint[] {
    return this.generateTimeSeriesData(points, {
      min: 5000,
      max: 15000,
      trend: 'up',
      volatility: 0.25,
      interval: 'day',
    });
  }

  /**
   * Generate weekly data with day names (Monday-Sunday)
   */
  generateWeeklyData(
    options: {
      min?: number;
      max?: number;
      trend?: 'up' | 'down' | 'random' | 'wave';
      volatility?: number;
      startValue?: number;
    } = {}
  ): ChartDataPoint[] {
    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const data = this.generateLineData(7, options);

    return data.map((point, index) => ({
      ...point,
      label: dayNames[index],
      labelTextStyle: {
        color: '#6b7280',
        fontSize: 12,
        fontWeight: '500',
      },
      dataPointText: Math.round(point.value).toString(),
    }));
  }
}

export const fakeDataGenerator = new FakeDataGeneratorImpl();
