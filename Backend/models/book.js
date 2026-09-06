const mongoose = require("mongoose");

const revisionSchema = new mongoose.Schema({
    chapterId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
    chapterTitle: {
        type: String,
        default: "",
    },
    previousContent: {
        type: String,
        default: "",
    },
    newContent: {
        type: String,
        default: "",
    },
    operation: {
        type: String,
        default: "AI Edit", // e.g. "AI Edit", "Manual Edit", "AI Rewrite", "AI Expand"
    },
    timestamp: {
        type: Date,
        default: Date.now,
    },
});

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
    status: {
        type: String,
        enum: ["Draft", "Generated", "Edited"],
        default: "Draft",
    },
    wordCount: {
        type: Number,
        default: 0,
    },
    order: {
        type: Number,
        default: 0,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
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
        subtitle: {
            type: String,
            default: "",
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
        revisions: [revisionSchema],
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
        settings: {
            type: mongoose.Schema.Types.Mixed,
            default: {},
        },
        exportConfig: {
            pageSize: { type: String, default: "letter" },
            marginStyle: { type: String, default: "normal" },
            customMargins: {
                top: { type: Number, default: 1 },
                bottom: { type: Number, default: 1 },
                left: { type: Number, default: 1 },
                right: { type: Number, default: 1 }
            },
            fontFamily: { type: String, default: "Lora" },
            fontSize: { type: Number, default: 16 },
            lineHeight: { type: Number, default: 1.6 },
            textAlignment: { type: String, default: "justify" },
            includeCover: { type: Boolean, default: true },
            includeTOC: { type: Boolean, default: true },
            chapterPageBreaks: { type: Boolean, default: true },
            headerStyle: { type: String, default: "title-chapter" },
            footerStyle: { type: String, default: "page-center" }
        }
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Book", bookSchema);
