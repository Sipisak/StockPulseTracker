import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Clock } from "lucide-react";

interface NewsItem {
  id: number;
  title: string;
  source: string;
  time: string;
  url?: string;
  category?: string;
}

export function MarketNews() {
  // Mock news data - in a real app, this would come from a news API
  const news: NewsItem[] = [
    {
      id: 1,
      title: "Apple Reports Strong Q4 Earnings, Stock Rises 3%",
      source: "MarketWatch",
      time: "2h ago",
      category: "earnings",
    },
    {
      id: 2,
      title: "Tesla Announces New Gigafactory in Texas",
      source: "Reuters",
      time: "4h ago",
      category: "business",
    },
    {
      id: 3,
      title: "Federal Reserve Signals Rate Cut in December",
      source: "Bloomberg",
      time: "6h ago",
      category: "monetary-policy",
    },
    {
      id: 4,
      title: "Tech Stocks Rally on AI Breakthrough News",
      source: "CNBC",
      time: "8h ago",
      category: "technology",
    },
    {
      id: 5,
      title: "Oil Prices Surge on Middle East Tensions",
      source: "Financial Times",
      time: "10h ago",
      category: "commodities",
    },
  ];

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'earnings':
        return 'bg-success/10 text-success';
      case 'business':
        return 'bg-primary/10 text-primary';
      case 'monetary-policy':
        return 'bg-warning/10 text-warning';
      case 'technology':
        return 'bg-purple-100 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400';
      case 'commodities':
        return 'bg-orange-100 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Market News</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {news.map((article) => (
            <div key={article.id} className="border-b border-border pb-4 last:border-b-0 last:pb-0">
              <div className="flex items-start space-x-3">
                <div className="flex-1">
                  <h3 className="text-sm font-medium hover:text-primary transition-colors cursor-pointer line-clamp-2">
                    {article.title}
                  </h3>
                  <div className="flex items-center space-x-2 mt-2">
                    <Badge variant="secondary" className="text-xs">
                      {article.source}
                    </Badge>
                    {article.category && (
                      <Badge variant="outline" className={`text-xs ${getCategoryColor(article.category)}`}>
                        {article.category}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center space-x-2 mt-2 text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span className="text-xs">{article.time}</span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-1 h-auto"
                  onClick={() => {
                    // In a real app, this would open the full article
                    console.log('Open article:', article.title);
                  }}
                >
                  <ExternalLink className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
