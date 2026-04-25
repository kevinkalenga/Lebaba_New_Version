const express = require("express");
const User = require("../users/user.model");
const Order = require("../orders/orders.model");
const Reviews = require("../reviews/reviews.model");
const Products = require("../products/products.model");

const router = express.Router();


// ========================
// USER STATS
// ========================
router.get("/user-stats/:email", async (req, res) => {
    const { email } = req.params;

    if (!email) {
        return res.status(400).send({ message: "Email is required" });
    }

    try {
        const user = await User.findOne({ email });
        // console.log(user)
        if (!user) {
            return res.status(404).send({ message: "User not found" });
        }

        // total payments
        const totalPaymentsResult = await Order.aggregate([
            {
                $match: {
                    email: { $exists: true, $eq: email },
                },
            },
            {
                $group: {
                    _id: null,
                    totalAmount: { $sum: "$amount" },
                },
            },
        ]);

        const totalPaymentsAmount =
            totalPaymentsResult.length > 0
                ? totalPaymentsResult[0].totalAmount
                : 0;

        // total reviews
        const totalReviews = await Reviews.countDocuments({
            userId: user._id,
        });

        // purchased products
        const purchasedProductIds = await Order.distinct(
            "products.productId",
            {
                email: email,
                status: { $ne: "failed" },
            }
        );

        const totalPurchasedProducts = purchasedProductIds.length;

        res.status(200).send({
            totalPayments: totalPaymentsAmount
                ? totalPaymentsAmount.toFixed(2)
                : "0.00",
            totalReviews,
            totalPurchasedProducts,
        });
    } catch (error) {
        console.error("Error fetching user stats", error);
        res.status(500).send({ message: "Failed to fetch user stats" });
    }
});


// ========================
// ADMIN STATS
// ========================
router.get("/admin-stats", async (req, res) => {
    try {
        const totalOrders = await Order.countDocuments();

        const totalProducts = await Products.countDocuments();

        const totalReviews = await Reviews.countDocuments();

        const totalUsers = await User.countDocuments();
      

        // total earnings (ignore failed orders)
        const totalEarningsResult = await Order.aggregate([
            {
                $match: {
                    status: { $ne: "failed" },
                },
            },
            {
                $group: {
                    _id: null,
                    totalEarnings: { $sum: "$amount" },
                },
            },
        ]);

        const totalEarnings =
            totalEarningsResult.length > 0
                ? totalEarningsResult[0].totalEarnings
                : 0;

        // monthly earnings
        const monthlyEarningsResult = await Order.aggregate([
            {
                $match: {
                    status: { $ne: "failed" },
                },
            },
            {
                $group: {
                    _id: {
                        month: { $month: "$createdAt" },
                        year: { $year: "$createdAt" },
                    },
                    monthlyEarnings: { $sum: "$amount" },
                },
            },
            {
                $sort: {
                    "_id.year": 1,
                    "_id.month": 1,
                },
            },
        ]);

        const monthlyEarnings = monthlyEarningsResult.map((entry) => ({
            month: entry._id.month,
            year: entry._id.year,
            earnings: entry.monthlyEarnings,
        }));

        res.status(200).json({
            totalOrders,
            totalProducts,
            totalReviews,
            totalUsers,
            totalEarnings,
            monthlyEarnings,
        });
    } catch (error) {
        console.error("Error fetching admin stats:", error);
        res.status(500).json({
            message: "Failed to fetch admin stats",
        });
    }
});

module.exports = router;