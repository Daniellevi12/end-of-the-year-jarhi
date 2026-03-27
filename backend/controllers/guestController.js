const Guest = require("../models/Guest");
const Event = require("../models/Event");

// GET all guests for a specific event
exports.getAllGuests = async (req, res) => {
  try {
    const { eventId } = req.query;
    
    if (!eventId) {
      return res.status(400).json({ message: "Event ID required" });
    }

    const guests = await Guest.find({ event_id: eventId })
      .populate("user_id", "name email")
      .populate("event_id", "name");
    
    res.json(guests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET guest by ID
exports.getGuestById = async (req, res) => {
  try {
    const guest = await Guest.findById(req.params.id)
      .populate("user_id", "name email")
      .populate("event_id", "name");
    
    if (!guest) {
      return res.status(404).json({ message: "Guest not found" });
    }

    res.json(guest);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST create guest (This is now handled via event invite, but keeping for flexibility)
exports.createGuest = async (req, res) => {
  try {
    const { event_id, user_id, status, comment } = req.body;

    // Check if event exists
    const event = await Event.findById(event_id);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Check if guest already exists
    const existingGuest = await Guest.findOne({
      event_id,
      user_id
    });

    if (existingGuest) {
      return res.status(400).json({ message: "Guest already invited to this event" });
    }

    const guest = new Guest({
      event_id,
      user_id,
      status: status || "invited",
      comment
    });
    await guest.save();

    const populatedGuest = await Guest.findById(guest._id)
      .populate("user_id", "name email")
      .populate("event_id", "name");

    res.status(201).json(populatedGuest);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT update guest (Status, comment, etc.)
exports.updateGuest = async (req, res) => {
  try {
    const { status, comment } = req.body;
    const guest = await Guest.findByIdAndUpdate(
      req.params.id,
      { status, comment },
      { new: true }
    )
      .populate("user_id", "name email")
      .populate("event_id", "name");

    if (!guest) {
      return res.status(404).json({ message: "Guest not found" });
    }

    res.json(guest);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE guest (Remove from event)
exports.deleteGuest = async (req, res) => {
  try {
    const guest = await Guest.findByIdAndDelete(req.params.id);

    if (!guest) {
      return res.status(404).json({ message: "Guest not found" });
    }

    res.json({ message: "Guest deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
