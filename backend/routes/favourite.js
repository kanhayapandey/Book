const express = require("express");
const router = express.Router();
const User = require("../models/user");
const { authenticateToken } = require("./userAuth");

// Add book to favourites
router.put("/add-book-to-favourite", authenticateToken, async (req, res) => {
    try {
        const { bookid } = req.body; // Changed to body for consistency
        const { id } = req.headers;   // Ensure ID is sent in headers

        if (!bookid || !id) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const userData = await User.findById(id);
        if (!userData) {
            return res.status(404).json({ message: "User not found" });
        }

        const isBookFavourite = userData.favourites.includes(bookid);
        if (isBookFavourite) {
            return res.status(200).json({ message: "Book already in favourites" });
        }

        await User.findByIdAndUpdate(id, { $push: { favourites: bookid } });
        return res.status(200).json({ message: "Book added to favourites" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
});

// Remove book from favourites
router.put("/remove-book-from-favourite", authenticateToken, async (req, res) => {
    try {
        const { bookid } = req.body; // Changed to body for consistency
        const { id } = req.headers;

        if (!bookid || !id) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const userData = await User.findById(id);
        if (!userData) {
            return res.status(404).json({ message: "User not found" });
        }

        const isBookFavourite = userData.favourites.includes(bookid);
        if (!isBookFavourite) {
            return res.status(400).json({ message: "Book not in favourites" });
        }

        await User.findByIdAndUpdate(id, { $pull: { favourites: bookid } });
        return res.status(200).json({ message: "Book removed from favourites" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
});

// Get favourite books
router.get("/get-favourite-books", authenticateToken, async (req, res) => {
    try {
        const { id } = req.headers;

        if (!id) {
            return res.status(400).json({ message: "User ID is required" });
        }

        const userData = await User.findById(id).populate("favourites");
        if (!userData) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.json({ status: "Success", data: userData.favourites });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
});

module.exports = router;
