const express = require("express");
const Order = require("./orders.model");
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const router = express.Router();
const verifyToken = require("../middleware/verifyToken");
const verifyAdmin = require("../middleware/verifyAdmin");
const {
  createPaypalOrder,
  capturePaypalOrder,
 verifyPaypalPayment
  
} = require("../../utils/paypal.js");
const Product = require("../products/products.model.js");


const YOUR_DOMAIN = 'http://localhost:4242';




// create checkout session - route sécurisée
// router.post("/create-checkout-session", verifyToken, async (req, res) => {
//     const { products } = req.body;

//     if (!products || !Array.isArray(products) || products.length === 0) {
//         return res.status(400).json({ error: "Invalid products" });
//     }

//     try {
//         const lineItems = products.map((product) => ({
//                 price_data: {
//                     currency: "usd",
//                     product_data: {
//                     name: product.name || "Unknown product",
//                     images: product.image ? [product.image] : [],
//                     },
//                     unit_amount: Math.round((product.price || 0) * 100),
//                 },
//                 quantity: product.quantity || 1,
//         }));

//         const session = await stripe.checkout.sessions.create({
//             payment_method_types: ["card"],
//             line_items: lineItems,
//             mode: "payment",
//             customer_email: req.user.email,
//             metadata: {
//                 userId: req.user.userId,
//             },
//             success_url: `${process.env.CLIENT_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
//             cancel_url: `${process.env.CLIENT_URL}/cancel`,
//         });

//         res.json({ url: session.url });

//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ error: "Failed to create checkout session" });
//     }
// });

 router.post("/create-checkout-session", verifyToken, async (req, res) => {
    try {
        const { products } = req.body;

        if (!products || !Array.isArray(products) || products.length === 0) {
            return res.status(400).json({ error: "Invalid products" });
        }

        // 🔥 Get products from DB (security)
        const itemsFromDB = await Product.find({
            _id: { $in: products.map(p => p._id) }
        });

        if (!itemsFromDB.length) {
            return res.status(404).json({ error: "Products not found in DB" });
        }

        // 💰 Calculate total safely
        const totalPrice = itemsFromDB.reduce((sum, product) => {
            const cartItem = products.find(
                p => p._id === product._id.toString()
            );

            return sum + product.price * (cartItem?.quantity || 1);
        }, 0);

        // 🧾 Create local order
        const newOrder = new Order({
            userId: req.user.userId,
            email: req.user.email,
            products: products.map(item => ({
                productId: item._id,
                quantity: item.quantity
            })),
            amount: totalPrice,
            status: "pending",
            paymentMethod: "stripe",
            isPaid: false
        });

        const savedOrder = await newOrder.save();

        // 💳 Stripe line items
        const lineItems = itemsFromDB.map(product => {
            const cartItem = products.find(
                p => p._id === product._id.toString()
            );

            return {
                price_data: {
                    currency: "usd",
                    product_data: {
                        name: product.name,
                        images: product.image ? [product.image] : []
                    },
                    unit_amount: Math.round(product.price * 100)
                },
                quantity: cartItem?.quantity || 1
            };
        });

        // 🚀 Stripe session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: lineItems,
            mode: "payment",
            customer_email: req.user.email,

            metadata: {
                userId: req.user.userId,
                orderId: savedOrder._id.toString()
            },

            success_url: `${process.env.CLIENT_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.CLIENT_URL}/cancel`
        });

        return res.json({ url: session.url });

    } catch (error) {
        console.error("Stripe error:", error);
        return res.status(500).json({
            error: "Failed to create checkout session"
        });
    }
});


router.post("/confirm-payment", verifyToken, async (req, res) => {
    try {
        const { session_id } = req.body;

        if (!session_id) {
            return res.status(400).json({ error: "Missing session_id" });
        }

        const session = await stripe.checkout.sessions.retrieve(session_id);

        const orderId = session.metadata?.orderId;

        if (!orderId) {
            return res.status(400).json({ error: "Missing orderId in metadata" });
        }

        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({ error: "Order not found" });
        }

        if (order.userId.toString() !== req.user.userId.toString()) {
            return res.status(403).json({ error: "Unauthorized" });
        }

        if (order.isPaid) {
            return res.json({ order });
        }

        const isPaid = session.payment_status === "paid";

        order.isPaid = isPaid;
        order.status = "pending";
        order.paidAt = isPaid ? new Date() : null;

        const updatedOrder = await order.save();

        return res.json({
            success: true,
            order: updatedOrder
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            error: error.message
        });
    }
});



router.get("/my-orders", verifyToken, async (req, res) => {
    try {
        const orders = await Order.find({
            userId: req.user.userId
        })
        .sort({ createdAt: -1 });

        return res.status(200).json({
            orders
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
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


// Paypal 
router.post("/paypal/create-order", verifyToken, async (req, res) => {
  try {
    const { products } = req.body;

    if (!products || !Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ message: "No products" });
    }

    // FIX: support productId OU _id
    const productIds = products.map(p => p.productId || p._id);

    const itemsFromDB = await Product.find({
      _id: { $in: productIds }
    });

    if (!itemsFromDB.length) {
      return res.status(404).json({ message: "Products not found" });
    }

    const totalPrice = itemsFromDB.reduce((sum, product) => {
      const item = products.find(
        p => (p.productId || p._id) === product._id.toString()
      );

      return sum + product.price * (item?.quantity || 1);
    }, 0);

    const order = await Order.create({
      userId: req.user.userId,
      email: req.user.email,
      products: products.map(p => ({
        productId: p.productId || p._id,
        quantity: p.quantity
      })),
      amount: totalPrice,
      status: "pending",
      paymentMethod: "paypal",
      isPaid: false
    });

    const paypalOrder = await createPaypalOrder(totalPrice);

    return res.status(201).json({
      orderId: order._id,
      paypalId: paypalOrder.id,
      approveUrl: paypalOrder.links?.find(l => l.rel === "approve")?.href
    });

  } catch (error) {
    console.error("PAYPAL ERROR:", error); 
    return res.status(500).json({
      error: error.message || "PayPal create failed"
    });
  }
});

router.post("/paypal/capture", verifyToken, async (req, res) => {
    try {
        const { orderId, paypalId } = req.body;

        const order = await Order.findById(orderId);
        if (!order) return res.status(404).json({ message: "Order not found" });

        const capture = await capturePaypalOrder(paypalId);

        if (capture.status !== "COMPLETED") {
            return res.status(400).json({ message: "Payment not completed" });
        }

        order.isPaid = true;
        order.status = "processing";
        order.paidAt = new Date();

        order.paymentResult = {
            id: capture.id,
            email: capture.payer?.email_address,
            status: capture.status
        };

        await order.save();

        res.json(order);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "PayPal capture failed" });
    }
});




module.exports = router;