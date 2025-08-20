import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { WebView } from 'react-native-webview';

interface ChartConfig {
  symbol: string;
  theme?: 'light' | 'dark';
  interval?: string;
  height?: number;
  width?: string;
  studies?: string[];
  showChart?: boolean;
  type?: string;
  showPieChart?: boolean;
  showPerformanceChart?: boolean;
  showHeatmap?: boolean;
  showCorrelation?: boolean;
  hideTimeInterval?: boolean;
  hideVolume?: boolean;
  hideTopToolbar?: boolean;
  hideLegend?: boolean;
}

interface TradingViewChartProps {
  chartConfig: ChartConfig;
  style?: any;
}

const TradingViewChart: React.FC<TradingViewChartProps> = ({ chartConfig, style }) => {
  const { width: screenWidth } = Dimensions.get('window');

  const {
    symbol,
    theme = 'dark',
    interval = 'D',
    height = 400,
    studies = ['RSI', 'MACD'],
    showChart = true,
    type = 'advanced_chart',
    hideTimeInterval = true,
    hideVolume = true,
    hideTopToolbar = true,
    hideLegend = false,
  } = chartConfig;

  if (!showChart) {
    return null;
  }

  // Generate TradingView widget HTML
  const generateChartHTML = () => {
    const widgetId = `tradingview_${Math.random().toString(36).substr(2, 9)}`;

    // Advanced Chart Widget (for individual stocks/crypto)
    if (type === 'advanced_chart' || !type) {
      return `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body, html {
              margin: 0;
              padding: 0;
              height: 100%;
              background-color: ${theme === 'dark' ? '#1a1a1a' : '#ffffff'};
              overflow: hidden;
            }
            .tradingview-widget-container {
              height: 100%;
              width: 100%;
            }
          </style>
        </head>
        <body>
          <div class="tradingview-widget-container">
            <div id="${widgetId}"></div>
            <script type="text/javascript" src="https://s3.tradingview.com/tv.js"></script>
            <script type="text/javascript">
              new TradingView.widget({
                "width": "100%",
                "height": "100%",
                "symbol": "${symbol}",
                "interval": "${interval}",
                "timezone": "Etc/UTC",
                "theme": "${theme}",
                "style": "1",
                "locale": "en",
                "toolbar_bg": "${theme === 'dark' ? '#1a1a1a' : '#f1f3f6'}",
                "enable_publishing": false,
                "hide_top_toolbar": ${hideTopToolbar},
                "hide_legend": ${hideLegend},
                "save_image": false,
                "container_id": "${widgetId}",
                "studies": ${JSON.stringify(studies)},
                "show_popup_button": false,
                "popup_width": "1000",
                "popup_height": "650",
                "disabled_features": [
                  ${hideVolume ? '"create_volume_indicator_by_default"' : ''}
                ].filter(Boolean),
                "overrides": {
                  ${hideVolume ? '"paneProperties.legendProperties.showVolume": false,' : ''}
                  ${hideTimeInterval ? '"mainSeriesProperties.statusViewStyle.showInterval": false,' : ''}
                  ${hideVolume ? '"paneProperties.legendProperties.showSeriesOHLC": false,' : ''}
                  "paneProperties.background": "${theme === 'dark' ? '#1a1a1a' : '#ffffff'}",
                  "paneProperties.vertGridProperties.color": "${theme === 'dark' ? '#2a2e39' : '#e1e3e6'}",
                  "paneProperties.horzGridProperties.color": "${theme === 'dark' ? '#2a2e39' : '#e1e3e6'}"
                }
              });
            </script>
          </div>
        </body>
        </html>
      `;
    }

    // Portfolio Allocation Pie Chart
    if (type === 'portfolio_allocation') {
      return `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body, html {
              margin: 0;
              padding: 0;
              height: 100%;
              background-color: ${theme === 'dark' ? '#1a1a1a' : '#ffffff'};
              overflow: hidden;
            }
            .tradingview-widget-container {
              height: 100%;
              width: 100%;
            }
          </style>
        </head>
        <body>
          <div class="tradingview-widget-container">
            <div class="tradingview-widget-container__widget"></div>
            <script type="text/javascript" src="https://s3.tradingview.com/external-embedding/embed-widget-market-overview.js" async>
            {
              "colorTheme": "${theme}",
              "dateRange": "12M",
              "showChart": true,
              "locale": "en",
              "width": "100%",
              "height": "100%",
              "largeChartUrl": "",
              "isTransparent": false,
              "showSymbolLogo": true,
              "showFloatingTooltip": false,
              "plotLineColorGrowing": "rgba(41, 98, 255, 1)",
              "plotLineColorFalling": "rgba(41, 98, 255, 1)",
              "gridLineColor": "rgba(42, 46, 57, 0)",
              "scaleFontColor": "rgba(106, 109, 120, 1)",
              "belowLineFillColorGrowing": "rgba(41, 98, 255, 0.12)",
              "belowLineFillColorFalling": "rgba(41, 98, 255, 0.12)",
              "belowLineFillColorGrowingBottom": "rgba(41, 98, 255, 0)",
              "belowLineFillColorFallingBottom": "rgba(41, 98, 255, 0)",
              "symbolActiveColor": "rgba(41, 98, 255, 0.12)",
              "tabs": [
                {
                  "title": "Portfolio",
                  "symbols": [
                    {"s": "NASDAQ:VTI", "d": "VTI - 40%"},
                    {"s": "NASDAQ:VTIAX", "d": "VTIAX - 30%"},
                    {"s": "NASDAQ:BND", "d": "BND - 20%"},
                    {"s": "NASDAQ:VNQ", "d": "VNQ - 6%"},
                    {"s": "NASDAQ:VTEB", "d": "VTEB - 4%"}
                  ]
                }
              ]
            }
            </script>
          </div>
        </body>
        </html>
      `;
    }

    // Sector Comparison Heatmap
    if (type === 'sector_comparison') {
      return `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body, html {
              margin: 0;
              padding: 0;
              height: 100%;
              background-color: ${theme === 'dark' ? '#1a1a1a' : '#ffffff'};
              overflow: hidden;
            }
            .tradingview-widget-container {
              height: 100%;
              width: 100%;
            }
          </style>
        </head>
        <body>
          <div class="tradingview-widget-container">
            <div class="tradingview-widget-container__widget"></div>
            <script type="text/javascript" src="https://s3.tradingview.com/external-embedding/embed-widget-stock-heatmap.js" async>
            {
              "exchanges": [],
              "dataSource": "SPX500",
              "grouping": "sector",
              "blockSize": "market_cap_basic",
              "blockColor": "change",
              "locale": "en",
              "symbolUrl": "",
              "colorTheme": "${theme}",
              "hasTopBar": false,
              "isDataSetEnabled": false,
              "isZoomEnabled": true,
              "hasSymbolTooltip": true,
              "width": "100%",
              "height": "100%"
            }
            </script>
          </div>
        </body>
        </html>
      `;
    }

    // Default to simple symbol overview
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body, html {
            margin: 0;
            padding: 0;
            height: 100%;
            background-color: ${theme === 'dark' ? '#1a1a1a' : '#ffffff'};
            overflow: hidden;
          }
          .tradingview-widget-container {
            height: 100%;
            width: 100%;
          }
        </style>
      </head>
      <body>
        <div class="tradingview-widget-container">
          <div class="tradingview-widget-container__widget"></div>
          <script type="text/javascript" src="https://s3.tradingview.com/external-embedding/embed-widget-symbol-overview.js" async>
          {
            "symbols": [["${symbol}"]],
            "chartOnly": false,
            "width": "100%",
            "height": "100%",
            "locale": "en",
            "colorTheme": "${theme}",
            "autosize": true,
            "showVolume": false,
            "showMA": false,
            "hideDateRanges": false,
            "hideMarketStatus": false,
            "hideSymbolLogo": false,
            "scalePosition": "right",
            "scaleMode": "Normal",
            "fontFamily": "-apple-system, BlinkMacSystemFont, Trebuchet MS, Roboto, Ubuntu, sans-serif",
            "fontSize": "10",
            "noTimeScale": false,
            "valuesTracking": "1",
            "changeMode": "price-and-percent",
            "chartType": "area",
            "maLineColor": "#2962FF",
            "maLineWidth": 1,
            "maLength": 9,
            "lineWidth": 2,
            "lineType": 0,
            "dateRanges": ["1d", "1m", "3m", "12m", "60m"]
          }
          </script>
        </div>
      </body>
      </html>
    `;
  };

  const htmlContent = generateChartHTML();

  return (
    <View style={[styles.container, { height: height }, style]}>
      <WebView
        source={{ html: htmlContent }}
        style={styles.webview}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        scalesPageToFit={true}
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        onError={syntheticEvent => {
          const { nativeEvent } = syntheticEvent;
          console.warn('TradingView WebView error: ', nativeEvent);
        }}
        onHttpError={syntheticEvent => {
          const { nativeEvent } = syntheticEvent;
          console.warn('TradingView WebView HTTP error: ', nativeEvent);
        }}
        originWhitelist={['*']}
        mixedContentMode="compatibility"
        allowsInlineMediaPlayback={true}
        mediaPlaybackRequiresUserAction={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    overflow: 'hidden',
    marginVertical: 8,
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
  },
});

export default TradingViewChart;
