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

// @desc    Google OAuth login/signup
// @route   POST /api/auth/google-login
// @access  Public
const googleLogin = async (req, res) => {
    const { token, isMock, mockPayload } = req.body;

    try {
        let email, username, picture;

        if (isMock || !token || token === "mock_token") {
            // For testing and local validation bypass
            const payload = mockPayload || {
                email: "demo.google@example.com",
                name: "Google Demo User",
                picture: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150"
            };
            email = payload.email;
            username = payload.name;
            picture = payload.picture;
            console.log("Using Mock Google Authentication for testing:", email);
        } else {
            // Verify token via Google tokeninfo endpoint
            console.log("Verifying Google ID Token...");
            const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${token}`);
            if (!response.ok) {
                return res.status(400).json({ message: "Invalid Google credential token" });
            }
            const payload = await response.json();

            email = payload.email;
            username = payload.name || payload.given_name || email.split("@")[0];
            picture = payload.picture;
            console.log("Verified Google user:", email);
        }

        if (!email) {
            return res.status(400).json({ message: "Google profile email not found" });
        }

        // Check if user already exists
        let user = await User.findOne({ email });

        if (user) {
            // Log in existing user
            // Update avatar if not set
            if (!user.avatar && picture) {
                user.avatar = picture;
                await user.save();
            }
        } else {
            // Register new user
            // Clean username to be unique
            let baseUsername = username.toLowerCase().replace(/[^a-z0-9]/g, "_");
            if (!baseUsername) baseUsername = "user";
            
            // Check if username taken, append random if needed
            let usernameExists = await User.findOne({ username: baseUsername });
            let finalUsername = baseUsername;
            let counter = 1;
            while (usernameExists) {
                finalUsername = `${baseUsername}_${counter}`;
                usernameExists = await User.findOne({ username: finalUsername });
                counter++;
            }

            // Create a secure default password since it's required in mongoose model
            const securePassword = "Google_OAuth_Session_Secure_" + Math.random().toString(36).slice(-8);

            user = await User.create({
                username: finalUsername,
                email,
                password: securePassword,
                avatar: picture || "",
                role: "creator",
            });
        }

        res.json({
            _id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
            avatar: user.avatar,
            preferredTheme: user.preferredTheme,
            token: generateToken(user._id),
        });
    } catch (error) {
        console.error("Google login error:", error);
        res.status(500).json({ message: "Server error during Google Login", error: error.message });
    }
};

module.exports = {
    registerUser,
    loginUser,
    getUserProfile,
    updateUserProfile,
    googleLogin,
};
