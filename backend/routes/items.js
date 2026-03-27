const express = require("express");
const router = express.Router();
const itemController = require("../controllers/itemController");
const { verifyToken } = require("../middleware/authMiddleware");

router.get("/", verifyToken, itemController.getAllItems);
router.get("/:id", verifyToken, itemController.getItemById);
router.post("/", verifyToken, itemController.createItem);
router.put("/:id", verifyToken, itemController.updateItem);
router.delete("/:id", verifyToken, itemController.deleteItem);

module.exports = router;
