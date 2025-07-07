// routes/aiRoutes.js
const express = require('express');
const router = express.Router();
const aiService = require('../services/aiServices');
const pool = require('../db.js');

router.post('/ask', async (req, res) => {
  try {
    const { question } = req.body;
    const response = await aiService.queryDatabaseWithAI(question);
    res.json({ response });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


router.get('/api/search', async (req, res) => {
  const { query, threshold } = req.query;
  try {
    const result = await pool.query(
      `SELECT * FROM search_similar_questions($1, $2)`,
      [query, threshold || 0.1]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

module.exports = router;