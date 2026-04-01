const router = require("express").Router();
const { search, getSearchHistory } = require("./search.controller");
const { protect } = require("../../middleware/auth");

// protect is optional here — logged in users get search history saved
// guests can still search
router.get("/history", protect, getSearchHistory);
router.get("/", protect, search);

module.exports = router;
