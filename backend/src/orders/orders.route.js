const express = require("express");
const Order = require("./orders.model");
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const router = express.Router();
const verifyToken = require("../middleware/verifyToken");


const YOUR_DOMAIN = 'http://localhost:4242';




// create checkout session - route sécurisée
router.post("/create-checkout-session", verifyToken, async (req, res) => {
    const { products } = req.body;

    if (!products || !Array.isArray(products) || products.length === 0) {
        return res.status(400).json({ error: "Invalid products" });
    }

    try {
        const lineItems = products.map((product) => ({
                price_data: {
                    currency: "usd",
                    product_data: {
                    name: product.name || "Unknown product",
                    images: product.image ? [product.image] : [],
                    },
                    unit_amount: Math.round((product.price || 0) * 100),
                },
                quantity: product.quantity || 1,
        }));

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: lineItems,
            mode: "payment",
            customer_email: req.user.email,
            metadata: {
                userId: req.user.userId,
            },
            success_url: `${process.env.CLIENT_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.CLIENT_URL}/cancel`,
        });

        res.json({ url: session.url });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to create checkout session" });
    }
});

// Confirm Payment 

router.post("/confirm-payment", verifyToken, async (req, res) => {
    const { session_id } = req.body;
    const userId = req.user.userId;

    try {
        const session = await stripe.checkout.sessions.retrieve(session_id, {
            expand: ["line_items", "payment_intent"],
        });

        if (session.metadata.userId !== userId.toString()) {
            return res.status(403).json({ error: "Unauthorized session" });
        }

        const paymentIntentId = session.payment_intent.id;
        const isPaid = session.payment_status === "paid";

        let order = await Order.findOne({ orderId: paymentIntentId, userId });

        if (!order) {
            order = new Order({
                orderId: paymentIntentId,
                amount: session.amount_total / 100,
                email: session.customer_details.email,
                userId,
                status: isPaid ? "pending" : "failed",
            });
        } else {
            order.status = isPaid ? "pending" : "failed";
        }

        await order.save();

        res.json({ order });

    } catch (error) {
          console.error(error);
          res.status(500).json({
             error: error.message
          });
    }
});


module.exports = router;