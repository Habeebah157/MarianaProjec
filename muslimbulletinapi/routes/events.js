const express = require("express");
const router = express.Router();
const authorization = require("../middleware/authorization");
const pool = require("../db.js");
const { createEvent } = require('ics');

router.get("/", authorization, async (req, res) => {
  try {
    const currentUserId = req.user.id;

    const result = await pool.query(
      `SELECT e.*, u.user_name
       FROM events e
       JOIN users u ON e.user_id = u.id
       ORDER BY e.start_time ASC`
    );

    const eventsWithFlags = result.rows.map(event => ({
      ...event,
      canModify: event.user_id === currentUserId,
    }));

    res.json({
      success: true,
      events: eventsWithFlags,
    });
  } catch (error) {
    console.error("Error fetching all events:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching events",
    });
  }
});



router.get("/user/:userId", authorization, async (req, res) => {
  try {
    const userId = req.params.userId;
    const currentUserId = req.user.id;

    if (!userId.match(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/)) {
      return res.status(400).json({ 
        success: false,
        error: "Invalid user ID format" 
      });
    }
    const result = await pool.query(
      `SELECT e.*, u.user_name 
       FROM events e
       JOIN users u ON e.user_id = u.id
       WHERE e.user_id = $1
       ORDER BY e.start_time ASC`,
      [userId]
    );

    const eventsWithFlags = result.rows.map((event) => ({
      ...event,
      canModify: event.user_id === currentUserId,
    }));

    res.json({
      success: true,
      events: eventsWithFlags,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching events",
    });
  }
});

router.post("/", authorization, async (req, res) => {
  const userId = req.user.id;
  const { title, description, location, start_time, end_time } = req.body;

  if (!title || !start_time) {
    return res.status(400).json({
      success: false,
      error: "Missing required fields: title and start_time",
    });
  }

  try {
    const result = await pool.query(
      `INSERT INTO events 
       (user_id, title, description, location, start_time, end_time)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [userId, title, description, location, start_time, end_time]
    );

    // 3. Success response
    res.status(201).json({
      success: true,
      event: result.rows[0],
    });
  } catch (err) {
    console.error("Error creating event:", err);

    if (err.code === "22007") {
      return res.status(400).json({
        success: false,
        error: "Invalid timestamp format",
      });
    }

    res.status(500).json({
      success: false,
      error: "Failed to create event",
    });
  }
});


router.get("/:id", authorization, async (req, res) => {
  try {
    const eventId = parseInt(req.params.id);
    const currentUserId = req.user.id;

    // 1. Validation
    if (isNaN(eventId)) {
      return res.status(400).json({
        success: false,
        error: "Invalid event ID",
      });
    }

    const result = await pool.query(
      `SELECT e.*, u.user_name
       FROM events e
       JOIN users u ON e.user_id = u.id
       WHERE e.id = $1`,
      [eventId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Event not found",
      });
    }

    const eventWithFlag = {
      ...result.rows[0],
      canModify: result.rows[0].user_id === currentUserId,
    };

    res.json({
      success: true,
      event: eventWithFlag,
    });
  } catch (error) {
    console.error("Error fetching event:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching event",
    });
  }
});

router.patch("/:id", authorization, async (req, res) => {
  try {
    const eventId = parseInt(req.params.id);
    const userId = req.user.id;

    // Validate event ID
    if (isNaN(eventId)) {
      return res.status(400).json({ success: false, error: "Invalid event ID" });
    }

    // Check if event exists and belongs to the user
    const existingEvent = await pool.query(
      "SELECT * FROM events WHERE id = $1",
      [eventId]
    );

    if (existingEvent.rows.length === 0) {
      return res.status(404).json({ success: false, error: "Event not found" });
    }

    const event = existingEvent.rows[0];

    if (event.user_id !== userId) {
      return res.status(403).json({ success: false, error: "Unauthorized" });
    }

    // Only update if values are provided; otherwise keep existing
    const {
      title = event.title,
      description = event.description,
      location = event.location,
      start_time = event.start_time,
      end_time = event.end_time,
    } = req.body;

    const updatedEvent = await pool.query(
      `UPDATE events
       SET title = $1,
           description = $2,
           location = $3,
           start_time = $4,
           end_time = $5
       WHERE id = $6
       RETURNING *`,
      [title, description, location, start_time, end_time, eventId]
    );

    res.json({
      success: true,
      message: "Event updated successfully",
      event: updatedEvent.rows[0],
    });
  } catch (error) {
    console.error("Error updating event:", error);
    res.status(500).json({ success: false, error: "Server error" });
  }
});



router.delete("/:id", authorization, async (req, res) => {
  try {
    const eventId = parseInt(req.params.id);
    const userId = req.user.id;

    // 1. Validation
    if (isNaN(eventId)) {
      return res.status(400).json({
        success: false,
        error: "Invalid event ID",
      });
    }

    const existingEvent = await pool.query(
      "SELECT user_id FROM events WHERE id = $1",
      [eventId]
    );

    if (existingEvent.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    if (existingEvent.rows[0].user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized - You can only delete your own events",
      });
    }

    await pool.query("DELETE FROM events WHERE id = $1", [eventId]);

    res.json({
      success: true,
      message: "Event deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting event:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete event",
      error: error.message,
    });
  }
});

router.get('/:id/ics', async (req, res) => {
  try{
    const {rows} = await pool.query(
      `SELECT title, description, location, start_time, end_time FROM events WHERE id = $1`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).send('EVent not found'); 
    const event = rows[0]; 
    const start = new Date(event.start_time);
    const end = new Date(event.end_time);

    const {error, value} = createEvent({
      title: event.title,
      description: event.description || '',
      location: event.location || '',
      start: [start.getUTCFullYear(), start.getUTCMonth() + 1, start.getUTCDate(), start.getUTCHours(), start.getUTCMinutes()],
      end: [end.getUTCFullYear(), end.getUTCMonth() + 1, end.getUTCDate(), end.getUTCHours(), end.getUTCMinutes()], 
      url: `https://muslimbulletin.com/events/${req.params.id}`,
      status: 'CONFIRMED'

    })
    if (error) throw error; 
    res.setHeader('Content-Type', 'text/calendar');
    res.setHeader('Content-Disposition', `attachment; filename=event-${req.params.id
}.ics`);
    res.send(value);
  }catch(err){
    console.log("Error generating ICS file:", err);
  }
})

module.exports = router;