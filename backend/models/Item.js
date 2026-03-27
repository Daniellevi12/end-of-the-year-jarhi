const mongoose = require("mongoose");

const ItemSchema = new mongoose.Schema({
  event_id: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },
  name: { type: String, required: true },
  addedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  addedByName: { type: String },
  quantity: { type: Number, default: 1 },
  purchased: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Item", ItemSchema);
