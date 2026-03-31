const router = require("express").Router();
router.get("/ping", (req, res) => res.json({ module: "search" }));
module.exports = router;
