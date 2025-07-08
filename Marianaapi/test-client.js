const { io } = require("socket.io-client");

const socket = io("http://localhost:9000");

socket.on("connect", () => {
  console.log("Connected with socket id:", socket.id);

  // Register user id for this client
  socket.emit("register", "user123");

  // Send a message after 2 seconds
  setTimeout(() => {
    socket.emit("send_message", {
      senderId: "user123",
      receiverId: "user456",
      content: "Hello from test client!"
    });
  }, 2000);
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
