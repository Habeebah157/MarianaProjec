const express = require('express');
const router = express.Router();
const pool = require('../db'); // Your PostgreSQL pool/connection
const {verifyToken} = require("../middleware/authorization.js");

// GET messages between userId and receiverId
router.get('/:userId/:receiverId', verifyToken, async (req, res) => {
  try {
    
    const { userId, receiverId } = req.params;
    console.log("userId",userId, req.user.id)
    if (req.user.id !== userId) {
      return res.status(403).json({ error: "Forbidden" });
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
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

module.exports = router;
