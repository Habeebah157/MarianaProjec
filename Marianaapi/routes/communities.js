const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/authorization");
const pool = require("../db.js");
router.post("/", verifyToken, async (req, res) => {
  const userId = req.user.id;
  const { name, description, is_public = true } = req.body;

  if (!name) {
    return res.status(400).json({ error: "Community name is required" });
  }

  try {
    const result = await pool.query(
      `INSERT INTO communities (name, description, creator_id, is_public)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [name.trim(), description || null, userId, is_public]
    );

    res.status(201).json({ success: true, community: result.rows[0] });
  } catch (error) {
    console.error("Error creating community:", error);

    if (error.code === "23505") {
      // Unique constraint violation
      return res.status(400).json({ error: "Community name already exists" });
    }

    res.status(500).json({ error: "Failed to create community" });
  }
});

router.get("/", verifyToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM communities ORDER BY created_at DESC`
    );

    res.json({ success: true, communities: result.rows });
  } catch (error) {
    console.error("Error fetching communities:", error);
    res.status(500).json({ error: "Failed to fetch communities" });
  }
});

router.get("/:id", verifyToken, async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(`SELECT * FROM communities WHERE id = $1`, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Community not found" });
    }

    res.json({ success: true, community: result.rows[0] });
  } catch (error) {
    console.error("Error fetching community:", error);
    res.status(500).json({ error: "Failed to fetch community" });
  }
});

router.patch("/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const { name, description, is_public } = req.body;

  try {
    // Check if community exists and belongs to user (optional)
    const check = await pool.query(`SELECT * FROM communities WHERE id = $1`, [id]);

    if (check.rowCount === 0) {
      return res.status(404).json({ error: "Community not found" });
    }

    const update = await pool.query(
      `UPDATE communities
       SET name = COALESCE($1, name),
           description = COALESCE($2, description),
           is_public = COALESCE($3, is_public),
           updated_at = NOW()
       WHERE id = $4
       RETURNING *`,
      [name, description, is_public, id]
    );

    res.json({ success: true, community: update.rows[0] });
  } catch (error) {
    console.error("Error updating community:", error);
    res.status(500).json({ error: "Failed to update community" });
  }
});
router.delete("/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const check = await pool.query(`SELECT * FROM communities WHERE id = $1`, [id]);

    if (check.rowCount === 0) {
      return res.status(404).json({ error: "Community not found" });
    }

    // Optional: Check if current user is creator
    // if (check.rows[0].creator_id !== userId) {
    //   return res.status(403).json({ error: "Not authorized to delete this community" });
    // }

    await pool.query(`DELETE FROM communities WHERE id = $1`, [id]);

    res.json({ success: true, message: "Community deleted successfully" });
  } catch (error) {
    console.error("Error deleting community:", error);
    res.status(500).json({ error: "Failed to delete community" });
  }
});
module.exports = router;
