const express = require("express");
const router = express.Router();
const Guest = require("../models/Guest");
const { verifyToken } = require("../middleware/authMiddleware");

// GET all guests - PROTECTED
router.get("/", verifyToken, async (req, res) => {
  const guests = await Guest.find();
  res.json(guests);
});

// GET guest by ID - PROTECTED
router.get("/:id", verifyToken, async (req, res) => {
  const guest = await Guest.findById(req.params.id);
  res.json(guest);
});

// POST create guest - PROTECTED
router.post("/", verifyToken, async (req, res) => {
  const guest = new Guest(req.body);
  await guest.save();
  res.status(201).json(guest);
});

// PUT update guest - PROTECTED
router.put("/:id", verifyToken, async (req, res) => {
  const guest = await Guest.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(guest);
});

// DELETE guest - PROTECTED
router.delete("/:id", verifyToken, async (req, res) => {
  await Guest.findByIdAndDelete(req.params.id);
  res.json({ message: "Guest deleted" });
});

module.exports = router;
