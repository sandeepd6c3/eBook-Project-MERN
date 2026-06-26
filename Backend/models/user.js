const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: [true, "Please add a username"],
            unique: true,
            trim: true,
        },
        email: {
            type: String,
            required: [true, "Please add an email"],
            unique: true,
            match: [
                /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
                "Please add a valid email",
            ],
            lowercase: true,
            trim: true,
        },
        password: {
            type: String,
            required: [true, "Please add a password"],
            minlength: 6,
        },
        role: {
            type: String,
            enum: ["creator", "admin"],
            default: "creator",
        },
        bio: {
            type: String,
            default: "AI & Data Science Student. Passionate about AI, Writing and Technology.",
        },
        location: {
            type: String,
            default: "Jaipur, India",
        },
        streak: {
            type: Number,
            default: 12,
        },
        avatar: {
            type: String,
            default: "",
        },
        preferredTheme: {
            type: String,
            default: "light",
        },
        subscriptionTier: {
            type: String,
            enum: ["free", "pro", "premium", "lifetime"],
            default: "free",
        },
        stripeCustomerId: {
            type: String,
            default: "",
        },
        stripeSubscriptionId: {
            type: String,
            default: "",
        },
        subscriptionStatus: {
            type: String,
            default: "",
        },
        billingCycle: {
            type: String,
            default: "",
        },
        subscriptionExpiresAt: {
            type: Date,
            default: null,
        },
        aiGenerationsUsed: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

// Encrypt password using bcrypt before saving
userSchema.pre("save", async function () {
    if (!this.isModified("password")) {
        return;
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
