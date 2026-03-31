const router = require("express").Router();
router.get("/ping", (req, res) => res.json({ module: "auth" }));
module.exports = router;
