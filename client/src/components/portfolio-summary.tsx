import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";
import { PortfolioItem } from "@/types/stock";

export function PortfolioSummary() {
  const { data: portfolio = [], isLoading } = useQuery<PortfolioItem[]>({
    queryKey: ['/api/portfolio'],
    refetchInterval: 30000,
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Portfolio Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6 animate-pulse">
            <div className="text-center">
              <div className="h-8 bg-muted rounded w-32 mx-auto mb-2"></div>
              <div className="h-4 bg-muted rounded w-20 mx-auto"></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="h-6 bg-muted rounded w-24 mx-auto mb-1"></div>
                <div className="h-3 bg-muted rounded w-16 mx-auto"></div>
              </div>
              <div className="text-center">
                <div className="h-6 bg-muted rounded w-20 mx-auto mb-1"></div>
                <div className="h-3 bg-muted rounded w-16 mx-auto"></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate portfolio totals
  const totalValue = portfolio.reduce((sum, item) => {
    if (item.stock) {
      const shares = parseFloat(item.shares);
      const currentPrice = parseFloat(item.stock.currentPrice);
      return sum + (shares * currentPrice);
    }
    return sum;
  }, 0);

  const totalCost = portfolio.reduce((sum, item) => {
    const shares = parseFloat(item.shares);
    const avgCost = parseFloat(item.avgCost);
    return sum + (shares * avgCost);
  }, 0);

  const totalGain = totalValue - totalCost;
  const totalGainPercent = totalCost > 0 ? (totalGain / totalCost) * 100 : 0;
  const isPositive = totalGain >= 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Portfolio Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="text-center">
            <div className={`text-3xl font-bold font-mono ${
              isPositive ? 'text-success' : 'text-destructive'
            }`}>
              ${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="text-sm text-muted-foreground mt-1">Total Value</div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className={`text-lg font-semibold ${
                isPositive ? 'text-success' : 'text-destructive'
              }`}>
                {isPositive ? '+' : ''}${Math.abs(totalGain).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="text-xs text-muted-foreground">Total Gain/Loss</div>
            </div>
            <div className="text-center">
              <div className={`text-lg font-semibold ${
                isPositive ? 'text-success' : 'text-destructive'
              }`}>
                {isPositive ? '+' : ''}{totalGainPercent.toFixed(2)}%
              </div>
              <div className="text-xs text-muted-foreground">Total %</div>
            </div>
          </div>

          {portfolio.length > 0 && (
            <div className="border-t pt-4">
              <h3 className="text-sm font-medium text-muted-foreground mb-3">Top Holdings</h3>
              <div className="space-y-3">
                {portfolio.slice(0, 3).map((item) => {
                  if (!item.stock) return null;
                  
                  const shares = parseFloat(item.shares);
                  const currentPrice = parseFloat(item.stock.currentPrice);
                  const currentValue = shares * currentPrice;
                  const avgCost = parseFloat(item.avgCost);
                  const costBasis = shares * avgCost;
                  const gain = currentValue - costBasis;
                  const gainPercent = costBasis > 0 ? (gain / costBasis) * 100 : 0;
                  const isItemPositive = gain >= 0;

                  return (
                    <div key={item.id} className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center">
                          <span className="text-primary font-bold text-xs">
                            {item.stock.symbol.charAt(0)}
                          </span>
                        </div>
                        <span className="text-sm font-medium">{item.stock.symbol}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold">
                          ${currentValue.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                        </div>
                        <div className={`text-xs ${
                          isItemPositive ? 'text-success' : 'text-destructive'
                        }`}>
                          {isItemPositive ? '+' : ''}{gainPercent.toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
