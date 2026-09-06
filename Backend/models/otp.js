const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema(
    {
        identifier: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
            index: true,
        },
        type: {
            type: String,
            enum: ['email', 'mobile'],
            required: true,
        },
        otp: {
            type: String,
            required: true,
        },
        expiresAt: {
            type: Date,
            required: true,
            index: { expires: 0 },
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('OTP', otpSchema);
