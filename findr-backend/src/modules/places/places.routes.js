const router = require("express").Router();
const {
  getPlace,
  save,
  getSaved,
  removeSaved,
  directions,
} = require("./places.controller");
const { protect } = require("../../middleware/auth");

// Specific routes first
router.get("/saved/me", protect, getSaved);
router.get("/directions", protect, directions);
router.post("/saved", protect, save);
router.delete("/saved/:placeId", protect, removeSaved);

// Dynamic route last — otherwise it swallows everything above
router.get("/:id", getPlace);

module.exports = router;
