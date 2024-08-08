const express = require("express");
const router = express.Router();
const { authenticateToken } = require("./userAuth");
const Book = require("../models/book");
const Order = require("../models/order");
const User = require("../models/user");

// Place an order
router.post("/place-order", authenticateToken, async (req, res) => {
    try {
        const { id } = req.headers; // User ID
        const { order } = req.body; // Array of order items

        if (!id || !order) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        for (const orderData of order) {
            const newOrder = new Order({ user: id, book: orderData._id });
            const orderDataFromDb = await newOrder.save();

            await User.findByIdAndUpdate(id, {
                $push: { orders: orderDataFromDb._id }
            });

            await User.findByIdAndUpdate(id, {
                $pull: { cart: orderData._id }
            });
        }

        return res.json({
            status: "Success",
            message: "Order Placed Successfully"
        });
    } catch (error) {
        console.error(error); // Log the error for debugging
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
});

// Get order history
router.get("/get-order-history", authenticateToken, async (req, res) => {
    try {
        const { id } = req.headers;

        if (!id) {
            return res.status(400).json({ message: "User ID is required" });
        }

        const userData = await User.findById(id).populate({
            path: "orders",
            populate: { path: "book" }
        });

        if (!userData) {
            return res.status(404).json({ message: "User not found" });
        }

        const ordersData = userData.orders.reverse();
        return res.json({
            status: "Success",
            data: ordersData
        });
    } catch (error) {
        console.error(error); // Log the error for debugging
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
});

// Get all orders
router.get("/get-all-orders", authenticateToken, async (req, res) => {
    try {
        const userData = await Order.find().populate({
            path: "book"
        }).populate({
            path: "user"
        }).sort({ createdAt: -1 });

        return res.json({
            status: "Success",
            data: userData
        });
    } catch (error) {
        console.error(error); // Log the error for debugging
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
});

// Update order status
router.put("/update-status/:id", authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({ message: "Status is required" });
        }

        await Order.findByIdAndUpdate(id, { status });

        return res.json({
            status: "Success",
            message: "Status updated successfully"
        });
    } catch (error) {
        console.error(error); // Log the error for debugging
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
});

module.exports = router;
