export type AssetCategory = 'indices' | 'stocks' | 'crypto' | 'forex' | 'commodities' | 'bonds';

export type TechnicalRating = 'Strong Buy' | 'Buy' | 'Neutral' | 'Sell' | 'Strong Sell';

export interface CandleData {
  time: string;
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  ma20?: number;
  ema50?: number;
  upperBand?: number;
  lowerBand?: number;
}

export interface MarketAsset {
  symbol: string;
  name: string;
  category: AssetCategory;
  sector?: string;
  price: number;
  change: number;
  changePercent: number;
  high24h: number;
  low24h: number;
  openPrice: number;
  volume24h: string;
  volumeNum: number;
  marketCap?: string;
  peRatio?: number;
  range52w: {
    low: number;
    high: number;
  };
  rating: TechnicalRating;
  sparkline: number[];
  currency: string;
  exchange: string;
}

export interface EconomicEvent {
  id: string;
  time: string;
  country: string;
  countryCode: string;
  currency: string;
  event: string;
  impact: 'high' | 'med' | 'low';
  actual: string;
  forecast: string;
  previous: string;
}

export interface NewsArticle {
  id: string;
  title: string;
  source: string;
  timeAgo: string;
  category: string;
  sentiment: 'bullish' | 'bearish' | 'neutral';
  readTime: string;
  snippet: string;
}

export interface Position {
  id: string;
  symbol: string;
  name: string;
  side: 'buy' | 'sell';
  entryPrice: number;
  currentPrice: number;
  quantity: number;
  totalCost: number;
  unrealizedPnl: number;
  unrealizedPnlPercent: number;
  openedAt: string;
}

export interface PriceAlert {
  id: string;
  symbol: string;
  targetPrice: number;
  condition: 'above' | 'below';
  createdAt: string;
  triggered: boolean;
}

export type ChartTimeframe = '1D' | '5D' | '1M' | '3M' | '6M' | '1Y' | 'ALL';
export type ChartStyle = 'candles' | 'line' | 'area' | 'heikin-ashi';
