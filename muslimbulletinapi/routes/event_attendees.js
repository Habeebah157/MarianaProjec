const router = require("express").Router();
const pool = require("../db.js");
const authorization = require("../middleware/authorization.js");


// POST /event-attendees
router.post("/event-attendees", async (req, res) => {
  const { event_id, is_going } = req.body;
  const user_id = req.user.id; // Assuming user is authenticated and available in req.user

  try {
    const result = await pool.query(
      `INSERT INTO event_attendees (event_id, user_id, is_going, rsvp_at)
       VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
       RETURNING *`,
      [event_id, user_id, is_going]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error("Error adding RSVP:", err);
    res.status(500).json({ success: false, message: "Failed to RSVP" });
  }
});

// GET /event-attendees/:eventId
router.get("/event-attendees/:eventId", async (req, res) => {
  const { eventId } = req.params;

  try {
    const result = await pool.query(
      `SELECT ea.*, u.name AS user_name
       FROM event_attendees ea
       JOIN users u ON ea.user_id = u.id
       WHERE ea.event_id = $1`,
      [eventId]
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error("Error fetching attendees:", err);
    res.status(500).json({ success: false, message: "Failed to get attendees" });
  }
});


