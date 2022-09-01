const jwt = require("jsonwebtoken");
const auth = (req, res, next) => {
  try {
    const token = req.header("x-auth-token");
    if (!token) {
      return res
        .status(200)
        .json({
          auth: false,
          message:
            "Hey buddy sorry, no authorization token detected. Please sign-in",
          redirection: "/signin",
        });
    }
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    if (!verified) {
      return res
        .status(200)
        .json({
          auth: false,
          message:
            "Hey dude authorization token verification failed. Please sign-in",
          redirection: "/signin",
        });
    }
    // req.user = verified.id;
    next();

  } catch (err) {
    res.status(500).json({ auth: false, message: err.message, redirection: "/signin" });
  }
};
module.exports = auth;
