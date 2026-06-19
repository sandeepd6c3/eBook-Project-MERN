const express = require("express");
const router = express.Router();
const { generateOutline, generateChapter, editText } = require("../controller/aiController");
const { protect } = require("../middlewares/authMiddlewares");

// Protect all AI generation routes
router.use(protect);

router.post("/generate-outline", generateOutline);
router.post("/generate-chapter", generateChapter);
router.post("/edit-text", editText);

module.exports = router;
