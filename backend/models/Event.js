const EventSchema = new mongoose.Schema({
  name: { type: String, required: true },
  date: { type: Date, required: true },
  location: { type: String },
  description: { type: String },
  attendees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
});