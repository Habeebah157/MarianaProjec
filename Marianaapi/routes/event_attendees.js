const router = require("express").Router();
const pool = require("../db.js");
const {verifyToken} = require("../middleware/authorization.js");

router.post("/", verifyToken, async (req, res) => {
  const { event_id, is_going } = req.body;
  const user_id = req.user.id;
  console.log(user_id)

  try {
    const insertResult = await pool.query(
      `INSERT INTO event_attendees (event_id, user_id, is_going, has_answered, rsvp_at)
       VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
       RETURNING id`,
      [event_id, user_id, is_going, true] // 👈 set has_answered to true
    );

    const rsvpId = insertResult.rows[0].id;

    const result = await pool.query(
      `SELECT ea.*, u.user_name
       FROM event_attendees ea
       JOIN users u ON ea.user_id = u.id
       WHERE ea.id = $1`,
      [rsvpId]
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
  `SELECT ea.*, u.user_name
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


router.get("/event-attendees/:eventId/user/has-answered", verifyToken, async (req, res) => {
  const { eventId} = req.params;
  const userId = req.user.id;
  console.log(userId)

  try {
    const result = await pool.query(
      `SELECT has_answered 
       FROM event_attendees
       WHERE event_id = $1 AND user_id = $2`,
      [eventId, userId]
    );

    if (result.rows.length === 0) {
      // No RSVP found for this user on this event
      return res.json({ success: true, has_answered: false });
    }

    res.json({ success: true, has_answered: result.rows[0].has_answered });
  } catch (err) {
    console.error("Error checking if user has answered:", err);
    res.status(500).json({ success: false, message: "Failed to check answer status" });
  }
});





module.exports = router;