const express = require("express");
const router = express.Router();
const authorization = require("../middleware/authorization");
const pool = require("../db");

// POST /event-questions-answers
// Create a new answer for a question
// POST /eventquestionanswer
router.post("/", authorization, async (req, res) => {
  try {
    const { question_id, answer } = req.body;
    const user_id = req.user?.id;

    if (!question_id || !answer) {
      return res.status(400).json({ error: "question_id and answer are required" });
    }

    // Step 1: Find the event_id related to the question
    const questionRes = await pool.query(
      `SELECT event_id FROM event_questions WHERE id = $1`,
      [question_id]
    );

    if (questionRes.rows.length === 0) {
      return res.status(404).json({ error: "Question not found" });
    }

    const event_id = questionRes.rows[0].event_id;

    // Step 2: Check if current user is the organizer of that event
    const eventRes = await pool.query(
      `SELECT user_id FROM events WHERE id = $1`,
      [event_id]
    );

    const eventOrganizerId = eventRes.rows[0]?.user_id;
    const isOfficial = user_id === eventOrganizerId;

    // Step 3: Save the answer, flag it official if organizer
    const result = await pool.query(
      `INSERT INTO event_questions_answers (question_id, user_id, answer, is_official)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [question_id, user_id || null, answer, isOfficial]
    );

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error("Error posting answer:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
});


// // GET /event-questions-answers/:question_id
// // Get all answers for a question
// router.get("/:question_id", async (req, res) => {
//   try {
//     const { question_id } = req.params;

//     const result = await pool.query(
//       `SELECT * FROM event_questions_answers
//        WHERE question_id = $1
//        ORDER BY created_at ASC`,
//       [question_id]
//     );

//     res.status(200).json(result.rows);
//   } catch (err) {
//     console.error("Error fetching answers:", err.message);
//     res.status(500).json({ error: "Internal server error" });
//   }
// });

// // PATCH /event-questions-answers/:id
// // Update an answer (only owner can update)
// router.patch("/:id", authorization, async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { answer, is_official } = req.body;
//     const user_id = req.user?.id;

//     if (!answer) {
//       return res.status(400).json({ error: "Answer text is required" });
//     }

//     const existing = await pool.query(
//       `SELECT * FROM event_questions_answers WHERE id = $1`,
//       [id]
//     );

//     if (existing.rows.length === 0) {
//       return res.status(404).json({ error: "Answer not found" });
//     }

//     const ans = existing.rows[0];

//     // Only the answerer or an organizer can update
//     if (ans.user_id !== user_id && !req.user?.isOrganizer) {
//       return res.status(403).json({ error: "You can only edit your own answer" });
//     }

//     // Organizer can update is_official flag
//     const officialFlag = req.user?.isOrganizer && typeof is_official === "boolean" ? is_official : ans.is_official;

//     const updated = await pool.query(
//       `UPDATE event_questions_answers
//        SET answer = $1, is_official = $2, updated_at = CURRENT_TIMESTAMP
//        WHERE id = $3
//        RETURNING *`,
//       [answer, officialFlag, id]
//     );

//     res.status(200).json(updated.rows[0]);
//   } catch (err) {
//     console.error("Error updating answer:", err.message);
//     res.status(500).json({ error: "Internal server error" });
//   }
// });

// // DELETE /event-questions-answers/:id
// // Delete an answer (only owner can delete)
// router.delete("/:id", authorization, async (req, res) => {
//   try {
//     const { id } = req.params;
//     const user_id = req.user?.id;

//     const existing = await pool.query(
//       `SELECT * FROM event_questions_answers WHERE id = $1`,
//       [id]
//     );

//     if (existing.rows.length === 0) {
//       return res.status(404).json({ error: "Answer not found" });
//     }

//     const ans = existing.rows[0];

//     if (ans.user_id !== user_id && !req.user?.isOrganizer) {
//       return res.status(403).json({ error: "You can only delete your own answer" });
//     }

//     await pool.query(
//       `DELETE FROM event_questions_answers WHERE id = $1`,
//       [id]
//     );

//     res.status(200).json({ message: "Answer deleted successfully" });
//   } catch (err) {
//     console.error("Error deleting answer:", err.message);
//     res.status(500).json({ error: "Internal server error" });
//   }
// });

module.exports = router;
