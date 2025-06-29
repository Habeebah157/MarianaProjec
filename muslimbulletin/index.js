require('dotenv').config(); // At the top of your fileconst nodemailer = require("nodemailer");
const crypto = require("crypto");
const PORT = process.env.PORT || 9000;
const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const cors = require("cors");
const {google} = require("googleapis");

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

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});