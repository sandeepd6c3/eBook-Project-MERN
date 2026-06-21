const mongoose = require("mongoose");

const connectDB = async () => {
    const atlasUri = process.env.MONGO_URI;
    const localUri = "mongodb://127.0.0.1:27017/ebook-creator";

    try {
        console.log("Connecting to MongoDB Atlas...");
        await mongoose.connect(atlasUri);
        console.log("MongoDB connected successfully to Atlas");
    } catch (error) {
        console.error("Error connecting to MongoDB Atlas:", error.message);
        console.warn("⚠️ Attempting fallback to local MongoDB instance (mongodb://127.0.0.1:27017/ebook-creator)...");
        try {
            await mongoose.connect(localUri);
            console.log("MongoDB connected successfully to local instance!");
        } catch (localError) {
            console.error("❌ Both MongoDB Atlas and local MongoDB connection attempts failed.");
            console.error("Please ensure either your IP is whitelisted in Atlas or a local MongoDB server is running.");
            process.exit(1);
        }
    }
};

module.exports = connectDB;