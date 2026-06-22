const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/authMiddlewares");
const {
    createCheckoutSession,
    simulateCheckout,
    handleWebhook
} = require("../controller/paymentController");

// Webhook endpoint is public and processed by Stripe servers
router.post("/webhook", handleWebhook);

// Protected subscription endpoints
router.post("/create-checkout-session", protect, createCheckoutSession);
router.post("/simulate-checkout", protect, simulateCheckout);

module.exports = router;
