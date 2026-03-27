const Item = require("../models/Item");

exports.getAllItems = async (req, res) => {
  try {
    const { eventId } = req.query;
    
    if (!eventId) {
      return res.status(400).json({ message: "Event ID required" });
    }

    const items = await Item.find({ event_id: eventId })
      .populate("addedBy", "name email")
      .populate("event_id", "name");
    
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getItemById = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id)
      .populate("addedBy", "name email")
      .populate("event_id", "name");
    
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    res.json(item);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createItem = async (req, res) => {
  try {
    const { event_id, name, addedBy, addedByName, quantity } = req.body;
    
    const item = new Item({
      event_id,
      name,
      addedBy,
      addedByName,
      quantity: quantity || 1
    });
    
    const savedItem = await item.save();
    const populatedItem = await Item.findById(savedItem._id)
      .populate("addedBy", "name email")
      .populate("event_id", "name");
    
    res.status(201).json(populatedItem);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateItem = async (req, res) => {
  try {
    const { quantity, purchased } = req.body;
    const item = await Item.findByIdAndUpdate(
      req.params.id,
      { quantity, purchased },
      { new: true }
    )
      .populate("addedBy", "name email")
      .populate("event_id", "name");

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    res.json(item);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteItem = async (req, res) => {
  try {
    const item = await Item.findByIdAndDelete(req.params.id);
    
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    res.json({ message: "Item deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
