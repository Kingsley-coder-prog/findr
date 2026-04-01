const { chat, clearSession } = require("./agent.service");
const { v4: uuidv4 } = require("uuid");

async function sendMessage(req, res, next) {
  try {
    const { message, latitude, longitude, sessionId } = req.body;

    if (!message) {
      return res.status(400).json({ error: "message is required" });
    }

    // Use existing session or create a new one
    const activeSessionId = sessionId || uuidv4();

    const result = await chat({
      sessionId: activeSessionId,
      userMessage: message,
      latitude,
      longitude,
      userId: req.userId,
    });

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

async function resetSession(req, res, next) {
  try {
    const { sessionId } = req.params;
    await clearSession(sessionId);
    res.status(200).json({ message: "Session cleared successfully" });
  } catch (error) {
    next(error);
  }
}

module.exports = { sendMessage, resetSession };
