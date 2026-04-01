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

module.exports = { search };
