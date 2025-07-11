import { useState } from "react";
import { Bell, Moon, Sun, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { StockSearch } from "@/components/stock-search";
import { MarketSummary } from "@/components/market-summary";
import { WatchlistTable } from "@/components/watchlist-table";
import { StockChart } from "@/components/stock-chart";
import { PortfolioSummary } from "@/components/portfolio-summary";
import { ActiveAlerts } from "@/components/active-alerts";
import { MarketNews } from "@/components/market-news";
import { StockData } from "@/types/stock";
import { useQuery } from "@tanstack/react-query";

export default function Dashboard() {
  const { theme, setTheme } = useTheme();
  const [selectedStock, setSelectedStock] = useState<StockData | null>(null);

  const { data: stockData } = useQuery<StockData>({
    queryKey: ['/api/stocks', selectedStock?.symbol],
    enabled: !!selectedStock?.symbol,
  });

  const handleStockSelect = async (symbolOrStock: string | StockData) => {
    if (typeof symbolOrStock === 'string') {
      // If it's a symbol, we need to fetch the stock data
      try {
        const response = await fetch(`/api/stocks/${symbolOrStock}`);
        if (response.ok) {
          const stock = await response.json();
          setSelectedStock(stock);
        }
      } catch (error) {
        console.error('Error fetching stock data:', error);
      }
    } else {
      // If it's already a stock object
      setSelectedStock(symbolOrStock);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Brand */}
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <svg className="h-5 w-5 text-primary-foreground" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
                  <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
                </svg>
              </div>
              <span className="text-xl font-bold text-primary">StockTracker Pro</span>
            </div>

            {/* Search Bar */}
            <StockSearch onStockSelect={handleStockSelect} />

            {/* Header Actions */}
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center">
                  3
                </span>
              </Button>

              {/* Theme Toggle */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              >
                <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
              </Button>

              {/* User Menu */}
              <Button variant="ghost" size="icon">
                <User className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Market Summary */}
        <MarketSummary />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Watchlist and Chart Section */}
          <div className="xl:col-span-2 space-y-8">
            <WatchlistTable onStockSelect={handleStockSelect} />
            <StockChart stock={stockData || selectedStock} />
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            <PortfolioSummary />
            <ActiveAlerts />
            <MarketNews />
          </div>
        </div>
      </main>
    </div>
  );
}
