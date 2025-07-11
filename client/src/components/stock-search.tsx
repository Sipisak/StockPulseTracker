import { useState } from "react";
import { Search, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { StockData } from "@/types/stock";
import { useToast } from "@/hooks/use-toast";

interface StockSearchProps {
  onStockSelect?: (stock: StockData) => void;
}

export function StockSearch({ onStockSelect }: StockSearchProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStock, setSelectedStock] = useState<StockData | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: stockData, isLoading, error } = useQuery({
    queryKey: ['/api/stocks/search', searchTerm],
    queryFn: async () => {
      if (!searchTerm) return null;
      const response = await fetch(`/api/stocks/search?q=${encodeURIComponent(searchTerm)}`);
      if (!response.ok) {
        throw new Error('Stock not found');
      }
      return response.json();
    },
    enabled: searchTerm.length > 0,
    staleTime: 30000,
  });

  const addToWatchlistMutation = useMutation({
    mutationFn: async (symbol: string) => {
      const response = await fetch('/api/watchlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'user-id': 'anonymous',
        },
        body: JSON.stringify({ symbol }),
      });
      if (!response.ok) {
        throw new Error('Failed to add to watchlist');
      }
      return response.json();
    },
    onSuccess: (data, variables) => {
      toast({
        title: "Added to watchlist",
        description: `${variables} has been added to your watchlist.`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/watchlist'] });
      setSearchTerm("");
      setSelectedStock(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add stock to watchlist",
        variant: "destructive",
      });
    },
  });

  const handleSearch = (term: string) => {
    setSearchTerm(term.toUpperCase());
  };

  const handleStockSelect = (stock: StockData) => {
    setSelectedStock(stock);
    onStockSelect?.(stock);
  };

  const handleAddToWatchlist = () => {
    if (selectedStock) {
      addToWatchlistMutation.mutate(selectedStock.symbol);
    }
  };

  return (
    <div className="relative max-w-2xl mx-8 flex-1">
      <div className="relative">
        <Input
          type="text"
          placeholder="Search stocks (e.g., AAPL, GOOGL, TSLA)"
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          className="pl-10 pr-4"
        />
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
      </div>

      {searchTerm && (
        <div className="absolute top-full mt-2 w-full z-50">
          {isLoading && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                  <span className="text-sm text-muted-foreground">Searching...</span>
                </div>
              </CardContent>
            </Card>
          )}

          {error && (
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-destructive">
                  {error instanceof Error ? error.message : "Stock not found"}
                </div>
              </CardContent>
            </Card>
          )}

          {stockData && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div
                    className="flex items-center space-x-3 cursor-pointer flex-1"
                    onClick={() => handleStockSelect(stockData)}
                  >
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-primary font-bold text-xs">
                        {stockData.symbol.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <div className="font-mono font-semibold">{stockData.symbol}</div>
                      <div className="text-sm text-muted-foreground">{stockData.name}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="font-mono font-semibold">${stockData.currentPrice}</div>
                      <div className={`text-sm ${
                        parseFloat(stockData.changePercent) >= 0 ? 'text-success' : 'text-destructive'
                      }`}>
                        {parseFloat(stockData.changePercent) >= 0 ? '+' : ''}{stockData.changePercent}%
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        addToWatchlistMutation.mutate(stockData.symbol);
                      }}
                      disabled={addToWatchlistMutation.isPending}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
