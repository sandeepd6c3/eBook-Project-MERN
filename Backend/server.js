require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const path = require("path");
const port = process.env.PORT || 5000;
const connectDB = require("./config/db");

// Middlewares to handle cors
app.use(
    cors({
        origin: "*",
        methods: ["GET", "POST", "PUT", "DELETE"],
        allowedHeaders: ["Content-Type", "Authorization"],
    })
);

// Parse JSON bodies
app.use(express.json());

// static folder for uploads
app.use("/Backend/uploads", express.static(path.join(__dirname, "uploads")));

// Route imports
const authRoutes = require("./routes/authRoutes");
const bookRoutes = require("./routes/bookRoutes");
const aiRoutes = require("./routes/aiRoutes");

// Mount routes
app.use("/api/auth", authRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/ai", aiRoutes);

// Connect to the database, then start the server
connectDB()
    .then(() => {
        app.listen(port, () => {
            console.log(`Server is running on port ${port}`);
        });
    })
    .catch((err) => {
        console.error("Failed to start server due to DB error:", err);
        process.exit(1);
    });