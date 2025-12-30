const express = require("express");
const router = express.Router();
const Event = require("../models/Event");

// GET events for specific user (where they are creator or guest)
router.get("/", async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId || userId === "undefined") return res.status(400).json({ message: "User ID required" });

    const events = await Event.find({
      $or: [{ creator: userId }, { attendees: userId }]
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

// ADD ITEM TO EVENT
router.post("/:eventId/items", async (req, res) => {
  try {
    const { itemName, userId, userName } = req.body;
    const event = await Event.findById(req.params.eventId);
    if (!event) return res.status(404).json({ message: "Event not found" });

    event.items.push({ name: itemName, addedBy: userId, addedByName: userName });
    await event.save();
    res.json(event);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE ITEM FROM EVENT
router.delete("/:eventId/items/:itemId", async (req, res) => {
  try {
    const { userId } = req.query;
    const event = await Event.findById(req.params.eventId);
    if (!event) return res.status(404).json({ message: "Event not found" });

    const item = event.items.id(req.params.itemId);
    if (!item) return res.status(404).json({ message: "Item not found" });

    // Permission Logic: Only item creator OR event creator can delete
    const isItemCreator = String(item.addedBy) === String(userId);
    const isEventCreator = String(event.creator) === String(userId);

    if (isItemCreator || isEventCreator) {
      event.items.pull(req.params.itemId);
      await event.save();
      res.json(event);
    } else {
      res.status(403).json({ message: "Not authorized to delete this item" });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;