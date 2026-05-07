const WebSocket = require("ws");

const ws = new WebSocket("ws://localhost:3000");

ws.on("open", () => {
  console.log("Client connected");

  ws.send(JSON.stringify({
    type: "CREATE_SESSION",
    sessionId: "abc123"
  }));

  console.log("Sent CREATE_SESSION");

  setTimeout(() => {
    ws.send(JSON.stringify({
      type: "MESSAGE",
      sessionId: "abc123",
      payload: "Hello World"
    }));

    console.log("Sent MESSAGE");
  }, 1000);

  setTimeout(() => {
    console.log("Closing client");
    ws.close();
  }, 5000);
});

ws.on("message", (data) => {
  console.log("Received:", data.toString());
});

ws.on("close", () => {
  console.log("Client disconnected");
});
