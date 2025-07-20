const { Server } = require("socket.io");

function initializeSocket(server, pool) {
  if (!pool) {
    throw new Error("PostgreSQL pool is undefined. Cannot initialize socket server.");
  }

  const io = new Server(server, { cors: { origin: "*" } });

  const onlineParticipants = new Map();

  io.on("connection", (socket) => {
    console.log("Participant connected:", socket.id);

    socket.on("register", (participantId) => {
      console.log("Received register event with participantId:", participantId);
      if (!participantId) {
        console.warn("No participantId provided on register");
        return;
      }
      onlineParticipants.set(participantId, socket.id);
      console.log("Participant registered:", participantId);
    });

    socket.on("send_message", async ({ senderId, receiverId, content }) => {
      try {
        console.log("Received message from:", senderId, "to:", receiverId, "content:", content);
        if (!senderId || !receiverId || !content) {
          throw new Error("Missing required message fields");
        }

        const result = await pool.query(
          `INSERT INTO messages (sender_id, receiver_id, content) 
           VALUES ($1, $2, $3) RETURNING *`,
          [senderId, receiverId, content]
        );
        const message = result.rows[0];

        const receiverSocketId = onlineParticipants.get(receiverId);
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
      for (const [participantId, sockId] of onlineParticipants.entries()) {
        if (sockId === socket.id) {
          onlineParticipants.delete(participantId);
          console.log("Participant disconnected:", participantId);
          break;
        }
      }
    });
  });

  return io;
}

module.exports = { initializeSocket };
