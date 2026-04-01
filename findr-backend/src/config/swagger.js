const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Findr API",
      version: "1.0.0",
      description: `
## Findr — Location-based Place Discovery API

### Authentication
Most endpoints require a Bearer token in the Authorization header.
1. Register or login to get a token
2. Click **Authorize** and enter: \`Bearer YOUR_TOKEN\`
3. Token expires in 7 days

### Modules
| Module | Base Path | Description |
|--------|-----------|-------------|
| Auth | /api/auth | Registration, login, logout |
| Search | /api/search | Spatial place search |
| Places | /api/places | Place details, saved places |
| Agent | /api/agent | AI assistant with tool calling |
      `,
    },
    servers: [{ url: "http://localhost:5000", description: "Development" }],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        Error: {
          type: "object",
          properties: {
            error: { type: "string", example: "Something went wrong" },
          },
        },
        User: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            name: { type: "string", example: "Ifeanyi" },
            email: { type: "string", example: "ifeanyi@test.com" },
            plan: { type: "string", enum: ["free", "premium"] },
            created_at: { type: "string", format: "date-time" },
          },
        },
        Place: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            name: { type: "string", example: "Masjid Al-Noor" },
            category: { type: "string", example: "mosque" },
            address: { type: "string", example: "12 Lagos Island, Lagos" },
            phone: { type: "string", nullable: true },
            website: { type: "string", nullable: true },
            rating: { type: "number", example: 4.2 },
            total_ratings: { type: "integer", example: 120 },
            distance_km: { type: "number", example: 0.8 },
            opening_hours: { type: "object" },
            photos: { type: "array", items: { type: "object" } },
            google_place_id: { type: "string" },
          },
        },
      },
    },
    security: [{ BearerAuth: [] }],
    paths: {
      // ── HEALTH ────────────────────────────────────────────────────
      "/health": {
        get: {
          tags: ["Health"],
          summary: "Server health check",
          security: [],
          responses: { 200: { description: "Server is running" } },
        },
      },

      // ── AUTH ──────────────────────────────────────────────────────
      "/api/auth/register": {
        post: {
          tags: ["Auth"],
          summary: "Register a new user",
          security: [],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["name", "email", "password"],
                  properties: {
                    name: { type: "string", example: "Ifeanyi" },
                    email: { type: "string", example: "ifeanyi@test.com" },
                    password: { type: "string", example: "password123" },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: "Account created — returns user and token" },
            409: { description: "Email already exists" },
          },
        },
      },

      "/api/auth/login": {
        post: {
          tags: ["Auth"],
          summary: "Login an existing user",
          security: [],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["email", "password"],
                  properties: {
                    email: { type: "string", example: "ifeanyi@test.com" },
                    password: { type: "string", example: "password123" },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: "Login successful — returns user and token" },
            401: { description: "Invalid credentials" },
          },
        },
      },

      "/api/auth/me": {
        get: {
          tags: ["Auth"],
          summary: "Get currently logged in user",
          responses: {
            200: { description: "Current user data" },
            401: { description: "Unauthorized" },
          },
        },
      },

      "/api/auth/logout": {
        post: {
          tags: ["Auth"],
          summary: "Logout and blacklist current token",
          responses: {
            200: { description: "Logged out successfully" },
            401: { description: "Unauthorized" },
          },
        },
      },

      // ── SEARCH ────────────────────────────────────────────────────
      "/api/search": {
        get: {
          tags: ["Search"],
          summary: "Search for places near a location",
          description:
            "Checks Redis cache first, then PostGIS, then falls back to Google Places API. Results are cached for 10 minutes.",
          parameters: [
            {
              name: "query",
              in: "query",
              required: true,
              schema: { type: "string" },
              description: "Type of place e.g. mosque, eatery, gas station",
              example: "mosque",
            },
            {
              name: "latitude",
              in: "query",
              required: true,
              schema: { type: "number" },
              example: 6.5244,
            },
            {
              name: "longitude",
              in: "query",
              required: true,
              schema: { type: "number" },
              example: 3.3792,
            },
            {
              name: "radius",
              in: "query",
              schema: { type: "integer", default: 5 },
              description: "Search radius in kilometres",
            },
          ],
          responses: {
            200: { description: "List of nearby places ordered by distance" },
            400: { description: "Missing required parameters" },
            401: { description: "Unauthorized" },
          },
        },
      },

      // ── SEARCH HISTORY ────────────────────────────────────────────
      "/api/search/history": {
        get: {
          tags: ["Search"],
          summary: "Get current user's search history",
          parameters: [
            {
              name: "limit",
              in: "query",
              schema: { type: "integer", default: 10 },
              description: "Number of recent searches to return",
            },
          ],
          responses: {
            200: { description: "Recent search history" },
            401: { description: "Unauthorized" },
          },
        },
      },

      // ── PLACES ────────────────────────────────────────────────────
      "/api/places/saved/me": {
        get: {
          tags: ["Places"],
          summary: "Get current user's saved places",
          responses: {
            200: { description: "List of saved places with full details" },
            401: { description: "Unauthorized" },
          },
        },
      },

      "/api/places/saved": {
        post: {
          tags: ["Places"],
          summary: "Save a place to favourites",
          description: "Free plan users are limited to 5 saved places.",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["placeId"],
                  properties: {
                    placeId: { type: "string", format: "uuid" },
                    note: {
                      type: "string",
                      example: "Good mosque near the island",
                    },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: "Place saved successfully" },
            403: { description: "Free plan limit reached" },
            404: { description: "Place not found" },
          },
        },
      },

      "/api/places/saved/{placeId}": {
        delete: {
          tags: ["Places"],
          summary: "Remove a place from saved",
          parameters: [
            {
              name: "placeId",
              in: "path",
              required: true,
              schema: { type: "string", format: "uuid" },
            },
          ],
          responses: {
            200: { description: "Place removed from saved" },
            404: { description: "Saved place not found" },
          },
        },
      },

      "/api/places/directions": {
        get: {
          tags: ["Places"],
          summary: "Get directions from origin to a place",
          description:
            "Returns distance, duration and step-by-step directions. Powered by Google Maps Directions API.",
          parameters: [
            {
              name: "originLat",
              in: "query",
              required: true,
              schema: { type: "number" },
              example: 6.5244,
            },
            {
              name: "originLng",
              in: "query",
              required: true,
              schema: { type: "number" },
              example: 3.3792,
            },
            {
              name: "placeId",
              in: "query",
              required: true,
              schema: { type: "string" },
              description: "UUID or google_place_id of the destination place",
            },
          ],
          responses: {
            200: {
              description: "Directions with distance, duration and steps",
            },
            404: { description: "Destination place not found" },
          },
        },
      },

      "/api/places/{id}": {
        get: {
          tags: ["Places"],
          summary: "Get a place by ID",
          security: [],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string", format: "uuid" },
            },
          ],
          responses: {
            200: { description: "Place details" },
            404: { description: "Place not found" },
          },
        },
      },

      // ── AGENT ─────────────────────────────────────────────────────
      "/api/agent/chat": {
        post: {
          tags: ["Agent"],
          summary: "Send a message to the AI assistant",
          description:
            "The agent can answer questions about Findr and trigger place searches using tool calling. Include latitude and longitude so the agent can search near the user.",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["message"],
                  properties: {
                    message: {
                      type: "string",
                      example: "Find me a mosque near me",
                    },
                    latitude: { type: "number", example: 6.5244 },
                    longitude: { type: "number", example: 3.3792 },
                    sessionId: {
                      type: "string",
                      description: "Omit to start a new session",
                    },
                  },
                },
              },
            },
          },
          responses: {
            200: {
              description: "Agent reply with sessionId and message count",
            },
            401: { description: "Unauthorized" },
          },
        },
      },

      "/api/agent/session/{sessionId}": {
        delete: {
          tags: ["Agent"],
          summary: "Clear an agent session",
          parameters: [
            {
              name: "sessionId",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: {
            200: { description: "Session cleared" },
            401: { description: "Unauthorized" },
          },
        },
      },
    },
  },
  apis: [],
};

module.exports = swaggerJsdoc(options);
