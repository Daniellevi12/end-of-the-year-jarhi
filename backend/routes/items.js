const express = require("express");
const router = express.Router();
const Item = require("../models/Item");

router.get("/", async (req, res) => res.json(await Item.find()));
router.get("/:id", async (req, res) => res.json(await Item.findById(req.params.id)));
router.post("/", async (req, res) => res.status(201).json(await new Item(req.body).save()));
router.put("/:id", async (req, res) => res.json(await Item.findByIdAndUpdate(req.params.id, req.body, { new: true })));
router.delete("/:id", async (req, res) => { await Item.findByIdAndDelete(req.params.id); res.json({message:"Item deleted"}); });

module.exports = router;
