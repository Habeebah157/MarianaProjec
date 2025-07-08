const express = require("express");
const router = express.Router();
const {verifyToken} = require("../middleware/authorization");
const pool = require("../db.js");

// Import controller if you're using MVC pattern
// const questionController = require('../controllers/questionController');

// GET all questions
router.get("/", verifyToken, async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT 
        q.id, 
        q.user_id, 
        u.user_name,  
        q.title, 
        q.body, 
        q.created_at,
        COUNT(a.id) AS answer_count  -- Count answers per question
      FROM questions q
      JOIN users u ON q.user_id = u.id
      LEFT JOIN answers a ON q.id = a.question_id  -- Include questions with 0 answers
      GROUP BY q.id, u.user_name  -- Group by question and username
      ORDER BY q.created_at DESC
    `);

    if (rows.length === 0) {
      return res.status(200).json({
        message: "No questions found",
        questions: [],
      });
    }

    res.json({
      success: true,
      count: rows.length,
      questions: rows,
    });
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch questions",
    });
  }
});
router.get("/user/:userId/questions", verifyToken, async (req, res) => {
  try {
    const userId = req.params.userId;

    const { rows } = await pool.query(`
      SELECT 
        q.id, 
        q.user_id, 
        u.user_name,  
        q.title, 
        q.body, 
        q.created_at,
        COUNT(a.id) AS answer_count
      FROM questions q
      JOIN users u ON q.user_id = u.id
      LEFT JOIN answers a ON q.id = a.question_id
      WHERE q.user_id = $1
      GROUP BY q.id, u.user_name
      ORDER BY q.created_at DESC
    `, [userId]);

    if (rows.length === 0) {
      return res.status(200).json({
        message: "No questions found for this user",
        questions: [],
      });
    }

    res.json({
      success: true,
      count: rows.length,
      questions: rows,
    });
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch questions",
    });
  }
});


// POST a new question
router.post("/question", verifyToken, async (req, res) => {
  try {
    const { title, body } = req.body;
    const userId = req.user.id; // Get the user ID from the authenticated user
    console.log("User ID:", userId); // Better log message

    if (!title || !body) {
      return res.status(400).json({
        error: "Missing required fields (title, body)",
      });
    }

    const result = await pool.query(
      `INSERT INTO questions(title, body, user_id, created_at)
       VALUES ($1, $2, $3, NOW())
       RETURNING *`,
      [title, body, userId],
    );

    // Success response
    return res.status(201).json({
      success: true,
      question: result.rows[0],
    });
  } catch (error) {
    console.error("Error creating question:", error);

    if (error.code === "23505") {
      // Unique violation
      return res
        .status(409)
        .json({ error: "Question with this title already exists" });
    }

    return res.status(500).json({
      error: "Internal server error",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// PUT/PATCH update a question
// GET a specific question with edit permissions info
router.get("/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    // Validate ID format
    if (!/^\d+$/.test(id)) {
      return res.status(400).json({
        error: "Invalid question ID format",
        permissions: { canEdit: false },
      });
    }


    

    // Get the question from database
        const result = await pool.query(
      `SELECT 
        q.*, 
        u.user_name 
      FROM 
        questions q 
      JOIN 
        users u ON q.user_id = u.id 
      WHERE 
        q.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Question not found",
        permissions: { canEdit: false },
      });
    }

    const question = result.rows[0];
    const canEdit = question.user_id === userId;

    res.json({
      success: true,
      question: question,
      permissions: { canEdit },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Internal server error",
      permissions: { canEdit: false },
    });
  }
});

router.patch("/:id", verifyToken, async (req, res) => {
  const questionId = req.params.id;
  const userId = req.user.id;
  const { title, body } = req.body;

  try {
    const findQuestion = await pool.query(
      "SELECT * FROM questions WHERE id = $1",
      [questionId],
    );

    if (findQuestion.rows.length === 0) {
      return res.status(404).json({ error: "Question not found" });
    }

    const question = findQuestion.rows[0];
    if (question.user_id !== userId) {
      return res
        .status(403)
        .json({ error: "You can only edit your own questions" });
    }

    const updateQuestion = await pool.query(
      "UPDATE questions SET title = $1, body = $2 WHERE id = $3 RETURNING *",
      [title, body, questionId],
    );

    res.json({
      success: true,
      message: "Question updated successfully",
      question: updateQuestion.rows[0],
    });
  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// DELETE a question
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const questionId = req.params.id;

    // First, find the question
    const findQuestion = await pool.query(
      "SELECT * FROM questions WHERE id = $1",
      [questionId],
    );

    if (findQuestion.rows.length === 0) {
      return res.status(404).json({
        error: "Question not found",
        canDelete: false,
      });
    }

    const question = findQuestion.rows[0];
    const canDelete = question.user_id === userId;

    if (!canDelete) {
      return res.status(403).json({
        error: "Unauthorized - You can only delete your own questions",
        canDelete: false,
      });
    }

    await pool.query("DELETE FROM questions WHERE id = $1", [questionId]);

    res.json({
      success: true,
      message: "Question deleted successfully",
      canDelete: true,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "Server error",
      canDelete: false,
    });
  }
});

module.exports = router;
