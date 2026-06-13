import { useEffect, useRef, useCallback } from "react";

const WORKER_URL = "https://bear-color-worker.jaydubberlieau.workers.dev";

export function useGameSocket({ code, role, nickname, onMessage, enabled = true }) {
  const wsRef = useRef(null);
  const pingRef = useRef(null);

  const send = useCallback((msg) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(msg));
    }
  }, []);

  useEffect(() => {
    if (!enabled || !code || !nickname) return;

    const wsUrl = `${WORKER_URL.replace("https://", "wss://")}/ws/${code}?role=${role}&nickname=${encodeURIComponent(nickname)}`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onmessage = (e) => {
      try { onMessage(JSON.parse(e.data)); } catch {}
    };

    ws.onopen = () => {
      pingRef.current = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify({ type: "ping" }));
      }, 25000);
    };

    ws.onclose = () => {
      clearInterval(pingRef.current);
      onMessage({ type: "_disconnected" });
    };

    ws.onerror = () => {
      onMessage({ type: "_error" });
    };

    return () => {
      clearInterval(pingRef.current);
      ws.close();
    };
  }, [enabled, code, role, nickname]);

  return { send };
}

export async function createRoom() {
  const res = await fetch(`${WORKER_URL}/create`, { method: "POST" });
  if (!res.ok) throw new Error("Failed to create room");
  return res.json();
}
