import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { StockData } from "@/types/stock";

interface StockChartProps {
  stock: StockData | null;
}

export function StockChart({ stock }: StockChartProps) {
  const [timeframe, setTimeframe] = useState("1M");

  // Generate mock historical data for demonstration
  const generateMockData = () => {
    const data = [];
    const basePrice = stock ? parseFloat(stock.currentPrice) : 100;
    const days = timeframe === "1D" ? 1 : timeframe === "1W" ? 7 : timeframe === "1M" ? 30 : timeframe === "3M" ? 90 : 365;
    
    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const variation = (Math.random() - 0.5) * 10;
      const price = basePrice + variation;
      
      data.push({
        date: date.toISOString().split('T')[0],
        price: price,
        volume: Math.floor(Math.random() * 10000000) + 1000000,
      });
    }
    
    return data;
  };

  const chartData = generateMockData();

  if (!stock) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Stock Chart</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-80 text-muted-foreground">
            <p>Select a stock to view its chart</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const changePercent = parseFloat(stock.changePercent);
  const changeAmount = parseFloat(stock.changeAmount);
  const isPositive = changePercent >= 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{stock.symbol} - {stock.name}</CardTitle>
            <div className="flex items-center space-x-4 mt-2">
              <span className="text-2xl font-bold font-mono">${stock.currentPrice}</span>
              <Badge variant="outline" className={`${
                isPositive 
                  ? 'border-success text-success' 
                  : 'border-destructive text-destructive'
              }`}>
                {isPositive ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                {isPositive ? '+' : ''}{changeAmount.toFixed(2)} ({isPositive ? '+' : ''}{changePercent.toFixed(2)}%)
              </Badge>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {["1D", "1W", "1M", "3M", "1Y"].map((tf) => (
              <Button
                key={tf}
                variant={timeframe === tf ? "default" : "outline"}
                size="sm"
                onClick={() => setTimeframe(tf)}
              >
                {tf}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="date" 
                className="text-muted-foreground text-xs"
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                className="text-muted-foreground text-xs"
                tick={{ fontSize: 12 }}
                domain={['dataMin - 5', 'dataMax + 5']}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '6px',
                }}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
              />
              <Line 
                type="monotone" 
                dataKey="price" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: 'hsl(var(--primary))' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
