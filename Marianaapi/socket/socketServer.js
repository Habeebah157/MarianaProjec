const { Server } = require("socket.io");

function initializeSocket(server, pool) {
  const io = new Server(server, { cors: { origin: "*" } });

  // Maps userId to socket.id for sending messages
  const onlineUsers = new Map();

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // User registers their userId after connection
    socket.on("register", (userId) => {
      onlineUsers.set(userId, socket.id);
      console.log("User registered:", userId);
    });

    // Listen for send_message event from sender
    socket.on("send_message", async ({ senderId, receiverId, content }) => {
      try {
        // Save message to DB
        const result = await pool.query(
          `INSERT INTO messages (sender_id, receiver_id, content) 
           VALUES ($1, $2, $3) RETURNING *`,
          [senderId, receiverId, content]
        );
        const message = result.rows[0];

        // Emit message to receiver if online
        const receiverSocketId = onlineUsers.get(receiverId);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit("receive_message", message);
        }

        // Also send back confirmation to sender (optional)
        socket.emit("message_sent", message);
      } catch (error) {
        console.error("Error saving message:", error);
        socket.emit("error", "Failed to send message");
      }
    });

    // Handle disconnect
    socket.on("disconnect", () => {
      for (const [userId, sockId] of onlineUsers.entries()) {
        if (sockId === socket.id) {
          onlineUsers.delete(userId);
          console.log("User disconnected:", userId);
          break;
        }
      }
    });
  });

  return io;
}

module.exports = { initializeSocket };
