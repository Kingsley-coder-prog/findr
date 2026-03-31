const { pool } = require("../../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

async function registerUser({ name, email, password }) {
  // Check if email already exists
  const existing = await pool.query("SELECT id FROM users WHERE email = $1", [
    email.toLowerCase().trim(),
  ]);
  if (existing.rows.length > 0) {
    const error = new Error("An account with this email already exists");
    error.statusCode = 409;
    throw error;
  }

  // Hash password — never store plain text
  const salt = await bcrypt.genSalt(12);
  const password_hash = await bcrypt.hash(password, salt);

  // Insert user
  const result = await pool.query(
    `INSERT INTO users (name, email, password_hash)
     VALUES ($1, $2, $3)
     RETURNING id, name, email, plan, created_at`,
    [name.trim(), email.toLowerCase().trim(), password_hash],
  );

  const user = result.rows[0];
  const token = generateToken(user.id);

  return { user, token };
}

async function loginUser({ email, password }) {
  // Find user by email
  const result = await pool.query(
    "SELECT id, name, email, password_hash, plan FROM users WHERE email = $1",
    [email.toLowerCase().trim()],
  );

  if (result.rows.length === 0) {
    const error = new Error("Invalid email or password");
    error.statusCode = 401;
    throw error;
  }

  const user = result.rows[0];

  // Compare password against stored hash
  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) {
    const error = new Error("Invalid email or password");
    error.statusCode = 401;
    throw error;
  }

  const token = generateToken(user.id);

  // Return user without password_hash
  const { password_hash, ...safeUser } = user;
  return { user: safeUser, token };
}

async function getUserById(id) {
  const result = await pool.query(
    "SELECT id, name, email, plan, created_at FROM users WHERE id = $1",
    [id],
  );

  if (result.rows.length === 0) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  return result.rows[0];
}

function generateToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
}

module.exports = { registerUser, loginUser, getUserById };
