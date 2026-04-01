const Anthropic = require("@anthropic-ai/sdk");
const { redis } = require("../../config/redis");
const { searchNearby } = require("../search/search.service");
require("dotenv").config();

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SESSION_TTL = 60 * 60 * 2; // 2 hours in seconds

// ─────────────────────────────────────────
// Tool definitions — what the agent can do
// ─────────────────────────────────────────
const tools = [
  {
    name: "searchNearbyPlaces",
    description:
      "Search for places near the user's current location. Use this when the user asks to find any type of place, business, or landmark near them.",
    input_schema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description:
            "The type of place to search for e.g. mosque, eatery, gas station, hospital",
        },
        latitude: {
          type: "number",
          description: "User's current latitude coordinate",
        },
        longitude: {
          type: "number",
          description: "User's current longitude coordinate",
        },
        radius: {
          type: "number",
          description:
            "Search radius in kilometres. Default is 5 if not specified by user.",
        },
      },
      required: ["query", "latitude", "longitude"],
    },
  },
];

// ─────────────────────────────────────────
// System prompt — defines agent personality
// ─────────────────────────────────────────
const SYSTEM_PROMPT = `You are Findr's helpful assistant. Findr is a location-based place discovery app that helps users find places near them anywhere in the world.

Your job is to:
- Help users find places near their location (mosques, eateries, gas stations, hospitals, ATMs, hotels, pharmacies, markets, bus stops etc.)
- Answer questions about how Findr works
- Be friendly, concise, and helpful

When a user asks to find a place:
- Always call the searchNearbyPlaces tool — never make up place names or locations
- After getting results, summarize them naturally: mention the top 2-3 closest places by name and distance
- If no results are found, let the user know and suggest trying a wider radius

When a user has not provided their location and asks to find something:
- Ask them to enable location access in the app so you can find places near them

Keep responses short and conversational. You are embedded in a mobile/web app, not a chat interface.`;

// ─────────────────────────────────────────
// Session management via Redis
// ─────────────────────────────────────────
async function getSession(sessionId) {
  const data = await redis.get(`agent_session:${sessionId}`);
  return data ? JSON.parse(data) : { messages: [] };
}

async function saveSession(sessionId, session) {
  await redis.setex(
    `agent_session:${sessionId}`,
    SESSION_TTL,
    JSON.stringify(session),
  );
}

async function clearSession(sessionId) {
  await redis.del(`agent_session:${sessionId}`);
}

// ─────────────────────────────────────────
// Execute tool calls the agent requests
// ─────────────────────────────────────────
async function executeTool(toolName, toolInput, userId) {
  if (toolName === "searchNearbyPlaces") {
    const result = await searchNearby({
      rawQuery: toolInput.query,
      latitude: toolInput.latitude,
      longitude: toolInput.longitude,
      radius: toolInput.radius || 5,
      userId,
      source: "agent",
    });

    // Return a clean summary for the agent to respond with
    return {
      total: result.places.length,
      places: result.places.map((p) => ({
        name: p.name,
        category: p.category,
        address: p.address,
        distance_km: p.distance_km,
        rating: p.rating,
        open_now: p.opening_hours?.open_now ?? null,
        phone: p.phone,
      })),
    };
  }

  throw new Error(`Unknown tool: ${toolName}`);
}

// ─────────────────────────────────────────
// MAIN AGENT FUNCTION
// ─────────────────────────────────────────
async function chat({ sessionId, userMessage, latitude, longitude, userId }) {
  // Load conversation history from Redis
  const session = await getSession(sessionId);

  // Inject location into user message context if provided
  let messageContent = userMessage;
  if (latitude && longitude) {
    messageContent = `[User location: lat=${latitude}, lng=${longitude}]\n${userMessage}`;
  }

  // Append user message to history
  session.messages.push({
    role: "user",
    content: messageContent,
  });

  // First Claude API call
  let response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    tools,
    messages: session.messages,
  });

  // Agentic loop — keeps going until Claude stops calling tools
  while (response.stop_reason === "tool_use") {
    const assistantMessage = { role: "assistant", content: response.content };
    session.messages.push(assistantMessage);

    // Process all tool calls in this response
    const toolResults = [];
    for (const block of response.content) {
      if (block.type === "tool_use") {
        console.log(`Agent calling tool: ${block.name}`, block.input);

        const result = await executeTool(block.name, block.input, userId);

        toolResults.push({
          type: "tool_result",
          tool_use_id: block.id,
          content: JSON.stringify(result),
        });
      }
    }

    // Send tool results back to Claude
    session.messages.push({
      role: "user",
      content: toolResults,
    });

    // Second Claude API call with tool results
    response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      tools,
      messages: session.messages,
    });
  }

  // Extract final text response
  const finalText = response.content
    .filter((block) => block.type === "text")
    .map((block) => block.text)
    .join("");

  // Save assistant response to history
  session.messages.push({
    role: "assistant",
    content: finalText,
  });

  // Persist updated session to Redis
  await saveSession(sessionId, session);

  return {
    reply: finalText,
    sessionId,
    messageCount: session.messages.length,
  };
}

module.exports = { chat, clearSession };
