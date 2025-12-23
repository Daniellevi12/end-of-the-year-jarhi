const express = require("express");
const router = express.Router();
const Expense = require("../models/Expense");

router.get("/", async (req, res) => res.json(await Expense.find()));
router.get("/:id", async (req, res) => res.json(await Expense.findById(req.params.id)));
router.post("/", async (req, res) => res.status(201).json(await new Expense(req.body).save()));
router.put("/:id", async (req, res) => res.json(await Expense.findByIdAndUpdate(req.params.id, req.body, { new: true })));
router.delete("/:id", async (req, res) => { await Expense.findByIdAndDelete(req.params.id); res.json({message:"Expense deleted"}); });

module.exports = router;
