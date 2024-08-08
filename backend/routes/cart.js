const express = require("express");
const router = express.Router();
const User = require("../models/user");
const { authenticateToken } = require("./userAuth");

// Add book to cart
router.put("/add-to-cart", authenticateToken, async (req, res) => {
    try {
        const { bookid } = req.headers; // Ensure bookid is sent in headers
        const { id } = req.headers; // Ensure user ID is sent in headers

        if (!bookid || !id) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const userData = await User.findById(id);
        if (!userData) {
            return res.status(404).json({ message: "User not found" });
        }

        const isBookInCart = userData.cart.includes(bookid);
        if (isBookInCart) {
            return res.json({ status: "Success", message: "Book already in cart" });
        }

        await User.findByIdAndUpdate(id, { $push: { cart: bookid } });
        return res.json({ status: "Success", message: "Book added to cart" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
});

// Remove book from cart
router.put("/remove-book-from-cart", authenticateToken, async (req, res) => {
    try {
        const { bookid } = req.body; // Changed from params to body for consistency
        const { id } = req.headers;

        if (!bookid || !id) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        await User.findByIdAndUpdate(id, { $pull: { cart: bookid } });
        return res.json({ status: "Success", message: "Book removed from cart" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
});

// Get user cart
router.get("/get-user-cart", authenticateToken, async (req, res) => {
    try {
        const { id } = req.headers;

        if (!id) {
            return res.status(400).json({ message: "User ID is required" });
        }

        const userData = await User.findById(id).populate("cart");
        if (!userData) {
            return res.status(404).json({ message: "User not found" });
        }

        const cart = userData.cart.reverse();
        return res.json({ status: "Success", data: cart });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
});

module.exports = router;
