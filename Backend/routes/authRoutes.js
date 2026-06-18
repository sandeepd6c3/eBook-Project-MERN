const express = require("express");
const router = express.Router();
const {
    registerUser,
    loginUser,
    getUserProfile,
} = require("../controller/authController");
const { protect } = require("../middlewares/authMiddlewares");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/profile", protect, getUserProfile);

module.exports = router;
