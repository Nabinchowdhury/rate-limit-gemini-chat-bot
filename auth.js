// auth.js
const jwt = require("jsonwebtoken");
const SECRET = "supersecret";

function generateToken(user) {
  return jwt.sign(user, SECRET, { expiresIn: "1h" });
}

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    req.user = null; // Guest
    return next();
  }
  try {
    const token = authHeader.split(" ")[1];
    req.user = jwt.verify(token, SECRET);
  } catch {
    req.user = null;
  }
  next();
}

export {generateToken, authMiddleware}