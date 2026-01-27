const express = require("express");
const router = express.Router();
const guestController = require("../controllers/guestController");
const { verifyToken } = require("../middleware/authMiddleware");

// GET all guests for a specific event (requires eventId query parameter)
router.get("/", verifyToken, guestController.getAllGuests);

// GET guest by ID
router.get("/:id", verifyToken, guestController.getGuestById);

// POST create guest
router.post("/", verifyToken, guestController.createGuest);

// PUT update guest (status, comment, etc.)
router.put("/:id", verifyToken, guestController.updateGuest);

// DELETE guest
router.delete("/:id", verifyToken, guestController.deleteGuest);

module.exports = router;
