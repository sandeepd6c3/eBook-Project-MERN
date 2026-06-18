const Book = require("../models/book");

// @desc    Create a new book
// @route   POST /api/books
// @access  Private
const createBook = async (req, res) => {
    const { title, description, coverImage, chapters } = req.body;

    try {
        if (!title) {
            return res.status(400).json({ message: "Book title is required" });
        }

        const book = await Book.create({
            title,
            description: description || "",
            coverImage: coverImage || "",
            chapters: chapters || [],
            author: req.user._id,
        });

        res.status(201).json(book);
    } catch (error) {
        console.error("Create book error:", error);
        res.status(500).json({ message: "Server error creating book", error: error.message });
    }
};

// @desc    Get all books for the authenticated user
// @route   GET /api/books
// @access  Private
const getBooks = async (req, res) => {
    try {
        const books = await Book.find({ author: req.user._id }).sort({ createdAt: -1 });
        res.json(books);
    } catch (error) {
        console.error("Get books error:", error);
        res.status(500).json({ message: "Server error fetching books", error: error.message });
    }
};

// @desc    Get a single book by ID
// @route   GET /api/books/:id
// @access  Private
const getBookById = async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);

        if (!book) {
            return res.status(404).json({ message: "Book not found" });
        }

        // Check ownership
        if (book.author.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Not authorized to access this book" });
        }

        res.json(book);
    } catch (error) {
        console.error("Get book by ID error:", error);
        res.status(500).json({ message: "Server error fetching book", error: error.message });
    }
};

// @desc    Update a book
// @route   PUT /api/books/:id
// @access  Private
const updateBook = async (req, res) => {
    const { title, description, coverImage, chapters, isPublished } = req.body;

    try {
        const book = await Book.findById(req.params.id);

        if (!book) {
            return res.status(404).json({ message: "Book not found" });
        }

        // Check ownership
        if (book.author.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Not authorized to update this book" });
        }

        // Update fields if provided
        if (title !== undefined) book.title = title;
        if (description !== undefined) book.description = description;
        if (coverImage !== undefined) book.coverImage = coverImage;
        if (chapters !== undefined) book.chapters = chapters;
        if (isPublished !== undefined) book.isPublished = isPublished;

        const updatedBook = await book.save();
        res.json(updatedBook);
    } catch (error) {
        console.error("Update book error:", error);
        res.status(500).json({ message: "Server error updating book", error: error.message });
    }
};

// @desc    Delete a book
// @route   DELETE /api/books/:id
// @access  Private
const deleteBook = async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);

        if (!book) {
            return res.status(404).json({ message: "Book not found" });
        }

        // Check ownership
        if (book.author.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Not authorized to delete this book" });
        }

        await Book.findByIdAndDelete(req.params.id);
        res.json({ message: "Book deleted successfully" });
    } catch (error) {
        console.error("Delete book error:", error);
        res.status(500).json({ message: "Server error deleting book", error: error.message });
    }
};

module.exports = {
    createBook,
    getBooks,
    getBookById,
    updateBook,
    deleteBook,
};
