const express = require("express");
const router = express.Router();
const { getWriterAnalytics } = require("../controller/analyticsController");
const { protect } = require("../middlewares/authMiddlewares");

router.use(protect);
router.get("/", getWriterAnalytics);

module.exports = router;
