-- ============================================================
-- FINDR — ALL MIGRATIONS
-- Run this entire file once against your findr_dev database
-- in pgAdmin4 Query Tool. All 8 migrations in correct order.
-- ============================================================


-- ============================================================
-- 001: Enable extensions
-- Must run first. PostGIS provides GEOGRAPHY type and spatial
-- functions. uuid-ossp provides uuid_generate_v4().
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS postgis;


-- ============================================================
-- 002: Create users table
-- ============================================================

CREATE TABLE users (
  id            UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  email         TEXT        NOT NULL UNIQUE,
  password_hash TEXT        NOT NULL,
  name          TEXT        NOT NULL,
  plan          TEXT        NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'premium')),
  last_location GEOGRAPHY(Point, 4326),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE INDEX idx_users_email ON users(email);


-- ============================================================
-- 003: Create places table
-- Core spatial table. Every place discovered via Google Places
-- is stored here so future searches are served from our own DB.
-- ============================================================

CREATE TABLE places (
  id              UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
  google_place_id TEXT          UNIQUE,
  name            TEXT          NOT NULL,
  category        TEXT          NOT NULL,
  address         TEXT,
  phone           TEXT,
  website         TEXT,
  location        GEOGRAPHY(Point, 4326) NOT NULL,
  rating          NUMERIC(2, 1) CHECK (rating >= 0 AND rating <= 5),
  total_ratings   INTEGER       DEFAULT 0,
  opening_hours   JSONB,
  photos          JSONB,
  cached_at       TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- THE most important index in the project.
-- Without this, every spatial search does a full table scan.
CREATE INDEX idx_places_location ON places USING GIST(location);

-- For filtering by category before spatial search
CREATE INDEX idx_places_category ON places(category);

-- For finding stale records to refresh from Google
CREATE INDEX idx_places_cached_at ON places(cached_at);


-- ============================================================
-- 004: Create search_history table
-- Records every search a user performs.
-- Powers: recent searches UI, analytics, popular query insights.
-- ============================================================

CREATE TABLE search_history (
  id              UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID        REFERENCES users(id) ON DELETE CASCADE,
  query           TEXT        NOT NULL,
  raw_query       TEXT        NOT NULL,
  search_location GEOGRAPHY(Point, 4326) NOT NULL,
  radius_km       INTEGER     NOT NULL DEFAULT 5,
  results_count   INTEGER     NOT NULL DEFAULT 0,
  source          TEXT        NOT NULL DEFAULT 'manual'
                              CHECK (source IN ('manual', 'agent')),
  searched_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_search_history_user_id ON search_history(user_id, searched_at DESC);
CREATE INDEX idx_search_history_query   ON search_history(query);


-- ============================================================
-- 005: Create saved_places table
-- Users can bookmark places. Free users: up to 5.
-- Premium users: unlimited. Enforced in the application layer.
-- ============================================================

CREATE TABLE saved_places (
  id       UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id  UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  place_id UUID        NOT NULL REFERENCES places(id) ON DELETE CASCADE,
  note     TEXT,
  saved_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_user_place UNIQUE (user_id, place_id)
);

CREATE INDEX idx_saved_places_user_id ON saved_places(user_id, saved_at DESC);


-- ============================================================
-- 006: Create agent_sessions table
-- Stores AI chat history per user session.
-- Redis is the live store during active sessions.
-- This table persists completed sessions for history/debugging.
-- ============================================================

CREATE TABLE agent_sessions (
  id             UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id        UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  messages       JSONB       NOT NULL DEFAULT '[]',
  started_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_active_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at       TIMESTAMPTZ
);

CREATE INDEX idx_agent_sessions_user_id ON agent_sessions(user_id, last_active_at DESC);


-- ============================================================
-- 007: Core search query reference
-- NOT a schema change — documents the primary PostGIS query
-- your Search Service will run. Kept here as reference.
--
-- Usage: search "mosque" near lat=6.5244, lng=3.3792, radius=5km
--
-- SELECT
--   p.id, p.name, p.category, p.address, p.phone,
--   p.rating, p.opening_hours, p.photos, p.google_place_id,
--   ST_Distance(p.location, ST_MakePoint($3, $2)::geography) AS distance_metres,
--   ROUND(ST_Distance(p.location, ST_MakePoint($3, $2)::geography) / 1000.0, 1) AS distance_km
-- FROM places p
-- WHERE
--   p.category = $1
--   AND ST_DWithin(p.location, ST_MakePoint($3, $2)::geography, $4 * 1000)
-- ORDER BY distance_metres ASC
-- LIMIT 20;
--
-- $1 = category (TEXT)     e.g. 'mosque'
-- $2 = latitude  (FLOAT)   e.g. 6.5244
-- $3 = longitude (FLOAT)   e.g. 3.3792
-- $4 = radius_km (INTEGER) e.g. 5
--
-- IMPORTANT: ST_MakePoint takes (longitude, latitude) — NOT (latitude, longitude).
-- Your frontend sends lat/lng. Always flip the order for PostGIS functions.
-- ============================================================

SELECT 'Migration 007: core query reference noted' AS status;


-- ============================================================
-- 008: Create and seed category_synonyms table
-- Maps raw user input to normalized category values.
-- Powers the query normalization step in the Search Service.
-- e.g. "filling station" → "gas_station"
-- ============================================================

CREATE TABLE category_synonyms (
  id         SERIAL PRIMARY KEY,
  raw        TEXT   NOT NULL UNIQUE,
  normalized TEXT   NOT NULL
);

INSERT INTO category_synonyms (raw, normalized) VALUES
  -- Gas stations
  ('gas station',      'gas_station'),
  ('filling station',  'gas_station'),
  ('petrol station',   'gas_station'),
  ('fuel station',     'gas_station'),
  ('service station',  'gas_station'),
  ('petrol',           'gas_station'),

  -- Restaurants
  ('eatery',           'restaurant'),
  ('restaurant',       'restaurant'),
  ('food',             'restaurant'),
  ('eating place',     'restaurant'),
  ('diner',            'restaurant'),
  ('canteen',          'restaurant'),
  ('buka',             'restaurant'),

  -- Fast food
  ('fast food',        'fast_food'),
  ('takeaway',         'fast_food'),
  ('takeout',          'fast_food'),

  -- Worship
  ('mosque',           'mosque'),
  ('masjid',           'mosque'),
  ('church',           'church'),
  ('cathedral',        'church'),
  ('chapel',           'church'),

  -- Healthcare
  ('hospital',         'hospital'),
  ('clinic',           'clinic'),
  ('pharmacy',         'pharmacy'),
  ('chemist',          'pharmacy'),
  ('drugstore',        'pharmacy'),

  -- Banks & ATMs
  ('atm',              'atm'),
  ('cash machine',     'atm'),
  ('bank',             'bank'),

  -- Accommodation
  ('hotel',            'hotel'),
  ('motel',            'hotel'),
  ('lodge',            'hotel'),
  ('guesthouse',       'hotel'),

  -- Shopping
  ('supermarket',      'supermarket'),
  ('grocery',          'supermarket'),
  ('market',           'market'),

  -- Transport
  ('bus stop',         'bus_stop'),
  ('bus station',      'bus_station'),
  ('taxi',             'taxi_stand'),
  ('park',             'motor_park');

CREATE INDEX idx_category_synonyms_raw ON category_synonyms(raw);


-- ============================================================
-- ALL MIGRATIONS COMPLETE
-- Tables created: users, places, search_history,
--                 saved_places, agent_sessions, category_synonyms
-- Extensions enabled: postgis, uuid-ossp
-- ============================================================

SELECT 'Findr database setup complete' AS status;
