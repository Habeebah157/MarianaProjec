module.exports = function (req, res, next) {
  const { user_email, user_name, password } = req.body;

  function validEmail(userEmail) {
    return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(userEmail);
  }

  if (req.path === "/register") {
    if (![user_email, user_name, password].every(Boolean)) {
      return res.status(401).json("Missing Credentials");
    } else if (!validEmail(user_email)) {
      return res.status.json("Invalid Email");
    }
  } else if (req.path === "/login") {
    if (![user_email, password].every(Boolean)) {
      return res.status(401).json("Missing Credentials");
    } else if (!validEmail(user_email)) {
      return res.status(401).json("Invalid Email");
    }
  }

  next();
};
