const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Verify JWT token and check if user exists in database
const verifyToken = async (req, res, next) => {
    try {
        // Get token from cookies or Authorization header
        const token = req.cookies?.token || req.headers.authorization?.split(" ")[1];

        if (!token) {
            return res.status(401).json({ message: "No token provided. Please log in." });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret");

        // Check if user exists in database
        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(401).json({ message: "User not found in database. Please log in again." });
        }

        // Attach user to request object
        req.user = user;
        next();
    } catch (err) {
        if (err.name === "TokenExpiredError") {
            return res.status(401).json({ message: "Token expired. Please log in again." });
        }
        if (err.name === "JsonWebTokenError") {
            return res.status(401).json({ message: "Invalid token. Please log in." });
        }
        return res.status(500).json({ message: "Authentication error", error: err.message });
    }
};

module.exports = { verifyToken };
