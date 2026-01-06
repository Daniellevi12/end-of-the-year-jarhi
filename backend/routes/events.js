const express = require("express");
const router = express.Router();
const Event = require("../models/Event");
const User = require("../models/User"); // Needed for fetching user list
const { verifyToken } = require("../middleware/authMiddleware");

// 1. GET events for specific user (Only if Creator or Invited) - PROTECTED
router.get("/", verifyToken, async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId || userId === "undefined") return res.status(400).json({ message: "User ID required" });

    const events = await Event.find({
      $or: [{ creator: userId }, { invitedGuests: userId }]
    })
      .populate("creator", "name email")
      .populate("attendees", "name email")
      .populate("invitedGuests", "name email")
      .sort({ date: 1 });

    res.json(events);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 2. GET all users (For the invite list) - PROTECTED
router.get("/users", verifyToken, async (req, res) => {
  try {
    const users = await User.find({}, "name email");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 3. POST create event (Adds creator to invited list automatically) - PROTECTED
router.post("/", verifyToken, async (req, res) => {
  try {
    const { name, date, location, description, invitedGuests, creator } = req.body;
    const event = new Event({ 
      name, date, location, description, 
      creator,
      invitedGuests: invitedGuests || [], 
      attendees: [creator] 
    });
    await event.save();
    const populatedEvent = await Event.findById(event._id).populate("creator", "name email").populate("attendees", "name email");
    
    // Emit event creation to all connected users
    req.io.emit("event_created", populatedEvent);
    
    res.status(201).json(populatedEvent);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// 4. POST Invite Guest (Add by ID) - PROTECTED
router.post("/:eventId/invite", verifyToken, async (req, res) => {
  try {
    const { guestId } = req.body;
    const event = await Event.findByIdAndUpdate(
      req.params.eventId,
      { $addToSet: { invitedGuests: guestId } },
      { new: true }
    ).populate("creator", "name email").populate("attendees", "name email").populate("invitedGuests", "name email");
    
    // Emit event update to all connected users
    req.io.emit("event_updated", event);
    
    res.json(event);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// 5. POST RSVP - PROTECTED
router.post("/:eventId/rsvp", verifyToken, async (req, res) => {
  try {
    const { userId, status } = req.body; 
    const event = await Event.findById(req.params.eventId);
    if (status === "not-coming" && String(event.creator) === String(userId)) {
      return res.status(400).json({ message: "Organizers must attend" });
    }
    if (status === "coming") {
      await Event.findByIdAndUpdate(req.params.eventId, { $addToSet: { attendees: userId } });
    } else {
      await Event.findByIdAndUpdate(req.params.eventId, { $pull: { attendees: userId } });
    }
    const updated = await Event.findById(req.params.eventId).populate("creator", "name email").populate("attendees", "name email").populate("invitedGuests", "name email");
    
    // Emit event update to all connected users
    req.io.emit("event_updated", updated);
    
    res.json(updated);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// 6. DELETE EVENT - PROTECTED
router.delete("/:eventId", verifyToken, async (req, res) => {
  try {
    const { userId } = req.query;
    const event = await Event.findById(req.params.eventId);
    if (String(event.creator) !== String(userId)) return res.status(403).json({ message: "Unauthorized" });
    await Event.findByIdAndDelete(req.params.eventId);
    
    // Emit event deletion to all connected users
    req.io.emit("event_deleted", { eventId: req.params.eventId });
    
    res.json({ message: "Deleted" });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// 6.5. REMOVE USER FROM EVENT (Organizer only) - PROTECTED
router.post("/:eventId/remove-guest", verifyToken, async (req, res) => {
  try {
    const { userId, guestId } = req.body;
    const event = await Event.findById(req.params.eventId);
    
    // Only organizer can remove users
    if (String(event.creator) !== String(userId)) {
      return res.status(403).json({ message: "Unauthorized" });
    }
    
    // Remove from invitedGuests and attendees
    await Event.findByIdAndUpdate(
      req.params.eventId,
      { 
        $pull: { invitedGuests: guestId, attendees: guestId }
      },
      { new: true }
    );
    
    const updated = await Event.findById(req.params.eventId).populate("creator", "name email").populate("attendees", "name email").populate("invitedGuests", "name email");
    
    // Emit event update so removed user doesn't see it anymore
    req.io.emit("event_updated", updated);
    req.io.emit("event_deleted", { eventId: req.params.eventId, userId: guestId });
    
    res.json(updated);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// 7. ITEM LOGIC (Same as before) - PROTECTED
router.post("/:eventId/items", verifyToken, async (req, res) => {
  try {
    const { itemName, userId, userName } = req.body;
    const event = await Event.findById(req.params.eventId);
    event.items.push({ name: itemName, addedBy: userId, addedByName: userName });
    await event.save();
    const updated = await Event.findById(req.params.eventId).populate("creator", "name email").populate("attendees", "name email").populate("invitedGuests", "name email");
    
    // Emit item update to all connected users
    req.io.emit("event_updated", updated);
    
    res.json(updated);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.delete("/:eventId/items/:itemId", verifyToken, async (req, res) => {
  try {
    const { userId } = req.query;
    const event = await Event.findById(req.params.eventId);
    const item = event.items.id(req.params.itemId);
    if (String(item.addedBy) === String(userId) || String(event.creator) === String(userId)) {
      event.items.pull(req.params.itemId);
      await event.save();
      const updated = await Event.findById(req.params.eventId).populate("creator", "name email").populate("attendees", "name email").populate("invitedGuests", "name email");
      
      // Emit item update to all connected users
      req.io.emit("event_updated", updated);
      
      res.json(updated);
    } else { res.status(403).json({ message: "Unauthorized" }); }
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;