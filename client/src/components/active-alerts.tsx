import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle, Info, X } from "lucide-react";
import { Alert } from "@/types/stock";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export function ActiveAlerts() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: alerts = [], isLoading } = useQuery<Alert[]>({
    queryKey: ['/api/alerts'],
    refetchInterval: 30000,
  });

  const deleteAlertMutation = useMutation({
    mutationFn: async (alertId: number) => {
      const response = await apiRequest('DELETE', `/api/alerts/${alertId}`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Alert dismissed",
        description: "The alert has been removed.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/alerts'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to dismiss alert",
        variant: "destructive",
      });
    },
  });

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'price_above':
        return <CheckCircle className="h-4 w-4" />;
      case 'price_below':
        return <AlertTriangle className="h-4 w-4" />;
      case 'volume_spike':
        return <Info className="h-4 w-4" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'price_above':
        return 'bg-success/10 border-success/20 text-success';
      case 'price_below':
        return 'bg-warning/10 border-warning/20 text-warning';
      case 'volume_spike':
        return 'bg-primary/10 border-primary/20 text-primary';
      default:
        return 'bg-primary/10 border-primary/20 text-primary';
    }
  };

  const getAlertDescription = (alert: Alert) => {
    switch (alert.type) {
      case 'price_above':
        return `Price above $${alert.targetValue}`;
      case 'price_below':
        return `Price below $${alert.targetValue}`;
      case 'volume_spike':
        return `Volume spike detected`;
      default:
        return `Alert triggered`;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Active Alerts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center justify-between p-3 border rounded-lg animate-pulse">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-muted rounded-full"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-muted rounded w-20"></div>
                    <div className="h-3 bg-muted rounded w-28"></div>
                  </div>
                </div>
                <div className="w-6 h-6 bg-muted rounded"></div>
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
          <CardTitle>Active Alerts</CardTitle>
          <Button variant="outline" size="sm">
            Manage
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {alerts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No active alerts</p>
            <p className="text-sm mt-2">Set up price alerts to stay informed</p>
          </div>
        ) : (
          <div className="space-y-4">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`flex items-center justify-between p-3 border rounded-lg ${getAlertColor(alert.type)}`}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-current/10 rounded-full flex items-center justify-center">
                    {getAlertIcon(alert.type)}
                  </div>
                  <div>
                    <div className="text-sm font-medium">{alert.symbol} Alert</div>
                    <div className="text-xs opacity-75">
                      {getAlertDescription(alert)}
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteAlertMutation.mutate(alert.id)}
                  disabled={deleteAlertMutation.isPending}
                  className="hover:bg-current/10"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
