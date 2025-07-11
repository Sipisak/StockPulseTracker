import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { insertStockSchema, insertWatchlistSchema, insertAlertSchema, insertPortfolioSchema } from "@shared/schema";
import { z } from "zod";

const ALPHA_VANTAGE_API_KEY = process.env.ALPHA_VANTAGE_API_KEY || process.env.VITE_ALPHA_VANTAGE_API_KEY || "demo";

interface StockData {
  symbol: string;
  name: string;
  price: number;
  changeAmount: number;
  changePercent: number;
  volume: number;
  marketCap?: number;
}

interface WebSocketClient {
  ws: WebSocket;
  subscriptions: Set<string>;
}

const clients: Set<WebSocketClient> = new Set();

async function fetchStockData(symbol: string): Promise<StockData | null> {
  try {
    const response = await fetch(
      `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${ALPHA_VANTAGE_API_KEY}`
    );
    const data = await response.json();
    
    if (data["Error Message"] || data["Note"]) {
      console.error(`Alpha Vantage error for ${symbol}:`, data["Error Message"] || data["Note"]);
      return null;
    }
    
    const quote = data["Global Quote"];
    if (!quote) {
      console.error(`No quote data for ${symbol}`);
      return null;
    }
    
    return {
      symbol: quote["01. symbol"],
      name: quote["01. symbol"], // Alpha Vantage doesn't provide company name in this endpoint
      price: parseFloat(quote["05. price"]),
      changeAmount: parseFloat(quote["09. change"]),
      changePercent: parseFloat(quote["10. change percent"]?.replace("%", "") || "0"),
      volume: parseInt(quote["06. volume"]),
    };
  } catch (error) {
    console.error(`Error fetching stock data for ${symbol}:`, error);
    return null;
  }
}

async function fetchMarketIndices() {
  const indices = [
    { symbol: "SPY", name: "S&P 500" },
    { symbol: "QQQ", name: "NASDAQ" },
    { symbol: "DIA", name: "DOW JONES" },
    { symbol: "VIX", name: "VIX" },
  ];
  
  for (const index of indices) {
    const data = await fetchStockData(index.symbol);
    if (data) {
      await storage.upsertMarketIndex({
        name: index.name,
        symbol: index.symbol,
        value: data.price.toString(),
        changeAmount: data.changeAmount.toString(),
        changePercent: data.changePercent.toString(),
      });
    }
  }
}

function broadcastStockUpdate(symbol: string, data: StockData) {
  const message = JSON.stringify({
    type: "stock_update",
    data: {
      symbol,
      price: data.price,
      changeAmount: data.changeAmount,
      changePercent: data.changePercent,
      volume: data.volume,
    },
  });
  
  clients.forEach(client => {
    if (client.ws.readyState === WebSocket.OPEN && client.subscriptions.has(symbol)) {
      client.ws.send(message);
    }
  });
}

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // WebSocket server
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  wss.on('connection', (ws) => {
    const client: WebSocketClient = {
      ws,
      subscriptions: new Set(),
    };
    clients.add(client);
    
    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());
        
        if (data.type === 'subscribe' && data.symbol) {
          client.subscriptions.add(data.symbol);
        } else if (data.type === 'unsubscribe' && data.symbol) {
          client.subscriptions.delete(data.symbol);
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });
    
    ws.on('close', () => {
      clients.delete(client);
    });
  });
  
  // Stock routes
  app.get('/api/stocks/search', async (req, res) => {
    try {
      const { q } = req.query;
      if (!q || typeof q !== 'string') {
        return res.status(400).json({ error: 'Query parameter required' });
      }
      
      const stockData = await fetchStockData(q.toUpperCase());
      if (!stockData) {
        return res.status(404).json({ error: 'Stock not found' });
      }
      
      const stock = await storage.upsertStock({
        symbol: stockData.symbol,
        name: stockData.name,
        currentPrice: stockData.price.toString(),
        changeAmount: stockData.changeAmount.toString(),
        changePercent: stockData.changePercent.toString(),
        volume: stockData.volume,
        marketCap: stockData.marketCap?.toString(),
      });
      
      res.json(stock);
    } catch (error) {
      console.error('Stock search error:', error);
      res.status(500).json({ error: 'Failed to search stock' });
    }
  });
  
  app.get('/api/stocks/:symbol', async (req, res) => {
    try {
      const { symbol } = req.params;
      let stock = await storage.getStock(symbol.toUpperCase());
      
      if (!stock) {
        const stockData = await fetchStockData(symbol.toUpperCase());
        if (!stockData) {
          return res.status(404).json({ error: 'Stock not found' });
        }
        
        stock = await storage.upsertStock({
          symbol: stockData.symbol,
          name: stockData.name,
          currentPrice: stockData.price.toString(),
          changeAmount: stockData.changeAmount.toString(),
          changePercent: stockData.changePercent.toString(),
          volume: stockData.volume,
          marketCap: stockData.marketCap?.toString(),
        });
      }
      
      res.json(stock);
    } catch (error) {
      console.error('Get stock error:', error);
      res.status(500).json({ error: 'Failed to get stock data' });
    }
  });
  
  // Market indices
  app.get('/api/market/indices', async (req, res) => {
    try {
      const indices = await storage.getMarketIndices();
      res.json(indices);
    } catch (error) {
      console.error('Get market indices error:', error);
      res.status(500).json({ error: 'Failed to get market indices' });
    }
  });
  
  // Watchlist routes
  app.get('/api/watchlist', async (req, res) => {
    try {
      const userId = req.headers['user-id'] as string || 'anonymous';
      const watchlistItems = await storage.getWatchlist(userId);
      
      const watchlistWithStocks = await Promise.all(
        watchlistItems.map(async (item) => {
          const stock = await storage.getStock(item.symbol);
          return {
            ...item,
            stock,
          };
        })
      );
      
      res.json(watchlistWithStocks);
    } catch (error) {
      console.error('Get watchlist error:', error);
      res.status(500).json({ error: 'Failed to get watchlist' });
    }
  });
  
  app.post('/api/watchlist', async (req, res) => {
    try {
      const userId = req.headers['user-id'] as string || 'anonymous';
      const data = insertWatchlistSchema.parse({ ...req.body, userId });
      
      const item = await storage.addToWatchlist(data);
      res.json(item);
    } catch (error) {
      console.error('Add to watchlist error:', error);
      res.status(500).json({ error: 'Failed to add to watchlist' });
    }
  });
  
  app.delete('/api/watchlist/:symbol', async (req, res) => {
    try {
      const userId = req.headers['user-id'] as string || 'anonymous';
      const { symbol } = req.params;
      
      await storage.removeFromWatchlist(userId, symbol.toUpperCase());
      res.json({ success: true });
    } catch (error) {
      console.error('Remove from watchlist error:', error);
      res.status(500).json({ error: 'Failed to remove from watchlist' });
    }
  });
  
  // Alert routes
  app.get('/api/alerts', async (req, res) => {
    try {
      const userId = req.headers['user-id'] as string || 'anonymous';
      const alerts = await storage.getAlerts(userId);
      res.json(alerts);
    } catch (error) {
      console.error('Get alerts error:', error);
      res.status(500).json({ error: 'Failed to get alerts' });
    }
  });
  
  app.post('/api/alerts', async (req, res) => {
    try {
      const userId = req.headers['user-id'] as string || 'anonymous';
      const data = insertAlertSchema.parse({ ...req.body, userId });
      
      const alert = await storage.createAlert(data);
      res.json(alert);
    } catch (error) {
      console.error('Create alert error:', error);
      res.status(500).json({ error: 'Failed to create alert' });
    }
  });
  
  app.delete('/api/alerts/:id', async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteAlert(parseInt(id));
      res.json({ success: true });
    } catch (error) {
      console.error('Delete alert error:', error);
      res.status(500).json({ error: 'Failed to delete alert' });
    }
  });
  
  // Portfolio routes
  app.get('/api/portfolio', async (req, res) => {
    try {
      const userId = req.headers['user-id'] as string || 'anonymous';
      const portfolioItems = await storage.getPortfolio(userId);
      
      const portfolioWithStocks = await Promise.all(
        portfolioItems.map(async (item) => {
          const stock = await storage.getStock(item.symbol);
          return {
            ...item,
            stock,
          };
        })
      );
      
      res.json(portfolioWithStocks);
    } catch (error) {
      console.error('Get portfolio error:', error);
      res.status(500).json({ error: 'Failed to get portfolio' });
    }
  });
  
  // Initialize market data and start real-time updates
  await fetchMarketIndices();
  
  // Real-time data updates every 30 seconds
  setInterval(async () => {
    try {
      await fetchMarketIndices();
      
      // Update watchlist stocks
      const allStocks = await storage.getAllStocks();
      for (const stock of allStocks) {
        const stockData = await fetchStockData(stock.symbol);
        if (stockData) {
          await storage.updateStockPrice(
            stock.symbol,
            stockData.price,
            stockData.changeAmount,
            stockData.changePercent
          );
          
          broadcastStockUpdate(stock.symbol, stockData);
        }
      }
    } catch (error) {
      console.error('Real-time update error:', error);
    }
  }, 30000);
  
  return httpServer;
}
