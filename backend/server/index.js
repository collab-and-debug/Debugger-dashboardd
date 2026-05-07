const http = require("http");
const WebSocket = require("ws");
const { handleConnection } = require("./socket/connectionHandler");

const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
  if (req.url === "/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ status: "OK" }));
  } else {
    res.writeHead(404);
    res.end();
  }
});

const wss = new WebSocket.Server({ server });
let activeConnections = 0;

wss.on("connection", (ws, req) => {
  activeConnections++;
  console.log(`New client connected. Total: ${activeConnections}`);

  ws.isAlive = true;

  ws.on("pong", () => {
    ws.isAlive = true;
  });

  handleConnection(ws, req);

  ws.on("close", () => {
    activeConnections--;
    console.log(`Client disconnected. Total: ${activeConnections}`);
  });

  ws.on("error", (err) => {
    console.error("WebSocket error:", err.message);
  });
});

// Heartbeat prevents stale connections from staying open forever.
const interval = setInterval(() => {
  wss.clients.forEach((ws) => {
    if (!ws.isAlive) {
      console.log("Terminating stale connection");
      return ws.terminate();
    }

    ws.isAlive = false;
    ws.ping();
  });
}, 30000);

wss.on("close", () => {
  clearInterval(interval);
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
