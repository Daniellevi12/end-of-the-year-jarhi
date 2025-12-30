require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const authRoute = require("./routes/auth");
const eventRoute = require("./routes/events");

const app = express();

// JSON parser
app.use(express.json());

// CORS configuration
// We allow both localhost (for you) and your friend's IP
const allowedOrigins = [
  "http://localhost:3000",
  "http://10.118.30.220:3000", // Your IP (Frontend) // change ip to ip now
  "http://10.118.30.148:3000"  // His IP (Frontend) // change ip to ip now
];

app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
}));

// Routes
app.use("/api/auth", authRoute);
app.use("/api/events", eventRoute);

app.get("/", (req, res) => {
  res.send("API is running ✔");
});

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");

    const PORT = process.env.PORT || 5000;

    // We listen on 0.0.0.0 so the server is visible to the 10.118.x.x network
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server is running!`);
      console.log(`Connect via: http://10.118.30.220:${PORT}`);
    });
  })
  .catch(err => console.log("❌ MongoDB connection error:", err));