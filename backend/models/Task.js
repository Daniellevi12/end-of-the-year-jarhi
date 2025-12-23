const mongoose = require("mongoose");

const TaskSchema = new mongoose.Schema({
  event_id: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },
  title: { type: String, required: true },
  due_date: { type: Date },
  completed: { type: Boolean, default: false },
});

module.exports = mongoose.model("Task", TaskSchema);
