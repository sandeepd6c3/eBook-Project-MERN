const express = require("express");
const router = express.Router();
const {
    createBook,
    getBooks,
    getBookById,
    updateBook,
    deleteBook,
} = require("../controller/bookController");
const { protect } = require("../middlewares/authMiddlewares");

// Protect all book routes
router.use(protect);

router.route("/")
    .post(createBook)
    .get(getBooks);

router.route("/:id")
    .get(getBookById)
    .put(updateBook)
    .delete(deleteBook);

module.exports = router;
