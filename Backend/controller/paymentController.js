const User = require("../models/user");

// Create Checkout Session
// POST /api/payment/create-checkout-session
exports.createCheckoutSession = async (req, res) => {
    const { tier, billingCycle } = req.body;
    const userId = req.user.id;

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Logic check: if Stripe Key is not set in environment, use simulation mode
        if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY === "placeholder") {
            return res.status(200).json({
                simulation: true,
                checkoutUrl: `/pricing?simulate=true&tier=${tier}&cycle=${billingCycle}`,
                message: "Stripe credentials not configured. Redirecting to Mock checkout..."
            });
        }

        // Real Stripe Session Creation
        const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

        // Check or create customer
        let stripeCustomerId = user.stripeCustomerId;
        if (!stripeCustomerId) {
            const customer = await stripe.customers.create({
                email: user.email,
                name: user.username,
                metadata: { userId: userId.toString() },
            });
            stripeCustomerId = customer.id;
            user.stripeCustomerId = stripeCustomerId;
            await user.save();
        }

        // Map Tier to price ids (define mock stripe test price IDs or dynamic values)
        // Since we are running in Stripe Test Mode, we define fallback price IDs
        let priceId = "";
        if (tier === "pro") {
            priceId = billingCycle === "yearly" ? "price_dummy_pro_yearly" : "price_dummy_pro_monthly";
        } else if (tier === "premium") {
            priceId = billingCycle === "yearly" ? "price_dummy_premium_yearly" : "price_dummy_premium_monthly";
        } else if (tier === "lifetime") {
            priceId = "price_dummy_lifetime"; // One-time payment
        }

        // In real Stripe sandbox, if the pricing isn't created on Dashboard, we can fallback to custom inline price details
        // to prevent session errors during local setup:
        const isLifetime = tier === "lifetime";
        const unitAmount = isLifetime ? 9900 : (tier === "pro" ? (billingCycle === "yearly" ? 8640 : 900) : (billingCycle === "yearly" ? 18240 : 1900));
        
        const lineItem = {
            price_data: {
                currency: "usd",
                product_data: {
                    name: `eBook Creator - ${tier.toUpperCase()} ${isLifetime ? "Lifetime" : (billingCycle === "yearly" ? "Yearly" : "Monthly")} Plan`,
                    description: `Unlock premium writing capabilities on the eBook Creator platform.`,
                },
                unit_amount: unitAmount,
                recurring: isLifetime ? undefined : {
                    interval: "month", // billed monthly or yearly equivalent
                    interval_count: billingCycle === "yearly" ? 12 : 1,
                },
            },
            quantity: 1,
        };

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: [lineItem],
            mode: isLifetime ? "payment" : "subscription",
            success_url: `${process.env.CLIENT_URL || "http://localhost:5173"}/dashboard?checkout_success=true&tier=${tier}`,
            cancel_url: `${process.env.CLIENT_URL || "http://localhost:5173"}/pricing`,
            customer: stripeCustomerId,
            metadata: {
                userId: userId.toString(),
                tier,
                billingCycle,
            },
        });

        res.status(200).json({ checkoutUrl: session.url });
    } catch (err) {
        console.error("Stripe Session Error:", err);
        res.status(500).json({ message: "Could not create Stripe session.", error: err.message });
    }
};

// Simulate Checkout (Simulated testing endpoint)
// POST /api/payment/simulate-checkout
exports.simulateCheckout = async (req, res) => {
    const { tier, billingCycle } = req.body;
    const userId = req.user.id;

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Update database properties immediately
        user.subscriptionTier = tier;
        user.subscriptionStatus = "active";
        user.billingCycle = billingCycle || "monthly";

        // Expiration dates
        const expires = new Date();
        if (tier === "lifetime") {
            user.subscriptionExpiresAt = null;
        } else if (billingCycle === "yearly") {
            expires.setFullYear(expires.getFullYear() + 1);
            user.subscriptionExpiresAt = expires;
        } else {
            expires.setMonth(expires.getMonth() + 1);
            user.subscriptionExpiresAt = expires;
        }

        await user.save();

        res.status(200).json({
            message: `Checkout simulated successfully. Upgraded to ${tier.toUpperCase()} tier!`,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                subscriptionTier: user.subscriptionTier,
                subscriptionStatus: user.subscriptionStatus,
                billingCycle: user.billingCycle,
                subscriptionExpiresAt: user.subscriptionExpiresAt,
            }
        });
    } catch (err) {
        console.error("Simulated Checkout Error:", err);
        res.status(500).json({ message: "Could not process simulation.", error: err.message });
    }
};

// Stripe Webhook Endpoint
// POST /api/payment/webhook
exports.handleWebhook = async (req, res) => {
    const sig = req.headers["stripe-signature"];
    let event;

    if (!process.env.STRIPE_SECRET_KEY) {
        return res.status(400).send("Webhook ignored: Stripe secret key not set.");
    }

    const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

    try {
        // req.rawBody must be populated in server.js
        event = stripe.webhooks.constructEvent(
            req.rawBody || req.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (err) {
        console.error("Webhook Signature Verification Failed:", err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    try {
        if (event.type === "checkout.session.completed") {
            const session = event.data.object;
            const metadata = session.metadata;

            if (metadata && metadata.userId) {
                const user = await User.findById(metadata.userId);
                if (user) {
                    user.subscriptionTier = metadata.tier;
                    user.subscriptionStatus = "active";
                    user.billingCycle = metadata.billingCycle || "monthly";
                    user.stripeSubscriptionId = session.subscription || "";
                    
                    const expires = new Date();
                    if (metadata.tier === "lifetime") {
                        user.subscriptionExpiresAt = null;
                    } else if (metadata.billingCycle === "yearly") {
                        expires.setFullYear(expires.getFullYear() + 1);
                        user.subscriptionExpiresAt = expires;
                    } else {
                        expires.setMonth(expires.getMonth() + 1);
                        user.subscriptionExpiresAt = expires;
                    }
                    await user.save();
                    console.log(`[Stripe Webhook] Upgraded user ${user.username} to ${metadata.tier.toUpperCase()}`);
                }
            }
        }

        if (event.type === "customer.subscription.deleted") {
            const subscription = event.data.object;
            const user = await User.findOne({ stripeSubscriptionId: subscription.id });
            if (user) {
                user.subscriptionTier = "free";
                user.subscriptionStatus = "canceled";
                user.stripeSubscriptionId = "";
                user.subscriptionExpiresAt = new Date();
                await user.save();
                console.log(`[Stripe Webhook] Downgraded user ${user.username} subscription expired/canceled.`);
            }
        }

        res.json({ received: true });
    } catch (err) {
        console.error("Webhook processing error:", err);
        res.status(500).send("Internal Webhook Error");
    }
};
