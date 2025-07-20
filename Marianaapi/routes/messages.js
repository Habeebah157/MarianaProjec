const express = require('express');
const router = express.Router();
const pool = require('../db'); // Your PostgreSQL pool/connection
const {verifyToken} = require("../middleware/authorization.js");
const upload = require("../middleware/cloudinaryUpload");
const multer = require('multer');


router.get('/:userId/conversations', verifyToken, async (req, res) => {
  try {
    const { userId } = req.params;

    if (req.user.id !== userId) {
      return res.status(403).json({ error: "Forbidden" });
    }

    // Step 1: Get distinct other participant IDs from messages
    const query = `
      SELECT DISTINCT
        CASE
          WHEN sender_id = $1 THEN receiver_id
          ELSE sender_id
        END AS other_participant_id
      FROM messages
      WHERE (sender_id = $1 OR receiver_id = $1)
        AND sender_id != receiver_id
    `;
    const { rows: otherParticipants } = await pool.query(query, [userId]);

    // Step 2: Fetch names from users or businesses based on type
    const results = [];
    for (const { other_participant_id } of otherParticipants) {
      // First, get the type (user or business)
      const typeRes = await pool.query(
        `SELECT type FROM participants WHERE id = $1`,
        [other_participant_id]
      );

      if (typeRes.rows.length === 0) continue;

      const type = typeRes.rows[0].type;
      let name = "";

      if (type === "user") {
        const userRes = await pool.query(
          `SELECT user_name FROM users WHERE id = $1`,
          [other_participant_id]
        );
        if (userRes.rows.length > 0) {
          name = userRes.rows[0].user_name;
        }
      } else if (type === "business") {
        const bizRes = await pool.query(
          `SELECT name FROM businesses WHERE id = $1`,
          [other_participant_id]
        );
        if (bizRes.rows.length > 0) {
          name = bizRes.rows[0].name;
        }
      }

      if (name) {
        results.push({
          id: other_participant_id,
          name,
          type
        });
      }
    }

    res.json(results);

  } catch (err) {
    console.error("Server error:", err.message || err);
    res.status(500).send("Server error");
  }
});

// GET messages between userId and receiverId

router.get('/:userId/:receiverId', verifyToken, async (req, res) => {
  try {
    const { userId, receiverId } = req.params;

    if (req.user.id !== userId) {
      return res.status(403).json({ error: "Forbidden" });
    }

    // Optional: Check if both participants exist
    const participantCheck = await pool.query(
      `SELECT id FROM participants WHERE id = ANY($1::uuid[])`,
      [[userId, receiverId]]
    );

    if (participantCheck.rowCount < 2) {
      return res.status(404).json({ error: "One or both participants not found" });
    }

    const query = `
      SELECT * FROM messages
      WHERE 
        (sender_id = $1 AND receiver_id = $2)
        OR
        (sender_id = $2 AND receiver_id = $1)
      ORDER BY sent_at ASC
    `;

    const { rows } = await pool.query(query, [userId, receiverId]);
    res.json(rows);
  } catch (err) {
    console.error("error", err.message);
    res.status(500).send("Server error");
  }
});

router.post("/:userId/send-voice", verifyToken, (req, res) => {
  upload.single("voiceNote")(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ error: err.message });
    } else if (err) {
      return res.status(500).json({ error: err.message || "Unknown error" });
    }

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    if (req.user.id !== req.params.userId) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const { receiverId } = req.body;

    try {
      // Optional: Validate receiverId exists in participants
      const receiverCheck = await pool.query(
        `SELECT id FROM participants WHERE id = $1`,
        [receiverId]
      );

      if (receiverCheck.rowCount === 0) {
        return res.status(404).json({ error: "Receiver not found" });
      }

      // Insert message into DB
      const result = await pool.query(
        `INSERT INTO messages (sender_id, receiver_id, content, sent_at) 
         VALUES ($1, $2, $3, NOW()) RETURNING *`,
        [req.params.userId, receiverId, req.file.path]
      );

      res.json(result.rows[0]);
    } catch (e) {
      console.error("Failed to save voice message:", e);
      res.status(500).json({ error: "Failed to save voice message" });
    }
  });
});


module.exports = router;
