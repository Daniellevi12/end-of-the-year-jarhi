const mongoose = require("mongoose");

const ItemSchema = new mongoose.Schema({
  event_id: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },
  name: { type: String, required: true },
  quantity: { type: Number, default: 1 },
  purchased: { type: Boolean, default: false },
});

module.exports = mongoose.model("Item", ItemSchema);
