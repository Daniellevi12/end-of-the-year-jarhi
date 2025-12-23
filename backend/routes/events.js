const express = require("express");
const router = express.Router();
const Event = require("../models/Event");

// GET all events
router.get("/", async (req, res) => {
  const events = await Event.find();
  res.json(events);
});

// GET event by ID
router.get("/:id", async (req, res) => {
  const event = await Event.findById(req.params.id);
  res.json(event);
});

// POST create event
router.post("/", async (req, res) => {
  const event = new Event(req.body);
  await event.save();
  res.status(201).json(event);
});

// PUT update event
router.put("/:id", async (req, res) => {
  const event = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(event);
});

// DELETE event
router.delete("/:id", async (req, res) => {
  await Event.findByIdAndDelete(req.params.id);
  res.json({ message: "Event deleted" });
});

module.exports = router;
