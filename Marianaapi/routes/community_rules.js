const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/authorization");
const pool = require("../db");

const isCommunityModerator = async (community_id, user_id) => {
  const res = await pool.query(
    `SELECT 1 FROM communities WHERE id = $1 AND user_id = $2`,
    [community_id, user_id]
  );
  return res.rows.length > 0;
};

router.post("/", verifyToken, async (req, res) => {
  try {
    const { community_id, title, description } = req.body;
    const user_id = req.user?.id;

    if (!community_id || !title) {
      return res.status(400).json({
        success: false,
        error: "community_id and title are required",
      });
    }

    if (title.length > 255) {
      return res.status(400).json({
        success: false,
        error: "Title cannot exceed 255 characters",
      });
    }

    const isMod = await isCommunityModerator(community_id, user_id);
    if (!isMod) {
      return res.status(403).json({
        success: false,
        error: "You are not authorized to add rules to this community",
      });
    }

    const result = await pool.query(
      `INSERT INTO community_rules (community_id, title, description)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [community_id, title, description || null]
    );

    res.status(201).json({
      success: true,
      data: result.rows[0],
    });
  } catch (err) {
    console.error("Error creating community rule:", err.message);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
});


router.get("/:communityId", verifyToken, async (req, res) => {
  try {
    const { communityId } = req.params;

    const result = await pool.query(
      `SELECT id, community_id, title, description, created_at
       FROM community_rules
       WHERE community_id = $1
       ORDER BY created_at ASC`,
      [communityId]
    );

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (err) {
    console.error("Error fetching community rules:", err.message);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
});


router.get("/single/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT id, community_id, title, description, created_at
       FROM community_rules
       WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Rule not found",
      });
    }

    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (err) {
    console.error("Error fetching rule:", err.message);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
});


router.patch("/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description } = req.body;
    const user_id = req.user?.id;

    if (title && title.length > 255) {
      return res.status(400).json({
        success: false,
        error: "Title cannot exceed 255 characters",
      });
    }

    const ruleRes = await pool.query(
      `SELECT r.id, r.community_id, c.user_id AS owner_id
       FROM community_rules r
       JOIN communities c ON r.community_id = c.id
       WHERE r.id = $1`,
      [id]
    );

    if (ruleRes.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Rule not found",
      });
    }

    const rule = ruleRes.rows[0];
    if (rule.owner_id !== user_id) {
      return res.status(403).json({
        success: false,
        error: "You are not authorized to edit this rule",
      });
    }

    const result = await pool.query(
      `UPDATE community_rules
       SET title = $1, description = $2, created_at = CURRENT_TIMESTAMP
       WHERE id = $3
       RETURNING *`,
      [title || null, description || null, id]
    );

    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (err) {
    console.error("Error updating rule:", err.message);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
});


router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user?.id;

    const ruleRes = await pool.query(
      `SELECT r.community_id, c.user_id AS owner_id
       FROM community_rules r
       JOIN communities c ON r.community_id = c.id
       WHERE r.id = $1`,
      [id]
    );

    if (ruleRes.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Rule not found",
      });
    }

    const { owner_id } = ruleRes.rows[0];
    if (owner_id !== user_id) {
      return res.status(403).json({
        success: false,
        error: "You are not authorized to delete this rule",
      });
    }

    await pool.query(`DELETE FROM community_rules WHERE id = $1`, [id]);

    res.json({
      success: true,
      message: "Rule deleted successfully",
    });
  } catch (err) {
    console.error("Error deleting rule:", err.message);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
});

module.exports = router;