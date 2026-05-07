const { getSession, deleteSession } = require("./sessionManager");

function handleDisconnect(ws) {
  const sessionId = ws.sessionId;
  const session = getSession(sessionId);

  if (!session) return;

  if (ws.role === "host") {
    session.clients.forEach(client => {
      client.send(JSON.stringify({
        type: "SESSION_ENDED"
      }));
      client.close();
    });

    deleteSession(sessionId);
    return;
  }

  session.clients.delete(ws);

  // If no clients are left, clean up when the host is gone too.
  if (session.clients.size === 0) {
    if (!session.host || session.host.readyState !== 1) {
      deleteSession(sessionId);
    }
  }
}

module.exports = { handleDisconnect };
