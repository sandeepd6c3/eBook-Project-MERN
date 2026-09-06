const express = require("express");
const router = express.Router();
const {
  generateBook,
  generateOutline,
  generateChapter,
  editContent,
  editSelection,
  reviewContent,
  generateExercises,
  editText,
  generateCoverImage,
} = require("../controller/aiController");
const { protect } = require("../middlewares/authMiddlewares");

// Protect all AI generation routes
router.use(protect);

router.post("/generate-book", generateBook);
router.post("/generate-outline", generateOutline);
router.post("/generate-chapter", generateChapter);
router.post("/edit-content", editContent);
router.post("/edit-selection", editSelection);
router.post("/review-content", reviewContent);
router.post("/generate-exercises", generateExercises);
router.post("/edit-text", editText);
router.post("/generate-cover", generateCoverImage);

module.exports = router;
