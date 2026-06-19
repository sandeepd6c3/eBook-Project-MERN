const jwt = require("jsonwebtoken");
const User = require("../models/user");

// Generate JWT token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || "default_jwt_secret", {
        expiresIn: "30d",
    });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
    const { username, email, password, role } = req.body;

    try {
        if (!username || !email || !password) {
            return res.status(400).json({ message: "Please enter all fields" });
        }

        // Check if user already exists
        const userExists = await User.findOne({ $or: [{ email }, { username }] });
        if (userExists) {
            return res.status(400).json({ message: "User already exists with this email or username" });
        }

        // Create new user
        const user = await User.create({
            username,
            email,
            password,
            role: role || "creator",
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                token: generateToken(user._id),
            });
        } else {
            res.status(400).json({ message: "Invalid user data" });
        }
    } catch (error) {
        console.error("Register user error:", error);
        res.status(500).json({ message: "Server error during registration", error: error.message });
    }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        if (!email || !password) {
            return res.status(400).json({ message: "Please enter email and password" });
        }

        // Find user by email
        const user = await User.findOne({ email });

        if (user && (await user.matchPassword(password))) {
            res.json({
                _id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                token: generateToken(user._id),
            });
        } else {
            res.status(401).json({ message: "Invalid email or password" });
        }
    } catch (error) {
        console.error("Login user error:", error);
        res.status(500).json({ message: "Server error during login", error: error.message });
    }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            res.json({
                _id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                bio: user.bio,
                location: user.location,
                streak: user.streak,
                avatar: user.avatar,
                preferredTheme: user.preferredTheme,
                createdAt: user.createdAt,
            });
        } else {
            res.status(404).json({ message: "User not found" });
        }
    } catch (error) {
        console.error("Get user profile error:", error);
        res.status(500).json({ message: "Server error fetching profile" });
    }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            user.username = req.body.username || user.username;
            user.bio = req.body.bio !== undefined ? req.body.bio : user.bio;
            user.location = req.body.location !== undefined ? req.body.location : user.location;
            user.avatar = req.body.avatar !== undefined ? req.body.avatar : user.avatar;
            user.preferredTheme = req.body.preferredTheme !== undefined ? req.body.preferredTheme : user.preferredTheme;
            if (req.body.streak !== undefined) {
                user.streak = Number(req.body.streak);
            }

            const updatedUser = await user.save();

            res.json({
                _id: updatedUser._id,
                username: updatedUser.username,
                email: updatedUser.email,
                role: updatedUser.role,
                bio: updatedUser.bio,
                location: updatedUser.location,
                streak: updatedUser.streak,
                avatar: updatedUser.avatar,
                preferredTheme: updatedUser.preferredTheme,
                createdAt: updatedUser.createdAt,
            });
        } else {
            res.status(404).json({ message: "User not found" });
        }
    } catch (error) {
        console.error("Update user profile error:", error);
        res.status(500).json({ message: "Server error updating profile", error: error.message });
    }
};

module.exports = {
    registerUser,
    loginUser,
    getUserProfile,
    updateUserProfile,
};
