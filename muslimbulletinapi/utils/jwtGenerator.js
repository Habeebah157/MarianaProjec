const jwt = require("jsonwebtoken");
require("dotenv").config();

// Updated to accept FULL user object
function jwtGenerator(user) {
  const payload = {
    user: {
      id: user.id,
      user_email: user.user_email, // Must match DB column names
      user_name: user.user_name,
    },
  };
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "10h" });
}

module.exports = jwtGenerator;
