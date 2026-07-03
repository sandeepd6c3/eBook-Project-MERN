const Book = require("../models/book");

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const stripHtml = (html) => html.replace(/<[^>]*>/g, "");

const countWords = (text) => {
    const stripped = stripHtml(text).trim();
    return stripped.length === 0 ? 0 : stripped.split(/\s+/).length;
};

// @desc    Get writer analytics dashboard data
// @route   GET /api/analytics
// @access  Private
const getWriterAnalytics = async (req, res) => {
    try {
        const books = await Book.find({ author: req.user._id });

        const totalBooks = books.length;
        const publishedBooks = books.filter((b) => b.isPublished).length;
        const draftBooks = totalBooks - publishedBooks;

        let totalWords = 0;
        let totalChapters = 0;
        let totalReads = 0;
        let longestBook = { title: "", wordCount: 0 };
        const categoryDistribution = {};
        const dayUpdateCounts = {};

        for (const book of books) {
            let bookWordCount = 0;
            totalChapters += book.chapters.length;
            totalReads += book.reads || 0;

            for (const chapter of book.chapters) {
                bookWordCount += countWords(chapter.body || "");
            }

            totalWords += bookWordCount;

            if (bookWordCount > longestBook.wordCount) {
                longestBook = { title: book.title, wordCount: bookWordCount };
            }

            const firstLine = (book.description || "").split("\n")[0];
            const categoryMatch = firstLine.match(/^Category:\s*(.+)/i);
            const category = categoryMatch ? categoryMatch[1].trim() : "Uncategorized";
            categoryDistribution[category] = (categoryDistribution[category] || 0) + 1;

            const dayName = DAY_NAMES[new Date(book.updatedAt).getDay()];
            dayUpdateCounts[dayName] = (dayUpdateCounts[dayName] || 0) + 1;
        }

        const avgWordsPerChapter = totalChapters > 0 ? Math.round(totalWords / totalChapters) : 0;

        let mostActiveDay = "N/A";
        let maxDayCount = 0;
        for (const [day, count] of Object.entries(dayUpdateCounts)) {
            if (count > maxDayCount) {
                maxDayCount = count;
                mostActiveDay = day;
            }
        }

        const aiGenerationsUsed = req.user.aiGenerationsUsed || 0;
        const aiGenerationLimit = req.user.subscriptionTier === "free" ? 5 : -1;
        const subscriptionTier = req.user.subscriptionTier;

        const now = new Date();
        const heatmapStart = new Date(now);
        heatmapStart.setDate(heatmapStart.getDate() - 181);
        heatmapStart.setHours(0, 0, 0, 0);

        const updatesByDate = {};
        for (const book of books) {
            const dateStr = new Date(book.updatedAt).toISOString().split("T")[0];
            updatesByDate[dateStr] = (updatesByDate[dateStr] || 0) + 1;
        }

        const heatmapData = [];
        for (let i = 0; i < 182; i++) {
            const d = new Date(heatmapStart);
            d.setDate(d.getDate() + i);
            const dateStr = d.toISOString().split("T")[0];
            heatmapData.push({ date: dateStr, count: updatesByDate[dateStr] || 0 });
        }

        const events = [];
        for (const book of books) {
            events.push({
                type: "created",
                bookTitle: book.title,
                date: book.createdAt.toISOString(),
            });

            if (book.updatedAt.getTime() !== book.createdAt.getTime()) {
                events.push({
                    type: "updated",
                    bookTitle: book.title,
                    date: book.updatedAt.toISOString(),
                });
            }
        }

        events.sort((a, b) => new Date(b.date) - new Date(a.date));
        const recentActivity = events.slice(0, 15);

        res.json({
            totalBooks,
            publishedBooks,
            draftBooks,
            totalWords,
            totalChapters,
            avgWordsPerChapter,
            categoryDistribution,
            longestBook,
            mostActiveDay,
            totalReads,
            aiGenerationsUsed,
            aiGenerationLimit,
            subscriptionTier,
            heatmapData,
            recentActivity,
        });
    } catch (error) {
        console.error("Analytics error:", error);
        res.status(500).json({ message: "Server error fetching analytics", error: error.message });
    }
};

module.exports = { getWriterAnalytics };
