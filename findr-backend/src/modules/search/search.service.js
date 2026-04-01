const { pool } = require("../../config/db");
const { redis } = require("../../config/redis");
require("dotenv").config();

const CACHE_TTL = parseInt(process.env.CACHE_TTL_SECONDS) || 600;

// ─────────────────────────────────────────
// MOCK PLACES — swap this function out when
// Google Places API key is ready
// ─────────────────────────────────────────
async function fetchFromGooglePlaces(query, latitude, longitude, radius) {
  // Simulates what Google Places API would return
  const mockPlaces = [
    {
      google_place_id: "mock_001",
      name: `${query} Place One`,
      category: query,
      address: "12 Lagos Island, Lagos",
      phone: "+2348012345678",
      website: null,
      latitude: latitude + 0.005,
      longitude: longitude + 0.005,
      rating: 4.2,
      total_ratings: 120,
      opening_hours: {
        open_now: true,
        periods: [],
      },
      photos: [],
    },
    {
      google_place_id: "mock_002",
      name: `${query} Place Two`,
      category: query,
      address: "45 Victoria Island, Lagos",
      phone: "+2348087654321",
      website: "https://example.com",
      latitude: latitude + 0.01,
      longitude: longitude + 0.008,
      rating: 3.8,
      total_ratings: 85,
      opening_hours: {
        open_now: false,
        periods: [],
      },
      photos: [],
    },
    {
      google_place_id: "mock_003",
      name: `${query} Place Three`,
      category: query,
      address: "7 Lekki Phase 1, Lagos",
      phone: null,
      website: null,
      latitude: latitude - 0.003,
      longitude: longitude + 0.012,
      rating: 4.7,
      total_ratings: 340,
      opening_hours: {
        open_now: true,
        periods: [],
      },
      photos: [],
    },
  ];

  return mockPlaces;
}

// ─────────────────────────────────────────
// Normalize query using category_synonyms
// ─────────────────────────────────────────
async function normalizeQuery(rawQuery) {
  const cleaned = rawQuery.toLowerCase().trim();

  const result = await pool.query(
    "SELECT normalized FROM category_synonyms WHERE raw = $1",
    [cleaned],
  );

  return result.rows.length > 0 ? result.rows[0].normalized : cleaned;
}

// ─────────────────────────────────────────
// Save places from Google into PostGIS
// ─────────────────────────────────────────
async function savePlacesToDb(places) {
  for (const place of places) {
    await pool.query(
      `INSERT INTO places (
        google_place_id, name, category, address, phone,
        website, location, rating, total_ratings,
        opening_hours, photos, cached_at
      )
      VALUES (
        $1, $2, $3, $4, $5, $6,
        ST_MakePoint($7, $8)::geography,
        $9, $10, $11, $12, NOW()
      )
      ON CONFLICT (google_place_id) DO UPDATE SET
        name          = EXCLUDED.name,
        rating        = EXCLUDED.rating,
        total_ratings = EXCLUDED.total_ratings,
        opening_hours = EXCLUDED.opening_hours,
        cached_at     = NOW()`,
      [
        place.google_place_id,
        place.name,
        place.category,
        place.address,
        place.phone,
        place.website,
        place.longitude, // ST_MakePoint(lng, lat) — order matters
        place.latitude,
        place.rating,
        place.total_ratings,
        JSON.stringify(place.opening_hours),
        JSON.stringify(place.photos),
      ],
    );
  }
}

// ─────────────────────────────────────────
// Query PostGIS for nearby places
// ─────────────────────────────────────────
async function queryPostGIS(category, latitude, longitude, radius) {
  const result = await pool.query(
    `SELECT
      id, name, category, address, phone, website,
      rating, total_ratings, opening_hours, photos,
      google_place_id,
      ROUND(
        (ST_Distance(
          location,
          ST_MakePoint($3, $2)::geography
        ) / 1000.0)::numeric, 1
      ) AS distance_km
    FROM places
    WHERE
      category = $1
      AND ST_DWithin(
        location,
        ST_MakePoint($3, $2)::geography,
        $4 * 1000
      )
    ORDER BY distance_km ASC
    LIMIT 20`,
    [category, latitude, longitude, radius],
  );

  return result.rows;
}

// ─────────────────────────────────────────
// Save search to history
// ─────────────────────────────────────────
async function saveSearchHistory({
  userId,
  query,
  rawQuery,
  latitude,
  longitude,
  radius,
  resultsCount,
  source,
}) {
  await pool.query(
    `INSERT INTO search_history
      (user_id, query, raw_query, search_location, radius_km, results_count, source)
     VALUES
      ($1, $2, $3, ST_MakePoint($5, $4)::geography, $6, $7, $8)`,
    [
      userId,
      query,
      rawQuery,
      latitude,
      longitude,
      radius,
      resultsCount,
      source,
    ],
  );
}

// ─────────────────────────────────────────
// MAIN SEARCH FUNCTION
// This is what the controller calls
// ─────────────────────────────────────────
async function searchNearby({
  rawQuery,
  latitude,
  longitude,
  radius = 5,
  userId,
  source = "manual",
}) {
  // Step 1 — normalize query
  const query = await normalizeQuery(rawQuery);

  // Step 2 — build cache key
  // Round coords to 3 decimal places (~111m precision) for better cache hits
  const lat = parseFloat(latitude).toFixed(3);
  const lng = parseFloat(longitude).toFixed(3);
  const cacheKey = `search:${query}:${lat}:${lng}:${radius}`;

  // Step 3 — check Redis cache
  const cached = await redis.get(cacheKey);
  if (cached) {
    console.log(`Cache hit: ${cacheKey}`);
    return { places: JSON.parse(cached), source: "cache" };
  }

  // Step 4 — query PostGIS
  let places = await queryPostGIS(query, latitude, longitude, radius);
  console.log(`PostGIS returned ${places.length} results for "${query}"`);

  // Step 5 — fallback to Google Places if not enough results
  if (places.length < 5) {
    console.log(`Falling back to Google Places for "${query}"`);
    const externalPlaces = await fetchFromGooglePlaces(
      query,
      latitude,
      longitude,
      radius,
    );

    // Save fetched places into PostGIS for future searches
    await savePlacesToDb(externalPlaces);

    // Re-query PostGIS now that new places are saved
    places = await queryPostGIS(query, latitude, longitude, radius);
  }

  // Step 6 — write to Redis cache
  await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(places));

  // Step 7 — save to search history (non-blocking)
  if (userId) {
    saveSearchHistory({
      userId,
      query,
      rawQuery,
      latitude,
      longitude,
      radius,
      resultsCount: places.length,
      source,
    }).catch((err) => console.error("Search history error:", err.message));
  }

  return { places, source: "db" };
}

module.exports = { searchNearby, normalizeQuery };
