const Event = require("../models/Event");
const User = require("../models/User");
const Guest = require("../models/Guest");
const Item = require("../models/Item");

// Helper function to transform event with attendees and invitedGuests
const transformEvent = async (event, guests = null, items = null) => {
  const eventObj = event.toObject ? event.toObject() : event;
  
  // If guests aren't provided, fetch them
  let eventGuests = guests;
  if (!eventGuests) {
    eventGuests = await Guest.find({ event_id: event._id })
      .populate("user_id", "name email");
  }
  
  // If items aren't provided, fetch them
  let eventItems = items;
  if (!eventItems) {
    eventItems = await Item.find({ event_id: event._id })
      .populate("addedBy", "name email");
  }
  
  // Split guests into attendees (confirmed) and invitedGuests (invited/not_coming)
  eventObj.attendees = eventGuests
    .filter(guest => guest && guest.user_id && guest.status === "confirmed")
    .map(guest => ({
      _id: guest.user_id._id,
      name: guest.user_id.name,
      email: guest.user_id.email,
      guestId: guest._id,
      status: guest.status
    }));

  eventObj.invitedGuests = eventGuests
    .filter(guest => guest && guest.user_id && guest.status !== "confirmed")
    .map(guest => ({
      _id: guest.user_id._id,
      name: guest.user_id.name,
      email: guest.user_id.email,
      guestId: guest._id,
      status: guest.status
    }));

  // Map items with proper structure - handle null addedBy
  eventObj.items = eventItems
    .filter(item => item) // Filter out null/undefined items
    .map(item => ({
      _id: item._id,
      name: item.name,
      addedBy: item.addedBy?._id || item.addedBy,
      addedByName: item.addedByName || (item.addedBy?.name || "Unknown"),
      quantity: item.quantity,
      purchased: item.purchased
    }));

  return eventObj;
};

// GET events for specific user (Only if Creator or Invited/Attending)
exports.getUserEvents = async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId || userId === "undefined") return res.status(400).json({ message: "User ID required" });

    // Find events where user is creator
    const createdEvents = await Event.find({ creator: userId })
      .populate("creator", "name email")
      .sort({ date: 1 });

    // Find events where user is a guest
    const userGuestRecords = await Guest.find({ user_id: userId })
      .populate("event_id");
    const guestEventIds = userGuestRecords
      .filter(g => g.event_id) // Filter out any records with null event_id
      .map(g => String(g.event_id._id));

    // Get all guest events with full details (only if there are guest events)
    let guestEvents = [];
    if (guestEventIds.length > 0) {
      guestEvents = await Event.find({ _id: { $in: guestEventIds } })
        .populate("creator", "name email")
        .sort({ date: 1 });
    }

    // Combine events (creator events + guest events) and remove duplicates
    const allEventIds = new Set();
    const allEvents = [];

    createdEvents.forEach(event => {
      allEventIds.add(String(event._id));
      allEvents.push(event);
    });

    guestEvents.forEach(event => {
      if (!allEventIds.has(String(event._id))) {
        allEvents.push(event);
      }
    });

    // Transform events with guest and item data
    const transformedEvents = await Promise.all(
      allEvents.map(async (event) => {
        const eventGuests = await Guest.find({ event_id: event._id })
          .populate("user_id", "name email");
        const eventItems = await Item.find({ event_id: event._id })
          .populate("addedBy", "name email");
        return transformEvent(event, eventGuests, eventItems);
      })
    );

    res.json(transformedEvents);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET all users (For the invite list)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, "name email");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST create event (Adds creator as a guest with "confirmed" status)
exports.createEvent = async (req, res) => {
  try {
    const { name, date, location, description, invitedGuests, creator } = req.body;
    
    const event = new Event({ 
      name, date, location, description, 
      creator
    });
    await event.save();

    // Create a guest entry for the creator (automatically confirmed)
    const creatorGuest = new Guest({
      event_id: event._id,
      user_id: creator,
      status: "confirmed"
    });
    await creatorGuest.save();

    // Create guest entries for invited guests if provided
    if (invitedGuests && invitedGuests.length > 0) {
      await Promise.all(
        invitedGuests.map(guestId => {
          const guestDoc = new Guest({
            event_id: event._id,
            user_id: guestId,
            status: "invited"
          });
          return guestDoc.save();
        })
      );
    }

    const populatedEvent = await Event.findById(event._id)
      .populate("creator", "name email");
    
    const eventGuests = await Guest.find({ event_id: event._id })
      .populate("user_id", "name email");
    
    const eventItems = await Item.find({ event_id: event._id })
      .populate("addedBy", "name email");
    
    const transformedEvent = await transformEvent(populatedEvent, eventGuests, eventItems);
    
    // Emit event creation to all connected users
    req.io.emit("event_created", transformedEvent);
    
    res.status(201).json(transformedEvent);
  } catch (err) { 
    res.status(500).json({ message: err.message }); 
  }
};

// POST Invite Guest (Add by ID)
exports.inviteGuest = async (req, res) => {
  try {
    const { guestId } = req.body;

    // Check if guest is already invited/attending
    const existingGuest = await Guest.findOne({
      event_id: req.params.eventId,
      user_id: guestId
    });

    if (existingGuest) {
      return res.status(400).json({ message: "Guest already invited to this event" });
    }

    // Create new guest entry
    const newGuest = new Guest({
      event_id: req.params.eventId,
      user_id: guestId,
      status: "invited"
    });
    await newGuest.save();

    const updatedEvent = await Event.findById(req.params.eventId)
      .populate("creator", "name email");
    
    const eventGuests = await Guest.find({ event_id: req.params.eventId })
      .populate("user_id", "name email");
    
    const eventItems = await Item.find({ event_id: req.params.eventId })
      .populate("addedBy", "name email");
    
    const transformedEvent = await transformEvent(updatedEvent, eventGuests, eventItems);
    
    // Emit event update to all connected users
    req.io.emit("event_updated", transformedEvent);
    
    res.json(transformedEvent);
  } catch (err) { 
    res.status(500).json({ message: err.message }); 
  }
};

// POST RSVP
exports.rsvpEvent = async (req, res) => {
  try {
    const { userId, status } = req.body; 
    const event = await Event.findById(req.params.eventId);

    if (status === "not-coming" && String(event.creator) === String(userId)) {
      return res.status(400).json({ message: "Organizers must attend" });
    }

    // Find the guest record
    const guest = await Guest.findOne({
      event_id: req.params.eventId,
      user_id: userId
    });

    if (!guest) {
      return res.status(404).json({ message: "Guest record not found" });
    }

    // Update guest status
    guest.status = status === "coming" ? "confirmed" : "not_coming";
    await guest.save();

    const updated = await Event.findById(req.params.eventId)
      .populate("creator", "name email");
    
    const eventGuests = await Guest.find({ event_id: req.params.eventId })
      .populate("user_id", "name email");
    
    const eventItems = await Item.find({ event_id: req.params.eventId })
      .populate("addedBy", "name email");
    
    const transformedEvent = await transformEvent(updated, eventGuests, eventItems);
    
    // Emit event update to all connected users
    req.io.emit("event_updated", transformedEvent);
    
    res.json(transformedEvent);
  } catch (err) { 
    res.status(500).json({ message: err.message }); 
  }
};

// DELETE EVENT
exports.deleteEvent = async (req, res) => {
  try {
    const { userId } = req.query;
    const event = await Event.findById(req.params.eventId);
    if (String(event.creator) !== String(userId)) return res.status(403).json({ message: "Unauthorized" });
    await Event.findByIdAndDelete(req.params.eventId);
    
    // Emit event deletion to all connected users
    req.io.emit("event_deleted", { eventId: req.params.eventId });
    
    res.json({ message: "Deleted" });
  } catch (err) { 
    res.status(500).json({ message: err.message }); 
  }
};

// REMOVE USER FROM EVENT (Organizer only)
exports.removeGuest = async (req, res) => {
  try {
    const { userId, guestId } = req.body;
    const event = await Event.findById(req.params.eventId);
    
    // Only organizer can remove users
    if (String(event.creator) !== String(userId)) {
      return res.status(403).json({ message: "Unauthorized" });
    }
    
    // Find and delete the guest record
    const guest = await Guest.findOne({
      event_id: req.params.eventId,
      user_id: guestId
    });

    if (!guest) {
      return res.status(404).json({ message: "Guest not found" });
    }

    // Delete the guest record
    await Guest.findByIdAndDelete(guest._id);
    
    // Remove guest's items from Item collection
    await Item.deleteMany({ event_id: req.params.eventId, addedBy: guestId });
    
    const updated = await Event.findById(req.params.eventId)
      .populate("creator", "name email");
    
    const eventGuests = await Guest.find({ event_id: req.params.eventId })
      .populate("user_id", "name email");
    
    const eventItems = await Item.find({ event_id: req.params.eventId })
      .populate("addedBy", "name email");
    
    const transformedEvent = await transformEvent(updated, eventGuests, eventItems);
    
    // Emit event update so removed user doesn't see it anymore
    req.io.emit("event_updated", transformedEvent);
    req.io.emit("event_deleted", { eventId: req.params.eventId, userId: guestId });
    
    res.json(transformedEvent);
  } catch (err) { 
    res.status(500).json({ message: err.message }); 
  }
};

// ADD ITEM TO EVENT
exports.addItem = async (req, res) => {
  try {
    const { itemName, userId, userName } = req.body;
    const event = await Event.findById(req.params.eventId);
    
    // Check if user is the creator (always allowed)
    const isCreator = String(event.creator) === String(userId);
    if (!isCreator) {
      // Check if user is a guest with "confirmed" status
      const guest = await Guest.findOne({
        event_id: req.params.eventId,
        user_id: userId
      });
      
      // If not a confirmed guest, they can't add items
      if (!guest || guest.status !== "confirmed") {
        return res.status(403).json({ message: "You can't bring items while you're on the not coming list. Please mark yourself as coming if you'd like to bring something to the event!" });
      }
    }
    
    // Create new item in Item collection
    const newItem = new Item({
      event_id: req.params.eventId,
      name: itemName,
      addedBy: userId,
      addedByName: userName
    });
    await newItem.save();
    
    const updated = await Event.findById(req.params.eventId)
      .populate("creator", "name email");
    
    const eventGuests = await Guest.find({ event_id: req.params.eventId })
      .populate("user_id", "name email");
    
    const eventItems = await Item.find({ event_id: req.params.eventId })
      .populate("addedBy", "name email");
    
    const transformedEvent = await transformEvent(updated, eventGuests, eventItems);
    
    // Emit item update to all connected users
    req.io.emit("event_updated", transformedEvent);
    
    res.json(transformedEvent);
  } catch (err) { 
    res.status(500).json({ message: err.message }); 
  }
};

// DELETE ITEM FROM EVENT
exports.deleteItem = async (req, res) => {
  try {
    const { userId } = req.query;
    const event = await Event.findById(req.params.eventId);
    
    // Find the item
    const item = await Item.findById(req.params.itemId);
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }
    
    // Check if user is the one who added it or is the creator
    if (String(item.addedBy) === String(userId) || String(event.creator) === String(userId)) {
      await Item.findByIdAndDelete(req.params.itemId);
      
      const updated = await Event.findById(req.params.eventId)
        .populate("creator", "name email");
      
      const eventGuests = await Guest.find({ event_id: req.params.eventId })
        .populate("user_id", "name email");
      
      const eventItems = await Item.find({ event_id: req.params.eventId })
        .populate("addedBy", "name email");
      
      const transformedEvent = await transformEvent(updated, eventGuests, eventItems);
      
      // Emit item update to all connected users
      req.io.emit("event_updated", transformedEvent);
      
      res.json(transformedEvent);
    } else { 
      res.status(403).json({ message: "Unauthorized" }); 
    }
  } catch (err) { 
    res.status(500).json({ message: err.message }); 
  }
};
