import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";
import { MarketIndex } from "@/types/stock";

export function MarketSummary() {
  const { data: indices = [], isLoading } = useQuery<MarketIndex[]>({
    queryKey: ['/api/market/indices'],
    refetchInterval: 30000,
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-muted rounded w-20 mb-4"></div>
              <div className="h-8 bg-muted rounded w-32 mb-2"></div>
              <div className="h-4 bg-muted rounded w-16"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {indices.map((index) => {
        const changePercent = parseFloat(index.changePercent);
        const changeAmount = parseFloat(index.changeAmount);
        const isPositive = changePercent >= 0;

        return (
          <Card key={index.symbol}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-muted-foreground">{index.name}</h3>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  isPositive 
                    ? 'text-success bg-success/10' 
                    : 'text-destructive bg-destructive/10'
                }`}>
                  {isPositive ? '+' : ''}{changePercent.toFixed(2)}%
                </span>
              </div>
              <div className="space-y-2">
                <div className="text-2xl font-bold font-mono">
                  {parseFloat(index.value).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </div>
                <div className="flex items-center space-x-2">
                  {isPositive ? (
                    <TrendingUp className="h-4 w-4 text-success" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-destructive" />
                  )}
                  <span className={`text-sm font-medium ${
                    isPositive ? 'text-success' : 'text-destructive'
                  }`}>
                    {isPositive ? '+' : ''}{changeAmount.toFixed(2)}
                  </span>
                  <span className="text-xs text-muted-foreground">Today</span>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
