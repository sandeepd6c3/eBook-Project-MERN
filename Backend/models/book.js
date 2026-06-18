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
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Book", bookSchema);
