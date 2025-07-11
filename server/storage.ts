import { stocks, watchlists, alerts, portfolios, marketIndices, type Stock, type InsertStock, type Watchlist, type InsertWatchlist, type Alert, type InsertAlert, type Portfolio, type InsertPortfolio, type MarketIndex, type InsertMarketIndex } from "@shared/schema";

export interface IStorage {
  // Stock operations
  getStock(symbol: string): Promise<Stock | undefined>;
  getAllStocks(): Promise<Stock[]>;
  upsertStock(stock: InsertStock): Promise<Stock>;
  updateStockPrice(symbol: string, price: number, changeAmount: number, changePercent: number): Promise<void>;

  // Watchlist operations
  getWatchlist(userId: string): Promise<Watchlist[]>;
  addToWatchlist(item: InsertWatchlist): Promise<Watchlist>;
  removeFromWatchlist(userId: string, symbol: string): Promise<void>;

  // Alert operations
  getAlerts(userId: string): Promise<Alert[]>;
  createAlert(alert: InsertAlert): Promise<Alert>;
  updateAlert(id: number, updates: Partial<Alert>): Promise<void>;
  deleteAlert(id: number): Promise<void>;

  // Portfolio operations
  getPortfolio(userId: string): Promise<Portfolio[]>;
  addToPortfolio(item: InsertPortfolio): Promise<Portfolio>;
  updatePortfolioItem(id: number, updates: Partial<Portfolio>): Promise<void>;
  removeFromPortfolio(id: number): Promise<void>;

  // Market indices operations
  getMarketIndices(): Promise<MarketIndex[]>;
  upsertMarketIndex(index: InsertMarketIndex): Promise<MarketIndex>;
}

export class MemStorage implements IStorage {
  private stocks: Map<string, Stock> = new Map();
  private watchlists: Map<string, Watchlist[]> = new Map();
  private alerts: Map<string, Alert[]> = new Map();
  private portfolios: Map<string, Portfolio[]> = new Map();
  private marketIndices: Map<string, MarketIndex> = new Map();
  private currentId = 1;

  async getStock(symbol: string): Promise<Stock | undefined> {
    return this.stocks.get(symbol);
  }

  async getAllStocks(): Promise<Stock[]> {
    return Array.from(this.stocks.values());
  }

  async upsertStock(stock: InsertStock): Promise<Stock> {
    const existing = this.stocks.get(stock.symbol);
    const newStock: Stock = {
      id: existing?.id || this.currentId++,
      ...stock,
      marketCap: stock.marketCap || null,
      lastUpdated: new Date(),
    };
    this.stocks.set(stock.symbol, newStock);
    return newStock;
  }

  async updateStockPrice(symbol: string, price: number, changeAmount: number, changePercent: number): Promise<void> {
    const stock = this.stocks.get(symbol);
    if (stock) {
      stock.currentPrice = price.toString();
      stock.changeAmount = changeAmount.toString();
      stock.changePercent = changePercent.toString();
      stock.lastUpdated = new Date();
    }
  }

  async getWatchlist(userId: string): Promise<Watchlist[]> {
    return this.watchlists.get(userId) || [];
  }

  async addToWatchlist(item: InsertWatchlist): Promise<Watchlist> {
    const newItem: Watchlist = {
      id: this.currentId++,
      ...item,
      userId: item.userId || "anonymous",
      addedAt: new Date(),
    };
    
    const userWatchlist = this.watchlists.get(item.userId || "anonymous") || [];
    userWatchlist.push(newItem);
    this.watchlists.set(item.userId || "anonymous", userWatchlist);
    
    return newItem;
  }

  async removeFromWatchlist(userId: string, symbol: string): Promise<void> {
    const userWatchlist = this.watchlists.get(userId) || [];
    const filtered = userWatchlist.filter(item => item.symbol !== symbol);
    this.watchlists.set(userId, filtered);
  }

  async getAlerts(userId: string): Promise<Alert[]> {
    return this.alerts.get(userId) || [];
  }

  async createAlert(alert: InsertAlert): Promise<Alert> {
    const newAlert: Alert = {
      id: this.currentId++,
      ...alert,
      userId: alert.userId || "anonymous",
      isActive: alert.isActive !== undefined ? alert.isActive : true,
      createdAt: new Date(),
    };
    
    const userAlerts = this.alerts.get(alert.userId || "anonymous") || [];
    userAlerts.push(newAlert);
    this.alerts.set(alert.userId || "anonymous", userAlerts);
    
    return newAlert;
  }

  async updateAlert(id: number, updates: Partial<Alert>): Promise<void> {
    for (const [userId, alerts] of Array.from(this.alerts.entries())) {
      const alertIndex = alerts.findIndex((alert: Alert) => alert.id === id);
      if (alertIndex !== -1) {
        alerts[alertIndex] = { ...alerts[alertIndex], ...updates };
        break;
      }
    }
  }

  async deleteAlert(id: number): Promise<void> {
    for (const [userId, alerts] of Array.from(this.alerts.entries())) {
      const filtered = alerts.filter((alert: Alert) => alert.id !== id);
      this.alerts.set(userId, filtered);
    }
  }

  async getPortfolio(userId: string): Promise<Portfolio[]> {
    return this.portfolios.get(userId) || [];
  }

  async addToPortfolio(item: InsertPortfolio): Promise<Portfolio> {
    const newItem: Portfolio = {
      id: this.currentId++,
      ...item,
      userId: item.userId || "anonymous",
      addedAt: new Date(),
    };
    
    const userPortfolio = this.portfolios.get(item.userId || "anonymous") || [];
    userPortfolio.push(newItem);
    this.portfolios.set(item.userId || "anonymous", userPortfolio);
    
    return newItem;
  }

  async updatePortfolioItem(id: number, updates: Partial<Portfolio>): Promise<void> {
    for (const [userId, portfolio] of Array.from(this.portfolios.entries())) {
      const itemIndex = portfolio.findIndex((item: Portfolio) => item.id === id);
      if (itemIndex !== -1) {
        portfolio[itemIndex] = { ...portfolio[itemIndex], ...updates };
        break;
      }
    }
  }

  async removeFromPortfolio(id: number): Promise<void> {
    for (const [userId, portfolio] of Array.from(this.portfolios.entries())) {
      const filtered = portfolio.filter((item: Portfolio) => item.id !== id);
      this.portfolios.set(userId, filtered);
    }
  }

  async getMarketIndices(): Promise<MarketIndex[]> {
    return Array.from(this.marketIndices.values());
  }

  async upsertMarketIndex(index: InsertMarketIndex): Promise<MarketIndex> {
    const existing = this.marketIndices.get(index.symbol);
    const newIndex: MarketIndex = {
      id: existing?.id || this.currentId++,
      ...index,
      lastUpdated: new Date(),
    };
    this.marketIndices.set(index.symbol, newIndex);
    return newIndex;
  }
}

export const storage = new MemStorage();
