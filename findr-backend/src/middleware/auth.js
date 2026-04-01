const jwt = require("jsonwebtoken");
const { redis } = require("../config/redis");
require("dotenv").config();

async function protect(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ error: "No token provided, access denied" });
    }

    const token = authHeader.split(" ")[1];

    // Check if token has been blacklisted (user logged out)
    const isBlacklisted = await redis.get(`blacklist:${token}`);
    if (isBlacklisted) {
      return res
        .status(401)
        .json({ error: "Token has been invalidated, please login again" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

module.exports = { protect };
