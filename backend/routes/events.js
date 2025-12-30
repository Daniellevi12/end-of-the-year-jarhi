const express = require("express");
const router = express.Router();
const Event = require("../models/Event");

// GET events for a specific user (Creator OR Attendee)
router.get("/", async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId || userId === "undefined") {
      return res.status(400).json({ message: "Valid User ID is required" });
    }

    const events = await Event.find({
      $or: [
        { creator: userId },
        { attendees: userId }
      ]
    })
    .populate("creator", "name email")
    .populate("attendees", "name email")
    .sort({ date: 1 });

    res.json(events);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST create event
router.post("/", async (req, res) => {
  try {
    const { name, date, location, description, attendees, creator } = req.body;
    
    // Strict validation
    if (!name || !date || !creator) {
      return res.status(400).json({ message: "Name, date, and creator are required" });
    }
    
    const event = new Event({ name, date, location, description, attendees, creator });
    await event.save();
    res.status(201).json(event);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;