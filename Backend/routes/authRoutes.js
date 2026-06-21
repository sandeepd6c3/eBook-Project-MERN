const express = require("express");
const router = express.Router();
const {
    registerUser,
    loginUser,
    getUserProfile,
    updateUserProfile,
    googleLogin,
} = require("../controller/authController");
const { protect } = require("../middlewares/authMiddlewares");
const upload = require("../middlewares/uploadMiddlewares");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/google-login", googleLogin);
router.get("/profile", protect, getUserProfile);
router.put("/profile", protect, updateUserProfile);

// Route to handle avatar uploading
router.post("/upload-avatar", protect, upload.single("avatar"), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }
        const fileUrl = `http://localhost:5000/Backend/uploads/${req.file.filename}`;
        res.json({
            message: "File uploaded successfully",
            url: fileUrl,
        });
    } catch (error) {
        console.error("Upload error:", error);
        res.status(500).json({ message: "Server error during file upload", error: error.message });
    }
});

module.exports = router;
