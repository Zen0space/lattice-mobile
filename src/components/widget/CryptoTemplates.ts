import { Widget, CryptoWidgetConfig } from './types';

export interface CryptoTemplate {
  type: 'crypto-price' | 'crypto-market' | 'crypto-gainers' | 'crypto-portfolio';
  name: string;
  description: string;
  icon: string;
  defaultConfig: CryptoWidgetConfig;
}

export const CRYPTO_TEMPLATES: CryptoTemplate[] = [
  {
    type: 'crypto-price',
    name: 'Crypto Prices',
    description: 'Live cryptocurrency prices and changes',
    icon: '💰',
    defaultConfig: {
      id: 'crypto-price-template',
      title: 'Crypto Prices',
      widgetType: 'price',
      cryptoSymbols: ['BTC', 'ETH', 'BNB'],
      showChange: true,
      maxItems: 3,
      displayMode: 'list',
    },
  },
  {
    type: 'crypto-market',
    name: 'Market Overview',
    description: 'Total market cap, volume, and key metrics',
    icon: '📊',
    defaultConfig: {
      id: 'crypto-market-template',
      title: 'Market Overview',
      widgetType: 'market',
      timeframe: '24h',
      showVolume: true,
      showMarketCap: true,
      displayMode: 'compact',
    },
  },
  {
    type: 'crypto-gainers',
    name: 'Top Gainers',
    description: 'Best performing cryptocurrencies',
    icon: '📈',
    defaultConfig: {
      id: 'crypto-gainers-template',
      title: 'Top Gainers',
      widgetType: 'gainers',
      timeframe: '24h',
      maxItems: 3,
      showChange: true,
      displayMode: 'list',
    },
  },
  {
    type: 'crypto-portfolio',
    name: 'Portfolio Summary',
    description: 'Your crypto portfolio overview',
    icon: '💼',
    defaultConfig: {
      id: 'crypto-portfolio-template',
      title: 'My Portfolio',
      widgetType: 'portfolio',
      showChange: true,
      displayMode: 'compact',
    },
  },
];

export const CRYPTO_DATA_PRESETS = {
  'btc-eth-bnb': {
    name: 'Top 3 Cryptos',
    description: 'Bitcoin, Ethereum, and BNB',
    cryptoSymbols: ['BTC', 'ETH', 'BNB'],
  },
  'defi-tokens': {
    name: 'DeFi Tokens',
    description: 'Popular DeFi cryptocurrencies',
    cryptoSymbols: ['UNI', 'AAVE', 'COMP'],
  },
  'layer1-coins': {
    name: 'Layer 1 Coins',
    description: 'Major blockchain platforms',
    cryptoSymbols: ['BTC', 'ETH', 'SOL', 'ADA'],
  },
  'top-gainers': {
    name: '24h Top Gainers',
    description: 'Best performing coins today',
    cryptoSymbols: ['MATIC', 'AVAX', 'LINK'],
  },
};

export function createCryptoConfig(
  template: CryptoTemplate,
  dataPreset: keyof typeof CRYPTO_DATA_PRESETS,
  title: string = 'New Crypto Widget'
): CryptoWidgetConfig {
  const preset = CRYPTO_DATA_PRESETS[dataPreset];

  return {
    ...template.defaultConfig,
    id: `crypto_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    title,
    cryptoSymbols: preset.cryptoSymbols,
  };
}

export default CRYPTO_TEMPLATES;
