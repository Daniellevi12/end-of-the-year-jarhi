const router = require("express").Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// REGISTER
router.post("/register", async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: "User already exists" });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({ name, email, password: hashedPassword });
        await newUser.save();

        res.status(201).json({ message: "User registered successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// LOGIN
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: "Invalid credentials" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || "secret", { expiresIn: "1d" });

        res.status(200).json({
            message: "Login successful",
            user: {
                id: user._id, // Notice your backend uses 'id' here
                name: user.name,
                email: user.email
            },
            token
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// SEARCH USERS BY NAME (Updated to exclude current user)
router.get("/users/search", async (req, res) => {
    const { query, exclude } = req.query;
    try {
        const filter = {
            name: { $regex: query, $options: "i" }
        };

        // If an exclude ID is provided, tell MongoDB to ignore that ID
        if (exclude) {
            filter._id = { $ne: exclude };
        }

        const users = await User.find(filter).select("name _id email");
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: "Search failed", error: err.message });
    }
});

module.exports = router;