const { getSession } = require("./sessionManager");
const { getNextSequence } = require("../utils/sequence");

function handleMessage(ws, data) {
  console.log("messageHandler: handling message", data);

  const { sessionId, payload } = data;
  const session = getSession(sessionId);

  if (!session) {
    console.log("No session found");
    return;
  }

  const sequence = getNextSequence(session);

  const message = {
    sequence,
    payload
  };

  broadcast(session, message);
}

function broadcast(session, message) {
  session.clients.forEach(client => {
    client.send(JSON.stringify(message));
  });

  if (session.host) {
    session.host.send(JSON.stringify(message));
  }
}

module.exports = { handleMessage };
