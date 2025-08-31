// auth.js
// const jwt = require("jsonwebtoken");
import jwt from "jsonwebtoken"
import { userLimits } from "./redis.js";
const SECRET = "supersecret";

function generateToken(user) {
  return jwt.sign(user, SECRET, { expiresIn: "1h" });
}

function authMiddleware(req, res, next) {
//   console.log(req.headers, 'req.headers')
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    req.user = {
        id : req.ip,
        role: "guest"
    };
    return next();
  }
  try {
    const token = authHeader.split(" ")[1];
    const user = jwt.verify(token, SECRET);
    if(!userLimits[user.role]){
      req.user = null;
      return res.status(404).send("User not found");
    }
    req.user = user;
  } catch {
    req.user = null;
  }
  next();
}

export {generateToken, authMiddleware}