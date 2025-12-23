require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const authRoute = require("./routes/auth");

const app = express();

// JSON parser
app.use(express.json());

// CORS middleware
app.use(cors({
  origin: "http://localhost:3000", // frontend origin
  credentials: true,
}));

// Routes
app.use("/api/auth", authRoute);

app.get("/", (req, res) => {
  res.send("API is running ✔");
});

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => console.log("MongoDB connection error:", err));
