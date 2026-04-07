const { pool } = require("../../config/db");
const { redis } = require("../../config/redis");
const axios = require("axios");
require("dotenv").config();

const CACHE_TTL = parseInt(process.env.CACHE_TTL_SECONDS) || 600;

// ─────────────────────────────────────────
// Google Places API (New) valid type map
// Maps natural language / synonyms → valid includedTypes values
// Full list: https://developers.google.com/maps/documentation/places/web-service/place-types
// ─────────────────────────────────────────
const GOOGLE_TYPE_MAP = {
  // Food & drink
  restaurant: "restaurant",
  eatery: "restaurant",
  eateries: "restaurant",
  food: "restaurant",
  buka: "restaurant",
  "fast food": "fast_food_restaurant",
  fast_food: "fast_food_restaurant",
  cafe: "cafe",
  coffee: "cafe",
  bar: "bar",
  bakery: "bakery",

  // Health
  hospital: "hospital",
  clinic: "hospital",
  "medical center": "hospital",
  "medical centre": "hospital",
  "health center": "hospital",
  "health centre": "hospital",
  doctor: "doctor",
  pharmacy: "pharmacy",
  chemist: "pharmacy",
  drugstore: "pharmacy",
  dentist: "dentist",
  "dental clinic": "dentist",

  // Finance
  atm: "atm",
  bank: "bank",

  // Transport & fuel
  "gas station": "gas_station",
  gas_station: "gas_station",
  "filling station": "gas_station",
  "petrol station": "gas_station",
  "fuel station": "gas_station",
  "service station": "gas_station",
  "bus stop": "transit_station",
  "bus station": "bus_station",
  "train station": "train_station",
  "taxi stand": "taxi_stand",
  parking: "parking",

  // Accommodation
  hotel: "hotel",
  motel: "motel",
  lodging: "lodging",
  guesthouse: "lodging",
  hostel: "lodging",
  "guest house": "lodging",

  // Shopping
  supermarket: "supermarket",
  market: "supermarket",
  grocery: "grocery_store",
  "grocery store": "grocery_store",
  mall: "shopping_mall",
  "shopping mall": "shopping_mall",
  "shopping center": "shopping_mall",
  "shopping centre": "shopping_mall",
  store: "store",
  shop: "store",

  // Religion
  mosque: "mosque",
  church: "church",
  "place of worship": "place_of_worship",
  temple: "hindu_temple",
  synagogue: "synagogue",

  // Education
  school: "school",
  schools: "school",
  "primary school": "school",
  "secondary school": "school",
  "primary and secondary schools": "school",
  "primary and secondary school": "school",
  university: "university",
  college: "university",
  "higher institution": "university",

  // Emergency
  police: "police",
  "police station": "police",
  "fire station": "fire_station",

  // Leisure
  gym: "gym",
  park: "park",
  stadium: "stadium",
  cinema: "movie_theater",
  "movie theater": "movie_theater",
  "movie theatre": "movie_theater",
  library: "library",

  // Accommodation
  spa: "spa",
  salon: "hair_care",
  "hair salon": "hair_care",
  barbershop: "barber_shop",
  "barber shop": "barber_shop",
};

function normalizeToGoogleType(query) {
  const lower = query.toLowerCase().trim();
  return GOOGLE_TYPE_MAP[lower] || lower;
}

// ─────────────────────────────────────────
// Fetch places from Google Places API
// ─────────────────────────────────────────
async function fetchFromGooglePlaces(query, latitude, longitude, radius) {
  // Normalize query to a valid Google Places type
  const googleType = normalizeToGoogleType(query);

  try {
    const response = await axios.post(
      "https://places.googleapis.com/v1/places:searchNearby",
      {
        includedTypes: [googleType],
        maxResultCount: 20,
        locationRestriction: {
          circle: {
            center: { latitude, longitude },
            radius: radius * 1000,
          },
        },
      },
      {
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": process.env.GOOGLE_PLACES_API_KEY,
          "X-Goog-FieldMask":
            "places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.userRatingCount,places.currentOpeningHours,places.internationalPhoneNumber,places.websiteUri,places.photos",
        },
      },
    );

    const places = response.data.places || [];

    return places.map((p) => ({
      google_place_id: p.id,
      name: p.displayName?.text || "Unknown",
      category: query, // store original normalized query, not the Google type
      address: p.formattedAddress || null,
      phone: p.internationalPhoneNumber || null,
      website: p.websiteUri || null,
      latitude: p.location.latitude,
      longitude: p.location.longitude,
      rating: p.rating || null,
      total_ratings: p.userRatingCount || 0,
      opening_hours: p.currentOpeningHours
        ? {
            open_now: p.currentOpeningHours.openNow,
            periods: p.currentOpeningHours.periods || [],
          }
        : null,
      photos: p.photos?.map((ph) => ({ reference: ph.name })) || [],
    }));
  } catch (error) {
    console.error(
      "Google Places API error:",
      error.response?.data?.error?.message || error.message,
    );
    return [];
  }
}

// ─────────────────────────────────────────
// Normalize query using category_synonyms table
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
        place.longitude,
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
// ─────────────────────────────────────────
async function searchNearby({
  rawQuery,
  latitude,
  longitude,
  radius = 5,
  userId,
  source = "manual",
}) {
  // Step 1 — normalize query via DB synonyms
  const query = await normalizeQuery(rawQuery);

  // Step 2 — build cache key
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

    if (externalPlaces.length > 0) {
      await savePlacesToDb(externalPlaces);
      places = await queryPostGIS(query, latitude, longitude, radius);
    } else {
      console.log(
        "Google Places returned no results or is unavailable — using PostGIS results only",
      );
    }
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
