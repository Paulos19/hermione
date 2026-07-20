import { useEffect, useRef, useState } from 'react';

const WS_BASE_URL = process.env.NEXT_PUBLIC_WS_URL || 'wss://services-websckt.khdya3.easypanel.host';
const WS_URL = `${WS_BASE_URL}/ws/chat`;

export function useChatWebSocket(
  sessionId: string | null,
  token: string | null,
  onMessageReceived: (message: any) => void,
  onSystemMessage: (content: string) => void,
  onError: (content: string) => void
) {
  const ws = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!sessionId || !token) {
      if (ws.current) {
        ws.current.close();
      }
      return;
    }

    const connect = () => {
      // Diferente do mobile, vamos passar apenas o caminho base, a identificação vai no payload
      ws.current = new WebSocket(WS_URL);

      ws.current.onopen = () => {
        console.log('WS Chat connected na Web');
        setIsConnected(true);
        // Junta-se à sala (opcional, pois o backend lida com isso na mensagem, mas adicionamos na refatoração)
        ws.current?.send(JSON.stringify({ type: 'join', sessionId, token }));
      };

      ws.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === 'message') {
            // Clean trailing "undefined" artifact from n8n/WS pipeline
            const msg = data.message;
            if (msg && typeof msg.content === 'string') {
              msg.content = msg.content.replace(/undefined$/g, '').trim();
            }
            onMessageReceived(msg);
          } else if (data.type === 'system') {
            onSystemMessage(data.content);
          } else if (data.type === 'error') {
            onError(data.message);
          } else if (data.type === 'pong') {
            // Heartbeat
          }
        } catch (error) {
          console.error('Error parsing WS message', error);
        }
      };

      ws.current.onclose = () => {
        console.log('WS Chat disconnected');
        setIsConnected(false);
        // Reconnect after 3s
        setTimeout(connect, 3000);
      };

      ws.current.onerror = () => {
        console.warn(`[WS Chat] Não foi possível conectar ao servidor: ${WS_URL}. Verifique se o servidor websocket está rodando (node src/server.js).`);
      };
    };

    connect();

    const interval = setInterval(() => {
      if (ws.current?.readyState === WebSocket.OPEN) {
        ws.current.send(JSON.stringify({ type: 'ping' }));
      }
    }, 30000);

    return () => {
      clearInterval(interval);
      if (ws.current) {
        ws.current.onclose = null; // Prevent reconnect on unmount
        ws.current.close();
      }
    };
  }, [sessionId, token]);

  const sendChatMessage = (content: string, bookId?: string) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({
        type: 'chat',
        sessionId,
        content,
        bookId,
        token
      }));
      return true;
    }
    return false;
  };

  return { isConnected, sendChatMessage };
}
