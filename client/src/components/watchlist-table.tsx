import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, Plus, X, TrendingUp, TrendingDown } from "lucide-react";
import { WatchlistItem } from "@/types/stock";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useWebSocket } from "@/hooks/use-websocket";

interface WatchlistTableProps {
  onStockSelect?: (symbol: string) => void;
}

export function WatchlistTable({ onStockSelect }: WatchlistTableProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedStock, setSelectedStock] = useState<string | null>(null);

  const { data: watchlist = [], isLoading } = useQuery<WatchlistItem[]>({
    queryKey: ['/api/watchlist'],
    queryFn: async () => {
      const response = await fetch('/api/watchlist', {
        headers: {
          'user-id': 'anonymous',
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch watchlist');
      }
      return response.json();
    },
    refetchInterval: 30000,
  });

  const removeFromWatchlistMutation = useMutation({
    mutationFn: async (symbol: string) => {
      const response = await fetch(`/api/watchlist/${symbol}`, {
        method: 'DELETE',
        headers: {
          'user-id': 'anonymous',
        },
      });
      if (!response.ok) {
        throw new Error('Failed to remove from watchlist');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Removed from watchlist",
        description: "Stock has been removed from your watchlist.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/watchlist'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to remove stock from watchlist",
        variant: "destructive",
      });
    },
  });

  const { subscribe, unsubscribe } = useWebSocket({
    onStockUpdate: (data) => {
      queryClient.setQueryData<WatchlistItem[]>(['/api/watchlist'], (old) => {
        if (!old) return old;
        return old.map((item) => {
          if (item.stock?.symbol === data.symbol) {
            return {
              ...item,
              stock: {
                ...item.stock,
                currentPrice: data.price.toString(),
                changeAmount: data.changeAmount.toString(),
                changePercent: data.changePercent.toString(),
              },
            };
          }
          return item;
        });
      });
    },
  });

  // Subscribe to watchlist stocks
  React.useEffect(() => {
    watchlist.forEach(item => {
      if (item.stock) {
        subscribe(item.stock.symbol);
      }
    });

    return () => {
      watchlist.forEach(item => {
        if (item.stock) {
          unsubscribe(item.stock.symbol);
        }
      });
    };
  }, [watchlist, subscribe, unsubscribe]);

  const handleStockClick = (symbol: string) => {
    setSelectedStock(symbol);
    onStockSelect?.(symbol);
  };

  const handleRemoveFromWatchlist = (symbol: string) => {
    removeFromWatchlistMutation.mutate(symbol);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>My Watchlist</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center justify-between p-4 border rounded-lg animate-pulse">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-muted rounded-full"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-muted rounded w-16"></div>
                    <div className="h-3 bg-muted rounded w-24"></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded w-16"></div>
                  <div className="h-3 bg-muted rounded w-12"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>My Watchlist</CardTitle>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Stock
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {watchlist.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>Your watchlist is empty</p>
            <p className="text-sm mt-2">Search for stocks to add to your watchlist</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground text-sm">Symbol</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground text-sm">Company</th>
                  <th className="text-right py-3 px-4 font-medium text-muted-foreground text-sm">Price</th>
                  <th className="text-right py-3 px-4 font-medium text-muted-foreground text-sm">Change</th>
                  <th className="text-right py-3 px-4 font-medium text-muted-foreground text-sm">% Change</th>
                  <th className="text-right py-3 px-4 font-medium text-muted-foreground text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {watchlist.map((item) => {
                  const stock = item.stock;
                  if (!stock) return null;

                  const changePercent = parseFloat(stock.changePercent);
                  const changeAmount = parseFloat(stock.changeAmount);
                  const isPositive = changePercent >= 0;

                  return (
                    <tr
                      key={item.symbol}
                      className={`border-b hover:bg-muted/50 transition-colors cursor-pointer ${
                        selectedStock === stock.symbol ? 'bg-muted/50' : ''
                      }`}
                      onClick={() => handleStockClick(stock.symbol)}
                    >
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                            <span className="text-primary font-bold text-xs">
                              {stock.symbol.charAt(0)}
                            </span>
                          </div>
                          <span className="font-mono font-semibold">{stock.symbol}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-sm">{stock.name}</span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <span className="font-mono font-semibold">${stock.currentPrice}</span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <span className={`font-medium ${
                          isPositive ? 'text-success' : 'text-destructive'
                        }`}>
                          {isPositive ? '+' : ''}{changeAmount.toFixed(2)}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <Badge variant="outline" className={`${
                          isPositive 
                            ? 'border-success text-success' 
                            : 'border-destructive text-destructive'
                        }`}>
                          {isPositive ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                          {isPositive ? '+' : ''}{changePercent.toFixed(2)}%
                        </Badge>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              // TODO: Implement alert creation
                            }}
                          >
                            <Bell className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveFromWatchlist(stock.symbol);
                            }}
                            disabled={removeFromWatchlistMutation.isPending}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
