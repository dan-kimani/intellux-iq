import type { ServerWebSocket } from "bun";

const port = Number(process.env.SYNC_PORT ?? 3002);

type SocketData = {
  deviceId: string;
  lastSeq: number;
};

const server = Bun.serve<SocketData>({
  port,
  fetch(request, websocketServer) {
    const url = new URL(request.url);

    if (url.pathname === "/health") {
      return Response.json({ ok: true, service: "sync" });
    }

    if (url.pathname === "/sync") {
      const upgraded = websocketServer.upgrade(request, {
        data: { deviceId: url.searchParams.get("device_id") ?? "unknown", lastSeq: 0 },
      });
      return upgraded ? undefined : new Response("WebSocket upgrade failed", { status: 400 });
    }

    return new Response("Not found", { status: 404 });
  },
  websocket: {
    open(ws: ServerWebSocket<SocketData>) {
      ws.send(JSON.stringify({ type: "sync.ready", device_id: ws.data.deviceId, seq: 0 }));
    },
    message(ws: ServerWebSocket<SocketData>, message) {
      ws.send(
        JSON.stringify({ type: "sync.ack", received: String(message), seq: ws.data.lastSeq }),
      );
    },
    close(_ws: ServerWebSocket<SocketData>, _code, _reason) {},
  },
});

console.log(`IntelluxIQ sync listening on ws://localhost:${server.port}/sync`);
