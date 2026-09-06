const Book = require("../models/book");

// @desc    Create a new book
// @route   POST /api/books
// @access  Private
const createBook = async (req, res) => {
    const { title, subtitle, description, coverImage, chapters, settings, exportConfig } = req.body;

    try {
        if (!title) {
            return res.status(400).json({ message: "Book title is required" });
        }

        const formattedChapters = (chapters || []).map((ch, idx) => ({
            title: ch.title,
            body: ch.body || "",
            status: ch.status || "Draft",
            wordCount: ch.wordCount || (ch.body ? ch.body.replace(/<[^>]*>/g, " ").trim().split(/\s+/).filter(Boolean).length : 0),
            order: ch.order !== undefined ? ch.order : idx,
            updatedAt: ch.updatedAt || new Date(),
        }));

        const book = await Book.create({
            title,
            subtitle: subtitle || "",
            description: description || "",
            coverImage: coverImage || "",
            chapters: formattedChapters,
            settings: settings || {},
            exportConfig: exportConfig || {},
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

        // Check ownership OR public access
        if (book.author.toString() !== req.user._id.toString() && !book.isPublished) {
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
    const { title, subtitle, description, coverImage, chapters, isPublished, settings, exportConfig } = req.body;

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
        if (subtitle !== undefined) book.subtitle = subtitle;
        if (description !== undefined) book.description = description;
        if (coverImage !== undefined) book.coverImage = coverImage;
        if (isPublished !== undefined) book.isPublished = isPublished;
        if (settings !== undefined) book.settings = settings;
        if (exportConfig !== undefined) book.exportConfig = exportConfig;

        if (chapters !== undefined) {
            book.chapters = chapters.map((ch, idx) => ({
                _id: ch._id,
                title: ch.title,
                body: ch.body || "",
                status: ch.status || (ch.body && ch.body.length > 50 ? "Edited" : "Draft"),
                wordCount: ch.wordCount || (ch.body ? ch.body.replace(/<[^>]*>/g, " ").trim().split(/\s+/).filter(Boolean).length : 0),
                order: ch.order !== undefined ? ch.order : idx,
                updatedAt: new Date(),
            }));
        }

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

// @desc    Add a revision to a book chapter
// @route   POST /api/books/:id/revisions
// @access  Private
const addRevision = async (req, res) => {
    const { chapterId, chapterTitle, previousContent, newContent, operation } = req.body;

    try {
        const book = await Book.findById(req.params.id);

        if (!book) {
            return res.status(404).json({ message: "Book not found" });
        }

        if (book.author.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Not authorized" });
        }

        const revision = {
            chapterId,
            chapterTitle: chapterTitle || "Chapter",
            previousContent: previousContent || "",
            newContent: newContent || "",
            operation: operation || "AI Edit",
            timestamp: new Date(),
        };

        if (!book.revisions) {
            book.revisions = [];
        }

        // Keep last 50 revisions
        book.revisions.unshift(revision);
        if (book.revisions.length > 50) {
            book.revisions = book.revisions.slice(0, 50);
        }

        await book.save();
        res.status(201).json({ message: "Revision saved", revision, revisions: book.revisions });
    } catch (error) {
        console.error("Add revision error:", error);
        res.status(500).json({ message: "Server error saving revision", error: error.message });
    }
};

// @desc    Get revisions for a book
// @route   GET /api/books/:id/revisions
// @access  Private
const getRevisions = async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);

        if (!book) {
            return res.status(404).json({ message: "Book not found" });
        }

        if (book.author.toString() !== req.user._id.toString() && !book.isPublished) {
            return res.status(403).json({ message: "Not authorized" });
        }

        res.json(book.revisions || []);
    } catch (error) {
        console.error("Get revisions error:", error);
        res.status(500).json({ message: "Server error fetching revisions", error: error.message });
    }
};

// @desc    Get all public (published) books
// @route   GET /api/books/public
// @access  Private
const getPublicBooks = async (req, res) => {
    const { search, category, sort } = req.query;

    try {
        let query = { isPublished: true };

        if (search) {
            query.$or = [
                { title: { $regex: search, $options: "i" } },
                { description: { $regex: search, $options: "i" } },
            ];
        }

        if (category && category !== "All") {
            query.description = { $regex: `Category:\\s*${category}`, $options: "i" };
        }

        let booksQuery = Book.find(query).populate("author", "username");

        if (sort === "Most Reads") {
            booksQuery = booksQuery.sort({ reads: -1, createdAt: -1 });
        } else if (sort === "Highest Rated") {
            // sorted below in memory
        } else {
            // Newest (Default)
            booksQuery = booksQuery.sort({ createdAt: -1 });
        }

        let books = await booksQuery;

        if (sort === "Highest Rated") {
            books = books.sort((a, b) => {
                const getAvgRating = (bk) => {
                    if (!bk.reviews || bk.reviews.length === 0) return 0;
                    const sum = bk.reviews.reduce((acc, r) => acc + r.rating, 0);
                    return sum / bk.reviews.length;
                };
                return getAvgRating(b) - getAvgRating(a);
            });
        }

        res.json(books);
    } catch (error) {
        console.error("Get public books error:", error);
        res.status(500).json({ message: "Server error fetching public books", error: error.message });
    }
};

// @desc    Increment book read count
// @route   POST /api/books/:id/read
// @access  Private
const incrementReadCount = async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);

        if (!book) {
            return res.status(404).json({ message: "Book not found" });
        }

        book.reads = (book.reads || 0) + 1;
        await book.save();

        res.json({ message: "Read count incremented", reads: book.reads });
    } catch (error) {
        console.error("Increment read count error:", error);
        res.status(500).json({ message: "Server error incrementing read count", error: error.message });
    }
};

// @desc    Add rating and review to a book
// @route   POST /api/books/:id/reviews
// @access  Private
const addBookReview = async (req, res) => {
    const { rating, comment } = req.body;

    try {
        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ message: "Please provide a rating between 1 and 5 stars" });
        }

        const book = await Book.findById(req.params.id);

        if (!book) {
            return res.status(404).json({ message: "Book not found" });
        }

        const existingReviewIdx = book.reviews.findIndex(
            (r) => r.userId.toString() === req.user._id.toString()
        );

        const newReview = {
            userId: req.user._id,
            username: req.user.username,
            rating: Number(rating),
            comment: comment || "",
            createdAt: new Date(),
        };

        if (existingReviewIdx > -1) {
            book.reviews[existingReviewIdx] = newReview;
        } else {
            book.reviews.push(newReview);
        }

        await book.save();
        res.status(201).json({ message: "Review saved successfully", reviews: book.reviews });
    } catch (error) {
        console.error("Add book review error:", error);
        res.status(500).json({ message: "Server error saving review", error: error.message });
    }
};

module.exports = {
    createBook,
    getBooks,
    getBookById,
    updateBook,
    deleteBook,
    addRevision,
    getRevisions,
    getPublicBooks,
    incrementReadCount,
    addBookReview,
};
