const express = require("express");
const router = express.Router();
const Task = require("../models/Task");
const { verifyToken } = require("../middleware/authMiddleware");

router.get("/", verifyToken, async (req, res) => res.json(await Task.find()));
router.get("/:id", verifyToken, async (req, res) => res.json(await Task.findById(req.params.id)));
router.post("/", verifyToken, async (req, res) => res.status(201).json(await new Task(req.body).save()));
router.put("/:id", verifyToken, async (req, res) => res.json(await Task.findByIdAndUpdate(req.params.id, req.body, { new: true })));
router.delete("/:id", verifyToken, async (req, res) => { await Task.findByIdAndDelete(req.params.id); res.json({message:"Task deleted"}); });

module.exports = router;
