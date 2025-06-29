const express = require("express");
const router = express.Router();
const authorization = require("../middleware/authorization");
const pool = require("../db.js");
// GET all comments for a specific question
router.get("/question/:questionId", authorization, async (req, res) => {
  try {
    const questionId = parseInt(req.params.questionId);
    const currentUserId = req.user.id; // Assuming your authorization middleware sets req.user

    // 1. Validation
    if (isNaN(questionId)) {
      return res.status(400).json({ error: "Invalid question ID" });
    }

    // 2. Database query
    const result = await pool.query(
      `SELECT a.*, u.user_name 
       FROM answers a
       JOIN users u ON a.user_id = u.id
       WHERE a.question_id = $1`,
      [questionId],
    );

    // 3. Add canDelete flag to each answer
    const answersWithDeleteFlag = result.rows.map((answer) => ({
      ...answer,
      canDelete: answer.user_id === currentUserId,
    }));

    // 4. Single success response
    res.json({
      success: true,
      answers: answersWithDeleteFlag,
    });
  } catch (error) {
    // 5. Single error response
    console.error("Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});
// POST a new comment to a specific question
// router.post('/', authorization, async (req, res) => {
//   const userId = req.user.id;
//   const { body, question_id } = req.body;

//   try {
//     const result = await pool.query(
//       `INSERT INTO answers (user_id, question_id, body)
//        VALUES ($1, $2, $3)
//        RETURNING *;`,
//       [userId, question_id, body]
//     );

//     res.status(201).json(result.rows[0]);
//   } catch (err) {
//     console.error('Error creating comment:', err);
//     res.status(500).json({ error: 'Failed to create comment' });
//   }
// });

router.post("/", authorization, async (req, res) => {
  const userId = req.user.id;
  const { body, question_id } = req.body;

  if (!body || !question_id) {
    return res
      .status(400)
      .json({ error: "Missing required fields: body and question_id" });
  }

  try {
    // Check if question exists
    const questionCheck = await pool.query(
      "SELECT id FROM questions WHERE id = $1",
      [question_id],
    );

    if (questionCheck.rowCount === 0) {
      return res.status(404).json({ error: "Question not found" });
    }

    // Insert the answer
    const result = await pool.query(
      `INSERT INTO answers (user_id, question_id, body)
       VALUES ($1, $2, $3)
       RETURNING *;`,
      [userId, question_id, body],
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error creating answer:", err);

    // Handle specific DB errors if you want, e.g., foreign key violation
    if (err.code === "23503") {
      // foreign key violation
      return res.status(400).json({ error: "Invalid question_id" });
    }

    res.status(500).json({ error: "Failed to create answer" });
  }
});

// GET a specific comment by ID
router.get("/:id", authorization, async (req, res) => {
  // Get a single comment by comment ID
});

// PATCH/UPDATE a specific comment
// PATCH/UPDATE a specific comment
router.patch("/:id", authorization, async (req, res) => {
  try {
    const { id } = req.params;
    const { body } = req.body;
    const userId = req.user.id;

    // 1. Validate input
    if (!body || typeof body !== "string" || body.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: "Comment body is required and cannot be empty",
      });
    }

    // 2. Check if comment exists and belongs to user
    const existingComment = await pool.query(
      "SELECT user_id FROM comments WHERE id = $1",
      [id],
    );

    if (existingComment.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Comment not found",
      });
    }

    if (existingComment.rows[0].user_id !== userId) {
      return res.status(403).json({
        success: false,
        error: "Unauthorized - You can only update your own comments",
      });
    }

    // 3. Update the comment
    const updatedComment = await pool.query(
      `UPDATE comments 
       SET body = $1, updated_at = NOW() 
       WHERE id = $2
       RETURNING *`,
      [body.trim(), id],
    );

    res.json({
      success: true,
      comment: updatedComment.rows[0],
    });
  } catch (error) {
    console.error("Error updating comment:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update comment",
    });
  }
});
// DELETE a specific comment
router.delete("/:id", authorization, async (req, res) => {
  try {
    const { id } = req.params; // The answer ID to delete
    const userId = req.user.id; // From your authorization middleware

    // 1. Check if answer exists and belongs to user
    const existingAnswer = await pool.query(
      `SELECT user_id FROM answers WHERE id = $1`,
      [id],
    );

    if (existingAnswer.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Answer not found",
      });
    }

    if (existingAnswer.rows[0].user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized - You can only delete your own answers",
      });
    }

    // 2. Delete the answer
    await pool.query(`DELETE FROM answers WHERE id = $1`, [id]);

    // 3. Return success response
    res.json({
      success: true,
      message: "Answer deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting answer:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete answer",
      error: error.message,
    });
  }
});

module.exports = router;
