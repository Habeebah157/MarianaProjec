const router = require("express").Router();
const pool = require("../db.js");
const authorization = require("../middleware/authorization.js");

// Get authenticated user's data
router.get("/", authorization, async (req, res) => {
  try {
    return res.json(req.user);
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({
      error: "Server Error",
      details: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
});

module.exports = router;
