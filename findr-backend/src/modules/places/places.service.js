const { pool } = require("../../config/db");
const axios = require("axios");

async function getPlaceById(placeId) {
  const result = await pool.query(
    `SELECT
      id, name, category, address, phone, website,
      rating, total_ratings, opening_hours, photos,
      google_place_id, cached_at
     FROM places
     WHERE id = $1`,
    [placeId],
  );

  if (result.rows.length === 0) {
    const error = new Error("Place not found");
    error.statusCode = 404;
    throw error;
  }

  return result.rows[0];
}

async function savePlace(userId, placeId, note = null) {
  await getPlaceById(placeId);

  const user = await pool.query("SELECT plan FROM users WHERE id = $1", [
    userId,
  ]);

  if (user.rows[0].plan === "free") {
    const count = await pool.query(
      "SELECT COUNT(*) FROM saved_places WHERE user_id = $1",
      [userId],
    );
    if (parseInt(count.rows[0].count) >= 5) {
      const error = new Error(
        "Free plan limit reached. Upgrade to premium for unlimited saves.",
      );
      error.statusCode = 403;
      throw error;
    }
  }

  const result = await pool.query(
    `INSERT INTO saved_places (user_id, place_id, note)
     VALUES ($1, $2, $3)
     ON CONFLICT ON CONSTRAINT unique_user_place
     DO UPDATE SET note = EXCLUDED.note
     RETURNING id, place_id, note, saved_at`,
    [userId, placeId, note],
  );

  return result.rows[0];
}

async function getSavedPlaces(userId) {
  const result = await pool.query(
    `SELECT
      sp.id AS saved_id,
      sp.note,
      sp.saved_at,
      p.id, p.name, p.category, p.address,
      p.phone, p.website, p.rating, p.total_ratings,
      p.opening_hours, p.photos
     FROM saved_places sp
     JOIN places p ON sp.place_id = p.id
     WHERE sp.user_id = $1
     ORDER BY sp.saved_at DESC`,
    [userId],
  );

  return result.rows;
}

async function removeSavedPlace(userId, placeId) {
  const result = await pool.query(
    `DELETE FROM saved_places
     WHERE user_id = $1 AND place_id = $2
     RETURNING id`,
    [userId, placeId],
  );

  if (result.rows.length === 0) {
    const error = new Error("Saved place not found");
    error.statusCode = 404;
    throw error;
  }
}

async function getDirections(originLat, originLng, destPlaceId) {
  // Look up destination coordinates from DB
  const result = await pool.query(
    `SELECT
      name, address,
      ST_X(location::geometry) AS longitude,
      ST_Y(location::geometry) AS latitude
     FROM places
     WHERE id::text = $1 OR google_place_id = $1`,
    [destPlaceId],
  );

  if (result.rows.length === 0) {
    const error = new Error("Destination place not found");
    error.statusCode = 404;
    throw error;
  }

  const destination = result.rows[0];

  try {
    // Real Google Directions API
    const response = await axios.get(
      "https://maps.googleapis.com/maps/api/directions/json",
      {
        params: {
          origin: `${originLat},${originLng}`,
          destination: `${destination.latitude},${destination.longitude}`,
          mode: "driving",
          key: process.env.GOOGLE_MAPS_API_KEY,
        },
      },
    );

    if (
      response.data.status !== "OK" ||
      !response.data.routes ||
      response.data.routes.length === 0
    ) {
      throw new Error(`Directions API returned: ${response.data.status}`);
    }

    const route = response.data.routes[0];
    const leg = route.legs[0];

    // Extract and clean step instructions (Google returns HTML tags)
    const steps = leg.steps.map((step) => ({
      instruction: step.html_instructions.replace(/<[^>]*>/g, ""),
      distance: step.distance.text,
      duration: step.duration.text,
    }));

    return {
      destination: {
        name: destination.name,
        address: destination.address,
        latitude: destination.latitude,
        longitude: destination.longitude,
      },
      origin: { latitude: originLat, longitude: originLng },
      distance: {
        metres: leg.distance.value,
        text: leg.distance.text,
      },
      duration: {
        minutes: Math.round(leg.duration.value / 60),
        text: leg.duration.text,
      },
      steps,
      polyline: route.overview_polyline?.points || null,
      source: "google",
    };
  } catch (err) {
    // Fallback to straight-line calculation if API fails
    console.error("Google Directions API error, using fallback:", err.message);

    const distanceMetres = Math.round(
      Math.sqrt(
        Math.pow((destination.latitude - originLat) * 111000, 2) +
          Math.pow((destination.longitude - originLng) * 111000, 2),
      ),
    );
    const distanceKm = (distanceMetres / 1000).toFixed(1);
    const durationMinutes = Math.round(distanceMetres / 250); // ~250m/min driving

    return {
      destination: {
        name: destination.name,
        address: destination.address,
        latitude: destination.latitude,
        longitude: destination.longitude,
      },
      origin: { latitude: originLat, longitude: originLng },
      distance: {
        metres: distanceMetres,
        text: `${distanceKm} km`,
      },
      duration: {
        minutes: durationMinutes,
        text: `${durationMinutes} mins`,
      },
      steps: [
        {
          instruction: `Head towards ${destination.name}`,
          distance: `${distanceKm} km`,
          duration: `${durationMinutes} mins`,
        },
      ],
      polyline: null,
      source: "fallback",
    };
  }
}

module.exports = {
  getPlaceById,
  savePlace,
  getSavedPlaces,
  removeSavedPlace,
  getDirections,
};
