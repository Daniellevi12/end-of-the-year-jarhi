const express = require("express");
const router = express.Router();
const eventController = require("../controllers/eventController");
const { verifyToken } = require("../middleware/authMiddleware");

// GET events for specific user
router.get("/", verifyToken, eventController.getUserEvents);

// GET all users (For the invite list)
router.get("/users", verifyToken, eventController.getAllUsers);

// POST create event
router.post("/", verifyToken, eventController.createEvent);

// POST Invite Guest
router.post("/:eventId/invite", verifyToken, eventController.inviteGuest);

// POST RSVP
router.post("/:eventId/rsvp", verifyToken, eventController.rsvpEvent);

// DELETE EVENT
router.delete("/:eventId", verifyToken, eventController.deleteEvent);

// REMOVE USER FROM EVENT
router.post("/:eventId/remove-guest", verifyToken, eventController.removeGuest);

// ADD ITEM TO EVENT
router.post("/:eventId/items", verifyToken, eventController.addItem);

// DELETE ITEM FROM EVENT
router.delete("/:eventId/items/:itemId", verifyToken, eventController.deleteItem);

module.exports = router;