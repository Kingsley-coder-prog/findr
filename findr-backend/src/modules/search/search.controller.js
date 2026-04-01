const { pool } = require("../../config/db");
const { searchNearby } = require("./search.service");

async function search(req, res, next) {
  try {
    const { query, latitude, longitude, radius } = req.query;

    if (!query || !latitude || !longitude) {
      return res.status(400).json({
        error: "query, latitude and longitude are required",
      });
    }

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    const rad = radius ? parseInt(radius) : 5;

    if (isNaN(lat) || isNaN(lng)) {
      return res
        .status(400)
        .json({ error: "latitude and longitude must be valid numbers" });
    }

    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return res.status(400).json({ error: "Invalid coordinates" });
    }

    const result = await searchNearby({
      rawQuery: query,
      latitude: lat,
      longitude: lng,
      radius: rad,
      userId: req.userId || null,
      source: "manual",
    });

    res.status(200).json({
      query,
      normalizedQuery: query,
      total: result.places.length,
      source: result.source,
      places: result.places,
    });
  } catch (error) {
    next(error);
  }
}

async function getSearchHistory(req, res, next) {
  try {
    const limit = parseInt(req.query.limit) || 10;

    const result = await pool.query(
      `SELECT
        id, query, raw_query, radius_km,
        results_count, source, searched_at,
        ST_X(search_location::geometry) AS longitude,
        ST_Y(search_location::geometry) AS latitude
       FROM search_history
       WHERE user_id = $1
       ORDER BY searched_at DESC
       LIMIT $2`,
      [req.userId, limit],
    );

    res.status(200).json({
      total: result.rows.length,
      history: result.rows,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { search, getSearchHistory };
