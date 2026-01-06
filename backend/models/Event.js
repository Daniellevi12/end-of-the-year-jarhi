const mongoose = require("mongoose");

const EventSchema = new mongoose.Schema({
  name: { type: String, required: true },
  date: { type: Date, required: true },
  location: { type: String },
  description: { type: String },
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  // These are the people allowed to see the event
  invitedGuests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  // These are the people who clicked "Coming"
  attendees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  items: [{
    name: { type: String, required: true },
    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    addedByName: { type: String }
  }]
});

module.exports = mongoose.model("Event", EventSchema);