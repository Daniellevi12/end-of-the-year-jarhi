const mongoose = require("mongoose");

const GuestSchema = new mongoose.Schema({
  event_id: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },
  name: { type: String, required: true },
  phone: { type: String },
  email: { type: String },
  status: { type: String, enum: ["invited","confirmed","cancelled","not_coming"], default: "invited" },
  comment: { type: String },
});

module.exports = mongoose.model("Guest", GuestSchema);
