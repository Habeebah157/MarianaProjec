require('dotenv').config(); // Load environment variables at the very top
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const PORT = process.env.PORT || 9000;
const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const cors = require("cors");
const { google } = require("googleapis");
const http = require("http");

// Postgres pool import
const pool = require("./db");

// OAuth2 setup
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

// Create HTTP server
const server = http.createServer(app);

// ✅ Initialize Socket.IO (now modular and clean)
const { initializeSocket } = require("./socket/socketServer.js");
initializeSocket(server, pool);

// Middleware
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
app.use(cors());

// Routes
app.use("/auth", require("./routes/jwtAuth.js"));
app.use("/dashboard", require("./routes/dashboard.js"));
app.use("/questions", require("./routes/questions.js"));
app.use("/answers", require("./routes/answers.js"));
app.use("/ai", require("./routes/ai.js"));
app.use("/events", require("./routes/events.js"));
app.use("/question_votes", require("./routes/question_votes.js"));
app.use("/api/google", require("./routes/google.js")(oauth2Client));
app.use("/eventquestion", require("./routes/eventquestion.js"));
app.use("/eventquestionanswer", require("./routes/eventquestionanswer.js"));
app.use("/eventAttendance", require("./routes/event_attendees.js"));
app.use("/businesses", require("./routes/businesses.js"));
app.use("/business-users", require("./routes/business_users.js"));

// Debug logs
console.log("🔍 PGUSER from jwtAuth:", process.env.PGUSER);
console.log("🔍 DATABASE_URL from jwtAuth:", process.env.DATABASE_URL);
console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID);
console.log('GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET);
console.log('GOOGLE_REDIRECT_URI:', process.env.GOOGLE_REDIRECT_URI);

// Root route
app.get("/", (req, res) => {
  res.send("Hello World!");
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message });
});

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Server listening on port ${PORT}`);
});
