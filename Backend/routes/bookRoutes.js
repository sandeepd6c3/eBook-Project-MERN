const express = require("express");
const router = express.Router();
const {
    createBook,
    getBooks,
    getBookById,
    updateBook,
    deleteBook,
    getPublicBooks,
    incrementReadCount,
    addBookReview,
} = require("../controller/bookController");
const { protect } = require("../middlewares/authMiddlewares");

// Protect all book routes
router.use(protect);

// Public Discover routes (must precede general /:id routes)
router.get("/public", getPublicBooks);
router.post("/:id/read", incrementReadCount);
router.post("/:id/reviews", addBookReview);

router.route("/")
    .post(createBook)
    .get(getBooks);

router.route("/:id")
    .get(getBookById)
    .put(updateBook)
    .delete(deleteBook);

module.exports = router;
