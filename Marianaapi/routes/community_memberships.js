const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/authorization");
const pool = require("../db.js");

// GET all members of a specific community
router.get("/community/:communityId", verifyToken, async (req, res) => {
  try {
    const communityId = req.params.communityId;

    const result = await pool.query(
      `SELECT cm.*, u.user_name
       FROM community_memberships cm
       JOIN users u ON cm.user_id = u.id
       WHERE cm.community_id = $1`,
      [communityId]
    );

    res.json({ success: true, members: result.rows });
  } catch (error) {
    console.error("Error fetching community members:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// GET a specific membership by ID
router.get("/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT cm.*, u.user_name
       FROM community_memberships cm
       JOIN users u ON cm.user_id = u.id
       WHERE cm.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Membership not found" });
    }

    res.json({ success: true, membership: result.rows[0] });
  } catch (error) {
    console.error("Error fetching membership:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// POST a new membership (join a community)
router.post("/", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { community_id, role } = req.body;

    if (!community_id) {
      return res.status(400).json({ error: "community_id is required" });
    }

    const result = await pool.query(
      `INSERT INTO community_memberships (community_id, user_id, role)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [community_id, userId, role || "member"]
    );

    res.status(201).json({ success: true, membership: result.rows[0] });
  } catch (err) {
    console.error("Error creating membership:", err);
    if (err.code === "23505") {
      return res.status(400).json({ error: "Already a member of this community" });
    }
    res.status(500).json({ error: "Failed to create membership" });
  }
});

// PATCH to update a membership (e.g., role)
router.patch("/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!role) {
      return res.status(400).json({ error: "role is required" });
    }

    const result = await pool.query(
      `UPDATE community_memberships
       SET role = $1
       WHERE id = $2
       RETURNING *`,
      [role, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Membership not found" });
    }

    res.json({ success: true, membership: result.rows[0] });
  } catch (error) {
    console.error("Error updating membership:", error);
    res.status(500).json({ error: "Failed to update membership" });
  }
});

// DELETE a membership (leave a community)
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const existing = await pool.query(
      `SELECT * FROM community_memberships WHERE id = $1 AND user_id = $2`,
      [id, userId]
    );

    if (existing.rows.length === 0) {
      return res.status(403).json({ error: "Unauthorized or membership not found" });
    }

    await pool.query(`DELETE FROM community_memberships WHERE id = $1`, [id]);

    res.json({ success: true, message: "Membership removed" });
  } catch (error) {
    console.error("Error deleting membership:", error);
    res.status(500).json({ error: "Failed to remove membership" });
  }
});

module.exports = router;
