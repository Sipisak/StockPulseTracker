export interface StockData {
  symbol: string;
  name: string;
  currentPrice: string;
  changeAmount: string;
  changePercent: string;
  volume: number;
  marketCap?: string;
  lastUpdated: string;
}

export interface MarketIndex {
  name: string;
  symbol: string;
  value: string;
  changeAmount: string;
  changePercent: string;
  lastUpdated: string;
}

export interface WatchlistItem {
  id: number;
  symbol: string;
  stock?: StockData;
  addedAt: string;
}

export interface PortfolioItem {
  id: number;
  symbol: string;
  shares: string;
  avgCost: string;
  stock?: StockData;
  addedAt: string;
}

export interface Alert {
  id: number;
  symbol: string;
  type: 'price_above' | 'price_below' | 'volume_spike';
  targetValue: string;
  isActive: boolean;
  createdAt: string;
}

export interface StockUpdate {
  symbol: string;
  price: number;
  changeAmount: number;
  changePercent: number;
  volume: number;
}
