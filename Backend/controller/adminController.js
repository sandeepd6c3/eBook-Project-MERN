const Book = require("../models/book");
const User = require("../models/user");

// @desc    Get platform-wide statistics for the admin dashboard
// @route   GET /api/admin/stats
// @access  Private (Admin Only)
const getAdminStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalBooks = await Book.countDocuments();
        const publishedBooks = await Book.countDocuments({ isPublished: true });
        const draftBooks = totalBooks - publishedBooks;

        // Aggregate chapters count and total words across all books
        const books = await Book.find({}).select("chapters reviews reads createdAt");

        let totalChapters = 0;
        let totalWords = 0;
        let totalReads = 0;
        let totalReviews = 0;

        books.forEach((b) => {
            totalReads += b.reads || 0;
            totalReviews += (b.reviews || []).length;
            if (b.chapters && b.chapters.length > 0) {
                totalChapters += b.chapters.length;
                b.chapters.forEach((ch) => {
                    if (ch.wordCount) {
                        totalWords += ch.wordCount;
                    } else if (ch.body) {
                        const clean = ch.body.replace(/<[^>]*>/g, " ").trim();
                        totalWords += clean.split(/\s+/).filter(Boolean).length;
                    }
                });
            }
        });

        // Recent user signups (last 5)
        const recentUsers = await User.find({})
            .select("username email role createdAt subscriptionTier avatar")
            .sort({ createdAt: -1 })
            .limit(5);

        // Recent books created (last 5)
        const recentBooks = await Book.find({})
            .populate("author", "username email avatar")
            .select("title subtitle isPublished createdAt chapters")
            .sort({ createdAt: -1 })
            .limit(5);

        res.json({
            stats: {
                totalUsers,
                totalBooks,
                publishedBooks,
                draftBooks,
                totalChapters,
                totalWords,
                totalReads,
                totalReviews,
            },
            recentUsers,
            recentBooks,
        });
    } catch (error) {
        console.error("Admin stats error:", error);
        res.status(500).json({ message: "Server error fetching admin statistics", error: error.message });
    }
};

// @desc    Get all books created by all users across the platform
// @route   GET /api/admin/books
// @access  Private (Admin Only)
const getAllBooks = async (req, res) => {
    const { search, category, status, sort } = req.query;

    try {
        let query = {};

        // Filter by published status
        if (status === "published") {
            query.isPublished = true;
        } else if (status === "draft") {
            query.isPublished = false;
        }

        // Search in title or description
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: "i" } },
                { description: { $regex: search, $options: "i" } },
            ];
        }

        // Category filter if in description
        if (category && category !== "all" && category !== "All") {
            query.description = { $regex: `Category:\\s*${category}`, $options: "i" };
        }

        let booksQuery = Book.find(query)
            .populate("author", "username email avatar role")
            .sort({ createdAt: -1 });

        if (sort === "oldest") {
            booksQuery = Book.find(query).populate("author", "username email avatar role").sort({ createdAt: 1 });
        } else if (sort === "reads") {
            booksQuery = Book.find(query).populate("author", "username email avatar role").sort({ reads: -1, createdAt: -1 });
        } else if (sort === "title") {
            booksQuery = Book.find(query).populate("author", "username email avatar role").sort({ title: 1 });
        }

        const books = await booksQuery;

        // Enhance book items with calculated word counts and chapter totals
        const enhancedBooks = books.map((b) => {
            const chapters = b.chapters || [];
            let words = 0;
            chapters.forEach((ch) => {
                if (ch.wordCount) {
                    words += ch.wordCount;
                } else if (ch.body) {
                    const clean = ch.body.replace(/<[^>]*>/g, " ").trim();
                    words += clean.split(/\s+/).filter(Boolean).length;
                }
            });

            return {
                _id: b._id,
                title: b.title,
                subtitle: b.subtitle || "",
                description: b.description || "",
                coverImage: b.coverImage || "",
                isPublished: b.isPublished,
                reads: b.reads || 0,
                chapterCount: chapters.length,
                wordCount: words,
                author: b.author || { username: "Unknown Author", email: "N/A" },
                settings: b.settings || {},
                createdAt: b.createdAt,
                updatedAt: b.updatedAt,
            };
        });

        res.json(enhancedBooks);
    } catch (error) {
        console.error("Admin get all books error:", error);
        res.status(500).json({ message: "Server error fetching platform books", error: error.message });
    }
};

// @desc    Get complete book details (for admin preview and inspection)
// @route   GET /api/admin/books/:id
// @access  Private (Admin Only)
const getAdminBookById = async (req, res) => {
    try {
        const book = await Book.findById(req.params.id)
            .populate("author", "username email avatar bio location role createdAt");

        if (!book) {
            return res.status(404).json({ message: "Book not found" });
        }

        res.json(book);
    } catch (error) {
        console.error("Admin get book by ID error:", error);
        res.status(500).json({ message: "Server error fetching book details", error: error.message });
    }
};

// @desc    Delete any book as admin
// @route   DELETE /api/admin/books/:id
// @access  Private (Admin Only)
const deleteAdminBook = async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);

        if (!book) {
            return res.status(404).json({ message: "Book not found" });
        }

        await Book.findByIdAndDelete(req.params.id);
        res.json({ message: "Book removed successfully by administrator" });
    } catch (error) {
        console.error("Admin delete book error:", error);
        res.status(500).json({ message: "Server error deleting book", error: error.message });
    }
};

// @desc    Get all registered users with their book statistics (excluding sensitive tokens/passwords)
// @route   GET /api/admin/users
// @access  Private (Admin Only)
const getAllUsers = async (req, res) => {
    const { search } = req.query;

    try {
        let query = {};
        if (search) {
            query.$or = [
                { username: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } },
            ];
        }

        // Exclude passwords and payment tokens
        const users = await User.find(query)
            .select("-password -stripeCustomerId -stripeSubscriptionId")
            .sort({ createdAt: -1 });

        // Aggregate each user's book count and total words
        const allBooks = await Book.find({}).select("author chapters isPublished");

        const userBookStats = {};
        allBooks.forEach((b) => {
            if (!b.author) return;
            const authorId = b.author.toString();
            if (!userBookStats[authorId]) {
                userBookStats[authorId] = {
                    totalBooks: 0,
                    publishedBooks: 0,
                    totalWords: 0,
                };
            }
            userBookStats[authorId].totalBooks += 1;
            if (b.isPublished) userBookStats[authorId].publishedBooks += 1;

            (b.chapters || []).forEach((ch) => {
                if (ch.wordCount) {
                    userBookStats[authorId].totalWords += ch.wordCount;
                } else if (ch.body) {
                    const clean = ch.body.replace(/<[^>]*>/g, " ").trim();
                    userBookStats[authorId].totalWords += clean.split(/\s+/).filter(Boolean).length;
                }
            });
        });

        const enhancedUsers = users.map((u) => {
            const stats = userBookStats[u._id.toString()] || {
                totalBooks: 0,
                publishedBooks: 0,
                totalWords: 0,
            };

            return {
                _id: u._id,
                username: u.username,
                email: u.email,
                role: u.role || "creator",
                bio: u.bio || "",
                location: u.location || "",
                avatar: u.avatar || "",
                subscriptionTier: u.subscriptionTier || "free",
                aiGenerationsUsed: u.aiGenerationsUsed || 0,
                booksCount: stats.totalBooks,
                publishedBooksCount: stats.publishedBooks,
                totalWordsWritten: stats.totalWords,
                createdAt: u.createdAt,
            };
        });

        res.json(enhancedUsers);
    } catch (error) {
        console.error("Admin get all users error:", error);
        res.status(500).json({ message: "Server error fetching users", error: error.message });
    }
};

// @desc    Update a user's role (promote/demote admin)
// @route   PUT /api/admin/users/:id/role
// @access  Private (Admin Only)
const updateUserRole = async (req, res) => {
    const { role } = req.body;

    try {
        if (!["admin", "creator", "user"].includes(role)) {
            return res.status(400).json({ message: "Invalid role specified" });
        }

        const user = await User.findById(req.params.id).select("-password");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Prevent self-demotion from admin to avoid locking out the last admin
        if (user._id.toString() === req.user._id.toString() && role !== "admin") {
            return res.status(400).json({ message: "You cannot revoke your own admin permissions" });
        }

        user.role = role;
        await user.save();

        res.json({ message: `User role updated to ${role}`, user });
    } catch (error) {
        console.error("Admin update role error:", error);
        res.status(500).json({ message: "Server error updating user role", error: error.message });
    }
};

// @desc    Delete a user and their associated books
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin Only)
const deleteAdminUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Prevent self deletion
        if (user._id.toString() === req.user._id.toString()) {
            return res.status(400).json({ message: "You cannot delete your own admin account" });
        }

        // Delete user's books
        await Book.deleteMany({ author: user._id });

        // Delete user
        await User.findByIdAndDelete(req.params.id);

        res.json({ message: "User account and all associated books deleted successfully" });
    } catch (error) {
        console.error("Admin delete user error:", error);
        res.status(500).json({ message: "Server error deleting user", error: error.message });
    }
};

module.exports = {
    getAdminStats,
    getAllBooks,
    getAdminBookById,
    deleteAdminBook,
    getAllUsers,
    updateUserRole,
    deleteAdminUser,
};
