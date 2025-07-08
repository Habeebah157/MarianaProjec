require('dotenv').config(); // Load environment variables at the very top
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const PORT = process.env.PORT || 9000;
const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const cors = require("cors");
const { google } = require("googleapis");

// For HTTP server and Socket.IO
const http = require("http");
const { Server } = require("socket.io");

// Postgres pool import — adjust path if needed
const { pool } = require("./db");

// Enhanced Body Parser Configuration
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

app.use(bodyParser.json({
  limit: '10mb',
  verify: (req, res, buf) => {
    try {
      JSON.parse(buf.toString());
    } catch (e) {
      throw new Error('Invalid JSON');
    }
  }
}));
app.use(bodyParser.urlencoded({ extended: true }));

console.log("🔍 PGUSER from jwtAuth:", process.env.PGUSER);
console.log("🔍 DATABASE_URL from jwtAuth:", process.env.DATABASE_URL);

// CORS and Routes
app.use(cors());
app.use("/auth", require("./routes/jwtAuth.js"));
app.use("/dashboard", require("./routes/dashboard.js"));
app.use("/questions", require("./routes/questions.js"));
app.use("/answers", require("./routes/answers.js"));
app.use("/ai", require("./routes/ai.js"));
app.use("/events", require("./routes/events.js"));
app.use("/question_votes", require("./routes/question_votes.js"));
app.use("/api/google", require("./routes/google.js")(oauth2Client));
app.use("/eventquestion", require("./routes/eventquestion.js"))
app.use("/eventquestionanswer", require("./routes/eventquestionanswer.js"))
app.use("/eventAttendance", require("./routes/event_attendees.js"))
app.use('/businesses', require("./routes/businesses.js"));
app.use('/business-users', require("./routes/business_users.js"));

console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID);
console.log('GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET);
console.log('GOOGLE_REDIRECT_URI:', process.env.GOOGLE_REDIRECT_URI);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

// Error Handling Middleware (Add this new)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message });
});

// Create HTTP server for socket.io
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

// Map userId to socket.id
const onlineUsers = new Map();

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("register", (userId) => {
    onlineUsers.set(userId, socket.id);
    console.log("User registered:", userId);
  });

  socket.on("send_message", async ({ senderId, receiverId, content }) => {
    try {
      const result = await pool.query(
        `INSERT INTO messages (sender_id, receiver_id, content) VALUES ($1, $2, $3) RETURNING *`,
        [senderId, receiverId, content]
      );
      const message = result.rows[0];

      const receiverSocketId = onlineUsers.get(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("receive_message", message);
      }

      socket.emit("message_sent", message);
    } catch (error) {
      console.error("Error saving message:", error);
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

// Change app.listen to server.listen so socket.io works
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
