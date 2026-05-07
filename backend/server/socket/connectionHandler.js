const {
  createSession,
  getSession
} = require("./sessionManager");
const { handleMessage } = require("./messageHandler");
const { handleDisconnect } = require("./cleanup");

function handleConnection(ws, req) {
  ws.on("message", raw => {
    let data;

    try {
      data = JSON.parse(raw);
    } catch (err) {
      ws.send(JSON.stringify({ type: "ERROR", message: "Invalid JSON payload" }));
      return;
    }

    switch (data.type) {
      case "CREATE_SESSION":
        createSession(data.sessionId, ws);
        ws.sessionId = data.sessionId;
        ws.role = "host";
        break;

      case "JOIN_SESSION": {
        const session = getSession(data.sessionId);
        if (!session) return;

        session.clients.add(ws);
        ws.sessionId = data.sessionId;
        ws.role = "client";
        break;
      }

      case "MESSAGE":
        handleMessage(ws, data);
        break;

      default:
        ws.send(JSON.stringify({ type: "ERROR", message: "Unknown message type" }));
    }
  });

  ws.on("close", () => {
    handleDisconnect(ws);
  });
}

module.exports = { handleConnection };
