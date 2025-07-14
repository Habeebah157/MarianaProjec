const express = require('express');
const router = express.Router();
const pool = require('../db'); // Your PostgreSQL pool/connection
const {verifyToken} = require("../middleware/authorization.js");


router.get('/:userId/conversations', verifyToken, async (req, res) => {
  try {
    const { userId } = req.params;

    if (req.user.id !== userId) {
      return res.status(403).json({ error: "Forbidden" });
    }

    // Step 1: Get distinct other user IDs from messages
    const query = `
      SELECT DISTINCT
        CASE
          WHEN sender_id = $1 THEN receiver_id
          ELSE sender_id
        END AS other_user_id
      FROM messages
      WHERE (sender_id = $1 OR receiver_id = $1)
        AND sender_id != receiver_id
    `;
    const { rows: otherUsers } = await pool.query(query, [userId]);

    // Step 2: For each user ID, fetch user_name from users table
    const results = [];
    for (const user of otherUsers) {
      const userId = user.other_user_id;
      const userResult = await pool.query(
        `SELECT user_name FROM users WHERE id = $1`,
        [userId]
      );

      if (userResult.rows.length > 0) {
        results.push({
          id: userId,
          user_name: userResult.rows[0].user_name,
        });
      }
    }

    // Step 3: Return combined list of user ids and usernames
    res.json(results);

  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

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
