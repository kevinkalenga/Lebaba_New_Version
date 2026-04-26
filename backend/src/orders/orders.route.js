const express = require("express");
const Order = require("./orders.model");
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const router = express.Router();
const verifyToken = require("../middleware/verifyToken");
const verifyAdmin = require("../middleware/verifyAdmin");


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





router.get('/my-orders', verifyToken, async (req, res) => {
    try {
        const orders = await Order.find({ userId: req.user.userId });

        if (!orders || orders.length === 0) {
            return res.status(404).send({
                message: "No orders found"
            });
        }

        res.status(200).send({ orders });

    } catch (error) {
        console.error(error);
        res.status(500).send({
            message: "Failed to fetch orders"
        });
    }
});


// get order by id sécurisé
router.get("/order/:id", verifyToken, async (req, res) => {
     console.log("TOKEN USERID:", req.user.userId);
     console.log("PARAM ID:", req.params.id);
      const userId = req.user.userId;
    try {
        const order = await Order.findOne({ _id: req.params.id,  userId: userId });
        if (!order) return res.status(404).send({ message: "Order not found" });
        res.status(200).send(order);
    } catch (error) {
        console.error("Error fetching order", error);
        res.status(500).send({ message: "Failed to fetch order" });
    }
});

// Admin routes 

router.get("/", verifyToken, verifyAdmin, async (req, res) => {
    try {
        const orders = await Order.find().sort({ createdAt: -1 });

        if (!orders || orders.length === 0) {
            return res.status(404).send({
                message: "No orders found",
                orders: []
            });
        }

        res.status(200).send(orders);

    } catch (error) {
        console.error("Error fetching all orders", error);
        res.status(500).send({
            message: "Failed to fetch all orders"
        });
    }
});


router.patch("/update-order-status/:id", verifyToken, verifyAdmin, async (req, res) => {

    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
        return res.status(400).send({
            message: "Status is required"
        });
    }

    try {
        const updatedOrder = await Order.findByIdAndUpdate(
            id,
            {
                status,
                updatedAt: new Date()
            },
            {
                new: true,
                runValidators: true
            }
        );

        if (!updatedOrder) {
            return res.status(404).send({
                message: "Order not found"
            });
        }

        res.status(200).send({
            message: "Order status updated successfully",
            order: updatedOrder
        });

    } catch (error) {
        console.error("Error updating order status", error);
        res.status(500).send({
            message: "Failed to update order status"
        });
    }
});


router.delete("/delete-order/:id", verifyToken, verifyAdmin, async (req, res) => {

    const { id } = req.params;

    try {
        const deletedOrder = await Order.findByIdAndDelete(id);

        if (!deletedOrder) {
            return res.status(404).send({
                message: "Order not found"
            });
        }

        res.status(200).send({
            message: "Order deleted successfully",
            order: deletedOrder
        });

    } catch (error) {
        console.error("Error deleting order", error);
        res.status(500).send({
            message: "Failed to delete order"
        });
    }
});




module.exports = router;