const express = require("express");
const router = express.Router();
const Expense = require("../models/Expense");
const { verifyToken } = require("../middleware/authMiddleware");

router.get("/", verifyToken, async (req, res) => res.json(await Expense.find()));
router.get("/:id", verifyToken, async (req, res) => res.json(await Expense.findById(req.params.id)));
router.post("/", verifyToken, async (req, res) => res.status(201).json(await new Expense(req.body).save()));
router.put("/:id", verifyToken, async (req, res) => res.json(await Expense.findByIdAndUpdate(req.params.id, req.body, { new: true })));
router.delete("/:id", verifyToken, async (req, res) => { await Expense.findByIdAndDelete(req.params.id); res.json({message:"Expense deleted"}); });

module.exports = router;
