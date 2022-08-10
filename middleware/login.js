const jwt = require("jsonwebtoken");
const login = (req, res, next) => {
  try {
    const token = req.header("x-auth-token");
    if(!token){
        next()
        return
    }
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    if (verified){
      return res
        .status(200)
        .json({ auth:true, message: "Hey buddy, You are already logged in", redirection: "/dashboard" });
    }
    else {
        next()
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
module.exports = login;
