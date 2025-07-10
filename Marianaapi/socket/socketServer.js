const { Server } = require("socket.io");

function initializeSocket(server, pool) {
  if (!pool) {
    throw new Error("PostgreSQL pool is undefined. Cannot initialize socket server.");
  }

  const io = new Server(server, { cors: { origin: "*" } });

  const onlineUsers = new Map();

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("register", (userId) => {
      if (!userId) {
        console.warn("No userId provided on register");
        return;
      }
      onlineUsers.set(userId, socket.id);
      console.log("User registered:", userId);
    });

    socket.on("send_message", async ({ senderId, receiverId, content }) => {
      try {
        if (!senderId || !receiverId || !content) {
          throw new Error("Missing required message fields");
        }

        const result = await pool.query(
          `INSERT INTO messages (sender_id, receiver_id, content) 
           VALUES ($1, $2, $3) RETURNING *`,
          [senderId, receiverId, content]
        );
        const message = result.rows[0];

        const receiverSocketId = onlineUsers.get(receiverId);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit("receive_message", message);
        }

        socket.emit("message_sent", message);
      } catch (error) {
        console.error("Error saving message:", error.message || error);
        socket.emit("error", "Failed to send message");
      }
    });

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
