const { WebSocketServer } = require('ws');

// ── SESSION STORE ───────────────────────────────────────────
const sessions = new Map();

function getOrCreateSession(sessionId) {
  if (!sessions.has(sessionId)) {
    sessions.set(sessionId, new Set());
  }
  return sessions.get(sessionId);
}

function removeClientFromSession(sessionId, ws) {
  const session = sessions.get(sessionId);
  if (!session) return;

  session.delete(ws);

  if (session.size === 0) {
    sessions.delete(sessionId);
  }
}

// ── BROADCAST ───────────────────────────────────────────────
function broadcast(sessionId, senderWs, message) {
  const session = sessions.get(sessionId);
  if (!session) return;

  const data =
    typeof message === 'string'
      ? message
      : JSON.stringify(message);

  session.forEach((client) => {
    if (client !== senderWs && client.readyState === 1) {
      client.send(data);
    }
  });
}

// ── HANDLER ─────────────────────────────────────────────────
function setupWebSocketHandler(server) {
  const wss = new WebSocketServer({ server });

  wss.on('connection', (ws, req) => {
    const url = new URL(req.url, 'http://localhost');
    const sessionId = url.searchParams.get('session') || 'default';
    const clientId = url.searchParams.get('client') || 'unknown';

    const session = getOrCreateSession(sessionId);
    session.add(ws);

    console.log(`[WS] ${clientId} joined ${sessionId}`);

    // ── MESSAGE ─────────────────────────────────────────────
    ws.on('message', (rawData) => {
      let msg;

      try {
        msg = JSON.parse(rawData);
      } catch {
        ws.send(rawData);
        return;
      }

      // ✅ FIXED: exact echo
      ws.send(JSON.stringify({
        ...msg,
        echoed: true
      }));

      // ✅ broadcast original message
      broadcast(sessionId, ws, msg);
    });

    // ── CLOSE ───────────────────────────────────────────────
    ws.on('close', () => {
      removeClientFromSession(sessionId, ws);

      broadcast(sessionId, ws, {
        type: 'user_left',
        clientId,
        sessionId,
      });
    });

    ws.on('error', () => {
      removeClientFromSession(sessionId, ws);
    });

    // ── CONNECT MESSAGE ─────────────────────────────────────
    ws.send(JSON.stringify({
      type: 'connected',
      sessionId,
      clientId,
      timestamp: Date.now(),
    }));
  });

  return wss;
}

module.exports = {
  setupWebSocketHandler,
  sessions,
  broadcast,
};