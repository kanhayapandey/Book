const express = require("express");
const router = express.Router();
const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { authenticateToken } = require("./userAuth");

// Sign up
router.post("/sign-up", async (req, res) => {
  try {
    const { username, email, password, address } = req.body;

    // Check username length
    if (username.length < 4) {
      return res.status(400).json({ message: "Username length should be greater than 4" });
    }

    // Check if username already exists
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({ message: "Username already exists" });
    }

    // Check if email already exists
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Check password length
    if (password.length <= 5) {
      return res.status(400).json({ message: "Password length should be more than 5" });
    }

    // Hash the password before saving
    const hashPass = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      email,
      password: hashPass,
      address,
    });

    await newUser.save();
    return res.status(200).json({ message: "SignUp Successfully" });
  } catch (error) {
    console.error("Error during sign up:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Sign in
router.post("/sign-in", async (req, res) => {
  try {
    const { username, password } = req.body;
    const existingUser = await User.findOne({ username });

    if (!existingUser) {
      return res.status(400).json({ message: "Invalid Username or Password" });
    }

    const isMatch = await bcrypt.compare(password, existingUser.password);

    if (isMatch) {
      const authClaims = { name: existingUser.username, role: existingUser.role };
      const token = jwt.sign({ authClaims }, process.env.JWT_SECRET, { expiresIn: "30d" });

      return res.status(200).json({
        id: existingUser._id,
        role: existingUser.role,
        token,
      });
    } else {
      return res.status(400).json({ message: "Invalid Username or Password" });
    }
  } catch (error) {
    console.error("Error during sign-in:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get user information
router.get("/get-user-information", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id; // Assuming `req.user.id` is set by the `authenticateToken` middleware
    const data = await User.findById(userId).select('-password');
    return res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching user information:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Update address
router.put("/update-address", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id; // Assuming `req.user.id` is set by the `authenticateToken` middleware
    const { address } = req.body;

    await User.findByIdAndUpdate(userId, { address });
    return res.status(200).json({ message: "Address updated successfully" });
  } catch (error) {
    console.error("Error updating address:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
