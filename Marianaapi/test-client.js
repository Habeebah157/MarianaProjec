const { io } = require("socket.io-client");

const socket = io("http://localhost:9000");

socket.on("connect", () => {
  console.log("Connected with socket id:", socket.id);

  // Register this socket with your actual sender UUID
  socket.emit("register", "2c35e45a-c211-4937-ba6c-82896a7a156c");

  // Send a message to the receiver UUID
  socket.emit("send_message", {
    senderId: "2c35e45a-c211-4937-ba6c-82896a7a156c",
    receiverId: "d4e5f678-90ab-4cde-1234-567890abcdef",
    content: "Hello from user 2c35e45a!"
  });
});

// Listen for a message you might receive
socket.on("receive_message", (msg) => {
  console.log("Message received:", msg);
});

// Confirm that the message was sent
socket.on("message_sent", (msg) => {
  console.log("Message sent confirmation:", msg);
});

// Handle server-side errors
socket.on("error", (err) => {
  console.error("Error from server:", err);
});
