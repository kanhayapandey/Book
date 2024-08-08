const express = require("express");
const router = express.Router();
const User = require("../models/user");
const Book = require("../models/book");
const { authenticateToken } = require("./userAuth"); // Ensure this is a valid middleware function

// Add book-admin
router.post("/add-book", authenticateToken, async (req, res) => {
    try {
        const { id } = req.headers; 
        const user = await User.findById(id);

        if (!user) return res.status(404).json({ message: "User not found" });
        if (user.role !== "admin") return res.status(403).json({ message: "You are not an admin" });

        const book = new Book(req.body);
        await book.save();

        res.status(200).json({ message: "Book added successfully" });
    } catch (error) {
        console.error(error); 
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
});

// Update book
router.put("/update-book", authenticateToken, async (req, res) => {
    try {
        const { bookid } = req.headers;
        await Book.findByIdAndUpdate(bookid, req.body);

        res.status(200).json({ message: "Book updated successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
});

// Delete book
router.delete("/delete-book", authenticateToken, async (req, res) => {
    try {
        const { bookid } = req.headers;
        await Book.findByIdAndDelete(bookid);

        res.status(200).json({ message: "Book deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
});

// Get all books
router.get("/get-all-books", async (req, res) => {
    try {
        const books = await Book.find().sort({ createdAt: -1 });
        res.json({ status: "Success", data: books });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "An error occurred", error: error.message });
    }
});

// Get recently added books
router.get("/get-recent-books", async (req, res) => {
    try {
        const date = new Date();
        date.setDate(date.getDate() - 15);
        const books = await Book.find({ createdAt: { $gte: date } }).sort({ createdAt: -1 }).limit(50);
        res.json({ status: "Success", data: books });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "An error occurred", error: error.message });
    }
});

// Get book by ID
router.get("/get-book-by-Id/:id", async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        res.json({ status: "Success", data: book });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "An error occurred", error: error.message });
    }
});

module.exports = router;
