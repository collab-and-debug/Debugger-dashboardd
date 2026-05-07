const sessions = new Map();

function createSession(sessionId, hostSocket) {
  console.log("sessionManager: creating session", sessionId);

  sessions.set(sessionId, {
    host: hostSocket,
    clients: new Set(),
    sequence: 0
  });
}

function getSession(sessionId) {
  return sessions.get(sessionId);
}

function deleteSession(sessionId) {
  sessions.delete(sessionId);
}

module.exports = {
  createSession,
  getSession,
  deleteSession
};
