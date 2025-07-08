const router = require("express").Router();
const pool = require("../db.js");
const bcrypt = require("bcrypt");
const jwtGenerator = require("../utils/jwtGenerator.js");
const validInfo = require("../middleware/validinfo.js");
// const authorization = require("../middleware/authorization.js");

router.post("/register", validInfo, async (req, res) => {
  try {
    const { user_name, user_email, mobile_number, password } = req.body;
    console.log(req.body)
    console.log("Registering user:", user_name, user_email, mobile_number);
    // Check if user exists
    const user = await pool.query("SELECT * FROM users WHERE user_email = $1", [
      user_email,
    ]);
    console.log("User query result:", user.rows.length);
    if (user.rows.length > 0) {
      return res.status(400).json({ error: "User already exists" });
    }

    // Hash password
    const saltRound = 10;
    const salt = await bcrypt.genSalt(saltRound);
    const bcryptPassword = await bcrypt.hash(password, salt);
    console.log("Hashed password:", bcryptPassword);

    // Insert new user
    const newUser = await pool.query(
      "INSERT INTO users (user_name, user_email, mobile_number, password) VALUES ($1, $2, $3, $4) RETURNING *",
      [user_name, user_email, mobile_number, bcryptPassword],
    );
    console.log("New user created:", newUser.rows[0]);

    const token = jwtGenerator(newUser.rows[0]);
    res.json({ token });
  } catch (err) {
    console.error(err);
    console.log("HELLO YAP");
    return res.status(500).json({ error: "Server Error" }); // Use return here too
  }
});

router.post("/login", validInfo, async (req, res) => {
  const { user_email, password } = req.body;

  try {
    const user = await pool.query("SELECT * FROM users WHERE user_email = $1", [
      user_email,
    ]);

    if (user.rows.length === 0) {
      return res.status(401).json("Invalid Credential");
    }

    const validPassword = await bcrypt.compare(password, user.rows[0].password);

    if (!validPassword) {
      return res.status(401).json("Invalid Credential");
    }
    const jwtToken = jwtGenerator(user.rows[0]);
    return res.json({ jwtToken });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});
// router.get("/verify", authorization, (req, res) => {
//   try {
//     res.json(true);
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).json({ error: "Server Error" });
//   }
// });
module.exports = router;
