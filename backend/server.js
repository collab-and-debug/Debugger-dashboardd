const express = require('express');
const http = require('http');
const WebSocket = require('ws');

const app = express();
app.use(express.json());

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const sessions = {};

// Create session
app.post('/session/create', (req, res) => {
  const id = Math.random().toString(36).substring(2, 8);
  sessions[id] = { clients: [] };
  res.json({ sessionId: id });
});

// Join session
app.post('/session/join', (req, res) => {
  const { sessionId } = req.body;

  if (!sessions[sessionId]) {
    return res.status(404).json({ error: 'Session not found' });
  }

  res.json({ success: true });
});

// WebSocket logic
wss.on('connection', (ws, req) => {
  const url = new URL(req.url, 'http://localhost');
  const sessionId = url.searchParams.get('sessionId');

  if (!sessions[sessionId]) {
    ws.close();
    return;
  }

  sessions[sessionId].clients.push(ws);

  ws.on('message', (message) => {
    // broadcast to all clients
    sessions[sessionId].clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  });

  ws.on('close', () => {
    sessions[sessionId].clients =
      sessions[sessionId].clients.filter(c => c !== ws);
  });
});

server.listen(3000, () => {
  console.log('✅ Server running on port 3000');
});
