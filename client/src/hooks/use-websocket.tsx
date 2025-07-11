import { useEffect, useRef, useState } from "react";
import { StockUpdate } from "@/types/stock";

interface UseWebSocketProps {
  onStockUpdate?: (data: StockUpdate) => void;
}

export function useWebSocket({ onStockUpdate }: UseWebSocketProps = {}) {
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const subscriptionsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);
      // Re-subscribe to all symbols
      subscriptionsRef.current.forEach(symbol => {
        ws.send(JSON.stringify({ type: 'subscribe', symbol }));
      });
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        if (message.type === 'stock_update' && onStockUpdate) {
          onStockUpdate(message.data);
        }
      } catch (error) {
        console.error('WebSocket message parse error:', error);
      }
    };

    ws.onclose = () => {
      setIsConnected(false);
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    return () => {
      ws.close();
    };
  }, [onStockUpdate]);

  const subscribe = (symbol: string) => {
    subscriptionsRef.current.add(symbol);
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'subscribe', symbol }));
    }
  };

  const unsubscribe = (symbol: string) => {
    subscriptionsRef.current.delete(symbol);
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'unsubscribe', symbol }));
    }
  };

  return {
    isConnected,
    subscribe,
    unsubscribe,
  };
}
