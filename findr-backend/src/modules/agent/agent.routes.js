const router = require("express").Router();
const { sendMessage, resetSession } = require("./agent.controller");
const { protect } = require("../../middleware/auth");

router.post("/chat", protect, sendMessage);
router.delete("/session/:sessionId", protect, resetSession);

module.exports = router;
