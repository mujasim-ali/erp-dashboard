const express = require("express");
const router = express.Router();
const { createItem, getInventory, getItemById, updateItem, adjustStock, deleteItem, getInventoryStats } = require("../controllers/inventoryController");
const { authenticate, requireAdmin } = require("../middleware/auth");
const { validateInventoryItem, validateStockAdjustment } = require("../middleware/validators");

router.use(authenticate);
router.get("/stats",       getInventoryStats);
router.get("/",            getInventory);
router.post("/",           validateInventoryItem, createItem);
router.get("/:itemId",     getItemById);
router.put("/:itemId",     validateInventoryItem, updateItem);
router.patch("/:itemId/stock", validateStockAdjustment, adjustStock);
router.delete("/:itemId",  requireAdmin, deleteItem);
module.exports = router;
