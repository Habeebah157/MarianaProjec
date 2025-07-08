const express = require("express");
const router = express.Router();
const {verifyToken} = require("../middleware/authorization");
const pool = require("../db");

router.post("/", verifyToken, async (req, res) => {
  try {
    
    const { eventId, question } = req.body;
    console.log(eventId, question)
    const user_id = req.user?.id;

    if (!eventId || !question) {
        console.log("THIS")
  return res.status(400).json({ error: "eventId and question are required" });
}


    const result = await pool.query(
      `INSERT INTO event_questions (event_id, user_id, question)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [eventId, user_id, question]
    );

    res.status(201).json({
    success: true,
    data: result.rows[0]
    });
  } catch (err) {
    console.error("Error posting answer:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
});


router.get("/:eventId", verifyToken, async (req, res) => {
  const { eventId } = req.params;
  const currentUserId = req.user.id;

  try {
    if (!eventId) {
      return res.status(400).json({ error: "eventId is required" });
    }

    const result = await pool.query(
      `SELECT 
         q.id,
         q.question,
         q.created_at,
         u.user_name AS user_name,
         q.user_id
       FROM event_questions q
       LEFT JOIN users u ON q.user_id = u.id
       WHERE q.event_id = $1
       ORDER BY q.created_at ASC;`,
      [eventId]
    );

    const questionsWithCanDelete = result.rows.map((row) => ({
      ...row,
      canDelete: row.user_id === currentUserId,
    }));

    res.json({
      success: true,
      data: questionsWithCanDelete,
    });
  } catch (err) {
    console.error("Error fetching event questions:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
});


router.delete("/:questionId", verifyToken, async (req, res) => {
  const { questionId } = req.params;
  const userId = req.user.id;

  try {
    const result = await pool.query(
      `DELETE FROM event_questions 
       WHERE id = $1 AND user_id = $2
       RETURNING *`,
      [questionId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(403).json({ error: "Unauthorized or question not found" });
    }

    res.json({ success: true, message: "Question deleted" });
  } catch (err) {
    console.error("Error deleting question:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
});



module.exports = router;