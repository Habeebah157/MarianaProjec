const express = require("express");
const router = express.Router();
const authorization = require("../middleware/authorization.js");
const pool = require("../db.js");

// POST /votes - cast a vote
router.post('/', authorization, async (req, res) => {
  try {
    const { question_id, vote } = req.body; // vote should be 'like' or 'dislike'
    const user_id = req.user.id;

    // Validate vote value
    if (!['like', 'dislike'].includes(vote)) {
      return res.status(400).json({ error: 'Invalid vote value. Use "like" or "dislike".' });
    }

    // Must provide question_id
    if (!question_id) {
      return res.status(400).json({ error: 'Must provide question_id' });
    }

    // Check if reaction exists for this user & question
    const existingReaction = await pool.query(
      `SELECT * FROM question_reactions WHERE user_id = $1 AND question_id = $2`,
      [user_id, question_id]
    );

    if (existingReaction.rows.length > 0) {
      // Update reaction if different
      if (existingReaction.rows[0].reaction_type !== vote) {
        await pool.query(
          `UPDATE question_reactions SET reaction_type = $1, created_at = NOW() WHERE id = $2`,
          [vote, existingReaction.rows[0].id]
        );
      } else {
        // Same reaction, no change
        // Just return counts
      }
    } else {
      // Insert new reaction
      await pool.query(
        `INSERT INTO question_reactions (user_id, question_id, reaction_type) VALUES ($1, $2, $3)`,
        [user_id, question_id, vote]
      );
    }

    // Get updated counts after change
    const counts = await pool.query(
      `SELECT 
         COUNT(*) FILTER (WHERE reaction_type = 'like') AS like_count,
         COUNT(*) FILTER (WHERE reaction_type = 'dislike') AS dislike_count
       FROM question_reactions WHERE question_id = $1`,
      [question_id]
    );

    return res.status(200).json({ 
      message: 'Reaction recorded',
      like_count: counts.rows[0].like_count,
      dislike_count: counts.rows[0].dislike_count
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
