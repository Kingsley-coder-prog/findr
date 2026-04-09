const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : false,
});

async function testDbConnection() {
  try {
    const client = await pool.connect();
    const result = await client.query("SELECT NOW()");
    client.release();
    console.log("PostgreSQL connected:", result.rows[0].now);
  } catch (error) {
    console.error("PostgreSQL connection failed:", error.message);
    throw error;
  }
}

module.exports = { pool, testDbConnection };
