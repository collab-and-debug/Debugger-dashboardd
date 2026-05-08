/**
 * websocket/handler.js
 * ====================
 * Handles all live WebSocket connections.
 *
 * What this file does (simple version):
 * Imagine a school hallway with many classrooms (sessions).
 * When a student (client) enters a classroom, we add them to the list.
 * When they shout something (send a message), everyone else in the
 * same classroom hears it (broadcast).
 * When they leave (disconnect), we remove them from the list.
 *
 * This file satisfies:
 *   ✅ latency-test.js   — echoes sentAt back so round-trip can be measured
 *   ✅ prod-test.js      — broadcasts to other clients in session
 *   ✅ ws-test.js        — full session join/leave/broadcast flow
 *   ✅ memory-leak-test  — cleans up sessions when empty (no leak)
 */

const { WebSocketServer } = require('ws');

// ── SESSION STORE ───────────────────────────────────────────────────────────
// sessions is a Map: sessionId → Set of WebSocket clients
// Example: { "room-abc" → Set([ws1, ws2, ws3]) }
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

  // ── KEY: delete the session when it is empty ──────────────────────────
  // This is what prevents memory leaks in the memory-leak-test.
  // Without this, empty sessions pile up forever.
  if (session.size === 0) {
    sessions.delete(sessionId);
  }
}

// ── BROADCAST ───────────────────────────────────────────────────────────────
// Send a message to every client in a session EXCEPT the sender
function broadcast(sessionId, senderWs, message) {
  const session = sessions.get(sessionId);
  if (!session) return;

  const data = typeof message === 'string' ? message : JSON.stringify(message);

  session.forEach((client) => {
    if (client !== senderWs && client.readyState === 1 /* OPEN */) {
      client.send(data);
    }
  });
}

// ── HANDLER ─────────────────────────────────────────────────────────────────
function setupWebSocketHandler(server) {
  const wss = new WebSocketServer({ server });

  wss.on('connection', (ws, req) => {
    // Parse sessionId and clientId from query string
    // e.g. ?session=room-abc&client=0
    const url      = new URL(req.url, 'http://localhost');
   const sessionId = url.searchParams.get('session') || 'default';
    const clientId  = url.searchParams.get('client')  || 'unknown';

    // Add this client to their session
    const session = getOrCreateSession(sessionId);
    session.add(ws);

    console.log(`[WS] Client "${clientId}" joined session "${sessionId}" (${session.size} in room)`);

    // ── ON MESSAGE ─────────────────────────────────────────────────────────
    ws.on('message', (rawData) => {
      let msg;

      // Try to parse as JSON
      try {
        msg = JSON.parse(rawData);
      } catch (_) {
        // Plain text message — echo it back as-is
        ws.send(rawData);
        return;
      }

      // ── ECHO BACK TO SENDER ──────────────────────────────────────────────
      // Always echo back to the sender.
      // This is what latency-test.js needs — it reads msg.sentAt from the reply
      // to calculate how long the round-trip took.
      ws.send(JSON.stringify({
        type:      'echo',
        sentAt:    msg.sentAt,   // ← latency-test reads this
        seq:       msg.seq,
        sessionId,
        clientId,
        echoed:    true,
      }));

      // ── BROADCAST TO OTHERS IN SESSION ───────────────────────────────────
      // Forward the original message to everyone else in the same room.
      // This is what prod-test.js Test 3 (broadcast test) checks.
      broadcast(sessionId, ws, msg);
    });

    // ── ON DISCONNECT ──────────────────────────────────────────────────────
    ws.on('close', () => {
      removeClientFromSession(sessionId, ws);
      console.log(`[WS] Client "${clientId}" left session "${sessionId}" (${(sessions.get(sessionId) || new Set()).size} remaining)`);

      // Notify remaining clients that someone left
      broadcast(sessionId, ws, {
        type:     'user_left',
        clientId,
        sessionId,
      });
    });

    // ── ON ERROR ───────────────────────────────────────────────────────────
    ws.on('error', (err) => {
      console.error(`[WS] Error from client "${clientId}" in session "${sessionId}":`, err.message);
      removeClientFromSession(sessionId, ws);
    });

    // ── WELCOME MESSAGE ────────────────────────────────────────────────────
    // Tell the new client they successfully joined
    ws.send(JSON.stringify({
      type:      'connected',
      sessionId,
      clientId,
      timestamp: Date.now(),
    }));
  });

  return wss;
}

// ── EXPORTS ─────────────────────────────────────────────────────────────────
module.exports = {
  setupWebSocketHandler,
  // Export internals so tests can inspect session state directly
  sessions,
  broadcast,
};
