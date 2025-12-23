const express = require("express");
const router = express.Router();
const Guest = require("../models/Guest");

// GET all guests
router.get("/", async (req, res) => {
  const guests = await Guest.find();
  res.json(guests);
});

// GET guest by ID
router.get("/:id", async (req, res) => {
  const guest = await Guest.findById(req.params.id);
  res.json(guest);
});

// POST create guest
router.post("/", async (req, res) => {
  const guest = new Guest(req.body);
  await guest.save();
  res.status(201).json(guest);
});

// PUT update guest
router.put("/:id", async (req, res) => {
  const guest = await Guest.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(guest);
});

// DELETE guest
router.delete("/:id", async (req, res) => {
  await Guest.findByIdAndDelete(req.params.id);
  res.json({ message: "Guest deleted" });
});

module.exports = router;
