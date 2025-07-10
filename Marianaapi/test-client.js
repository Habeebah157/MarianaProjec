const { io } = require("socket.io-client");

const socket = io("http://localhost:9000");

socket.on("connect", () => {
  console.log("Connected with socket id:", socket.id);

  // Register user id for this client (use actual UUID here)
  socket.emit("register", "550e8400-e29b-41d4-a716-446655440000");

  // Send a message right after connecting
  socket.emit("send_message", {
    senderId: "550e8400-e29b-41d4-a716-446655440000",
    receiverId: "d4e5f678-90ab-4cde-1234-567890abcdef",
    content: "Hello from user123!"
  });
});

socket.on("receive_message", (msg) => {
  console.log("Message received:", msg);
});

socket.on("message_sent", (msg) => {
  console.log("Message sent confirmation:", msg);
});

socket.on("error", (err) => {
  console.error("Error from server:", err);
});
