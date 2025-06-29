const express = require("express");
const router = express.Router();
const authorization = require("../middleware/authorization");
const pool = require("../db");

router.post("/", authorization, async (req, res) => {
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


router.get("/:eventId", authorization, async (req, res) => {
  const { eventId } = req.params;

  try {
    if (!eventId) {
      return res.status(400).json({ error: "eventId is required" });
    }

    const result = await pool.query(
      `SELECT 
         q.id,
         q.question,
         q.created_at,
         u.name AS user_name
       FROM event_questions q
       LEFT JOIN users u ON q.user_id = u.id
       WHERE q.event_id = $1
       ORDER BY q.created_at ASC`,
      [eventId]
    );

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (err) {
    console.error("Error fetching event questions:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
});



module.exports = router;