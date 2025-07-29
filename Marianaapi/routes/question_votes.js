const express = require("express");
const router = express.Router();
const {verifyToken} = require("../middleware/authorization.js");
const pool = require("../db.js");


// GET /questions - list questions with user reaction and counts
router.get("/", verifyToken, async (req, res) => {
  try {
    const user_id = req.user.id;
    const query = `
      SELECT
        q.id,
        q.user_id,
        u.user_name,
        q.title,
        q.body,
        q.created_at,
        q.search_vector,
        COALESCE(like_counts.like_count, 0) AS like_count,
        COALESCE(dislike_counts.dislike_count, 0) AS dislike_count,
        COALESCE(answer_counts.answer_count, 0) AS answer_count,
        ur.reaction_type AS user_reaction
      FROM questions q
      LEFT JOIN users u ON q.user_id = u.id
      LEFT JOIN (
        SELECT question_id, COUNT(*) AS like_count
        FROM question_reactions
        WHERE reaction_type = 'like'
        GROUP BY question_id
      ) like_counts ON like_counts.question_id = q.id
      LEFT JOIN (
        SELECT question_id, COUNT(*) AS dislike_count
        FROM question_reactions
        WHERE reaction_type = 'dislike'
        GROUP BY question_id
      ) dislike_counts ON dislike_counts.question_id = q.id
      LEFT JOIN (
        SELECT question_id, COUNT(*) AS answer_count
        FROM event_questions_answers
        GROUP BY question_id
      ) answer_counts ON answer_counts.question_id = q.id
      LEFT JOIN question_reactions ur ON ur.question_id = q.id AND ur.user_id = $1
      ORDER BY q.created_at DESC
    `;

    const { rows } = await pool.query(query, [user_id]);

    res.json({ questions: rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/question_votes", verifyToken, async (req, res) => {
  try {
    const { question_id, vote } = req.body;
    const user_id = req.user.id;

    if (!["like", "dislike"].includes(vote)) {
      return res.status(400).json({ error: 'Invalid vote value. Use "like" or "dislike".' });
    }

    if (!question_id) {
      return res.status(400).json({ error: "Must provide question_id" });
    }

    // Check existing reaction
    const existingReaction = await pool.query(
      `SELECT * FROM question_reactions WHERE user_id = $1 AND question_id = $2`,
      [user_id, question_id]
    );

    if (existingReaction.rows.length > 0) {
      // Update if different
      if (existingReaction.rows[0].reaction_type !== vote) {
        await pool.query(
          `UPDATE question_reactions SET reaction_type = $1, created_at = NOW() WHERE id = $2`,
          [vote, existingReaction.rows[0].id]
        );
      }
      // else same reaction: do nothing
    } else {
      // Insert new reaction
      await pool.query(
        `INSERT INTO question_reactions (user_id, question_id, reaction_type) VALUES ($1, $2, $3)`,
        [user_id, question_id, vote]
      );
    }

    // Get updated counts
    const counts = await pool.query(
      `SELECT 
         COUNT(*) FILTER (WHERE reaction_type = 'like') AS like_count,
         COUNT(*) FILTER (WHERE reaction_type = 'dislike') AS dislike_count
       FROM question_reactions WHERE question_id = $1`,
      [question_id]
    );

    return res.status(200).json({
      message: "Reaction recorded",
      like_count: counts.rows[0].like_count,
      dislike_count: counts.rows[0].dislike_count,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});


module.exports = router;
