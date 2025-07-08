const router = require("express").Router();
const pool = require("../db.js");
const {verifyToken} = require("../middleware/authorization.js");

// POST /business-users - Add user to business
router.post("/", verifyToken, async (req, res) => {
  const { business_id, user_id, role } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO business_users (business_id, user_id, role)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [business_id, user_id, role]
    );

    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error("Error adding user to business:", err);
    res.status(500).json({ success: false, message: "Failed to add user to business" });
  }
});

// GET /business-users/:business_id - Get all users for a business
router.get("/:business_id", async (req, res) => {
  const { business_id } = req.params;

  try {
    const result = await pool.query(
      `SELECT bu.*, u.user_name, u.user_email 
       FROM business_users bu
       JOIN users u ON bu.user_id = u.id
       WHERE bu.business_id = $1`,
      [business_id]
    );

    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error("Error fetching business users:", err);
    res.status(500).json({ success: false, message: "Failed to get business users" });
  }
});

// PUT /business-users/:id - Update user role
router.put("/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  try {
    const result = await pool.query(
      `UPDATE business_users 
       SET role = $1 
       WHERE id = $2
       RETURNING *`,
      [role, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Business user not found" });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error("Error updating business user:", err);
    res.status(500).json({ success: false, message: "Failed to update business user" });
  }
});

// DELETE /business-users/:id - Remove user from business
router.delete("/:id", verifyToken, async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `DELETE FROM business_users WHERE id = $1 RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Business user not found" });
    }

    res.json({ success: true, message: "User removed from business successfully" });
  } catch (err) {
    console.error("Error removing user from business:", err);
    res.status(500).json({ success: false, message: "Failed to remove user from business" });
  }
});

// GET /business-users/:business_id/check - Check if user is member
router.get("/:business_id/check", verifyToken, async (req, res) => {
  const { business_id } = req.params;
  const user_id = req.user.id;

  try {
    const result = await pool.query(
      `SELECT role FROM business_users 
       WHERE business_id = $1 AND user_id = $2`,
      [business_id, user_id]
    );

    if (result.rows.length === 0) {
      return res.json({ success: true, is_member: false });
    }

    res.json({ 
      success: true, 
      is_member: true,
      role: result.rows[0].role
    });
  } catch (err) {
    console.error("Error checking business membership:", err);
    res.status(500).json({ success: false, message: "Failed to check membership" });
  }
});

module.exports = router;