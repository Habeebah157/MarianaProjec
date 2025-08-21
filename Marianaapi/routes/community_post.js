const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/authorization");
const pool = require("../db");

const isCommunityOrganizer = async (communityId, userId) => {
  try {
    const res = await pool.query(
      `SELECT user_id FROM communities WHERE id = $1`,
      [communityId]
    );
    return res.rows.length > 0 && res.rows[0].user_id === userId;
  } catch (err) {
    console.error("Error checking organizer status:", err.message);
    return false;
  }
};


router.post("/", verifyToken, async (req, res) => {
  try {
    const { community_id, title, body } = req.body;
    const user_id = req.user?.id;

    if (!community_id || !title || !body) {
      return res.status(400).json({
        error: "community_id, title, and body are required",
      });
    }


    const communityRes = await pool.query(
      `SELECT id FROM communities WHERE id = $1`,
      [community_id]
    );

    if (communityRes.rows.length === 0) {
      return res.status(404).json({ error: "Community not found" });
    }

    const result = await pool.query(
      `INSERT INTO community_posts (community_id, user_id, title, body)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [community_id, user_id, title, body]
    );

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error("Error creating post:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
});


router.get("/:communityId", verifyToken, async (req, res) => {
  try {
    const { communityId } = req.params;

    const postsRes = await pool.query(
      `SELECT cp.id, cp.title, cp.body, cp.created_at, cp.updated_at,
              u.id AS user_id, u.user_name
       FROM community_posts cp
       LEFT JOIN users u ON cp.user_id = u.id
       WHERE cp.community_id = $1
       ORDER BY cp.created_at DESC`,
      [communityId]
    );

    res.json({ success: true, data: postsRes.rows });
  } catch (err) {
    console.error("Error fetching community posts:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
});


router.get("/post/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT cp.id, cp.title, cp.body, cp.created_at, cp.updated_at,
               u.id AS user_id, u.user_name
       FROM community_posts cp
       LEFT JOIN users u ON cp.user_id = u.id
       WHERE cp.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Post not found" });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error("Error fetching post:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, body } = req.body;
    const user_id = req.user?.id;

    if (!title && !body) {
      return res.status(400).json({ error: "At least one field (title or body) is required" });
    }

    const postRes = await pool.query(`SELECT * FROM community_posts WHERE id = $1`, [id]);

    if (postRes.rows.length === 0) {
      return res.status(404).json({ error: "Post not found" });
    }

    const post = postRes.rows[0];

    const isAuthor = post.user_id === user_id;
    const organizer = await isCommunityOrganizer(post.community_id, user_id);

    if (!isAuthor && !organizer) {
      return res.status(403).json({ error: "You can only edit your own posts" });
    }

    const result = await pool.query(
      `UPDATE community_posts
       SET title = COALESCE($1, title),
           body = COALESCE($2, body),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $3
       RETURNING *`,
      [title, body, id]
    );

    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error("Error updating post:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
});


router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user?.id;

    const postRes = await pool.query(`SELECT * FROM community_posts WHERE id = $1`, [id]);

    if (postRes.rows.length === 0) {
      return res.status(404).json({ error: "Post not found" });
    }

    const post = postRes.rows[0];
    const isAuthor = post.user_id === user_id;
    const organizer = await isCommunityOrganizer(post.community_id, user_id);

    if (!isAuthor && !organizer) {
      return res.status(403).json({ error: "You can only delete your own posts" });
    }

    await pool.query(`DELETE FROM community_posts WHERE id = $1`, [id]);

    res.json({ success: true, message: "Post deleted successfully" });
  } catch (err) {
    console.error("Error deleting post:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;