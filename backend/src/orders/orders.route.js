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
                    name: product.name,
                    images: [product.image],
                },
                unit_amount: Math.round(product.price * 100),
            },
            quantity: product.quantity,
        }));

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: lineItems,
            mode: "payment",
            customer_email: req.user.email,
            metadata: {
                userId: req.user.id,
            },
            success_url: `${process.env.CLIENT_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.CLIENT_URL}/cancel`,
        });

        res.json({ id: session.id });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to create checkout session" });
    }
});


module.exports = router;