const mongoose = require("mongoose");

const chapterSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, "Chapter title is required"],
        trim: true,
    },
    body: {
        type: String,
        default: "",
    },
});

const reviewSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    username: {
        type: String,
        required: true,
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
    },
    comment: {
        type: String,
        default: "",
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const bookSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, "Book title is required"],
            trim: true,
        },
        description: {
            type: String,
            default: "",
        },
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Author reference is required"],
        },
        chapters: [chapterSchema],
        coverImage: {
            type: String,
            default: "",
        },
        isPublished: {
            type: Boolean,
            default: false,
        },
        reads: {
            type: Number,
            default: 0,
        },
        reviews: [reviewSchema],
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Book", bookSchema);
