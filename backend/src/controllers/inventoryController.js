const { v4: uuidv4 } = require("uuid");
const { db } = require("../db/database");
const { logActivity } = require("../middleware/activityLogger");

const createItem = async (req, res) => {
  try {
    const {
      item_name, category, description, quantity = 0,
      unit = "pcs", unit_price = 0, supplier, sku,
      location, reorder_level = 10,
    } = req.body;

    if (!item_name || !category) {
      return res.status(400).json({ error: "item_name and category are required" });
    }

    if (sku) {
      const existing = await db.execute({
        sql: "SELECT item_id FROM inventory WHERE sku = ?",
        args: [sku],
      });
      if (existing.rows.length > 0) {
        return res.status(409).json({ error: "SKU already exists" });
      }
    }

    // Auto-calculate status
    let status = "in_stock";
    if (quantity === 0) status = "out_of_stock";
    else if (quantity <= reorder_level) status = "low_stock";

    const itemId = uuidv4();
    await db.execute({
      sql: `INSERT INTO inventory
              (item_id, item_name, category, description, quantity, unit, unit_price,
               supplier, sku, location, status, reorder_level, created_by)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        itemId, item_name.trim(), category.trim(), description || null,
        quantity, unit, unit_price, supplier || null,
        sku || null, location || null, status, reorder_level, req.user.user_id,
      ],
    });

    await logActivity({
      userId: req.user.user_id,
      entityId: itemId,
      entityType: "inventory",
      action: "INVENTORY_ITEM_CREATED",
      details: { item_name, category, quantity },
    });

    const item = await db.execute({
      sql: "SELECT * FROM inventory WHERE item_id = ?",
      args: [itemId],
    });

    res.status(201).json({ message: "Inventory item created", item: item.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create inventory item" });
  }
};

const getInventory = async (req, res) => {
  try {
    const { category, status, search, limit = 50, offset = 0 } = req.query;

    let sql = "SELECT * FROM inventory WHERE 1=1";
    const args = [];

    if (category) { sql += " AND category = ?"; args.push(category); }
    if (status) { sql += " AND status = ?"; args.push(status); }
    if (search) {
      sql += " AND (item_name LIKE ? OR sku LIKE ? OR supplier LIKE ?)";
      args.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    sql += " ORDER BY created_at DESC LIMIT ? OFFSET ?";
    args.push(Number(limit), Number(offset));

    const result = await db.execute({ sql, args });

    const total = await db.execute("SELECT COUNT(*) as count FROM inventory");

    const categories = await db.execute(`
      SELECT category, COUNT(*) as item_count,
             SUM(quantity) as total_quantity,
             ROUND(SUM(quantity * unit_price), 2) as total_value
      FROM inventory GROUP BY category ORDER BY item_count DESC
    `);

    res.json({
      items: result.rows,
      total: Number(total.rows[0].count),
      categories: categories.rows,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch inventory" });
  }
};

const getItemById = async (req, res) => {
  try {
    const { itemId } = req.params;
    const result = await db.execute({
      sql: "SELECT * FROM inventory WHERE item_id = ?",
      args: [itemId],
    });
    if (result.rows.length === 0) return res.status(404).json({ error: "Item not found" });

    // Activity history for this item
    const history = await db.execute({
      sql: `SELECT al.*, u.name as user_name FROM activity_log al
            LEFT JOIN users u ON u.user_id = al.user_id
            WHERE al.entity_id = ? ORDER BY al.created_at DESC LIMIT 15`,
      args: [itemId],
    });

    res.json({ item: result.rows[0], history: history.rows });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch item" });
  }
};

const updateItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const {
      item_name, category, description, unit,
      unit_price, supplier, sku, location, reorder_level, status,
    } = req.body;

    const existing = await db.execute({
      sql: "SELECT * FROM inventory WHERE item_id = ?",
      args: [itemId],
    });
    if (existing.rows.length === 0) return res.status(404).json({ error: "Item not found" });

    await db.execute({
      sql: `UPDATE inventory SET
              item_name    = COALESCE(?, item_name),
              category     = COALESCE(?, category),
              description  = COALESCE(?, description),
              unit         = COALESCE(?, unit),
              unit_price   = COALESCE(?, unit_price),
              supplier     = COALESCE(?, supplier),
              sku          = COALESCE(?, sku),
              location     = COALESCE(?, location),
              reorder_level= COALESCE(?, reorder_level),
              status       = COALESCE(?, status),
              updated_at   = datetime('now')
            WHERE item_id = ?`,
      args: [
        item_name || null, category || null, description || null,
        unit || null, unit_price ?? null, supplier || null,
        sku || null, location || null, reorder_level ?? null,
        status || null, itemId,
      ],
    });

    await logActivity({
      userId: req.user.user_id,
      entityId: itemId,
      entityType: "inventory",
      action: "INVENTORY_ITEM_UPDATED",
      details: { item_name, status },
    });

    res.json({ message: "Item updated" });
  } catch (err) {
    res.status(500).json({ error: "Failed to update item" });
  }
};

// Dedicated stock adjustment endpoint
const adjustStock = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { adjustment, reason } = req.body; // adjustment can be + or -

    if (adjustment === undefined || adjustment === null) {
      return res.status(400).json({ error: "adjustment value is required (positive to add, negative to remove)" });
    }

    const existing = await db.execute({
      sql: "SELECT * FROM inventory WHERE item_id = ?",
      args: [itemId],
    });
    if (existing.rows.length === 0) return res.status(404).json({ error: "Item not found" });

    const item = existing.rows[0];
    const newQuantity = Math.max(0, Number(item.quantity) + Number(adjustment));

    // Recalculate status
    let newStatus = "in_stock";
    if (newQuantity === 0) newStatus = "out_of_stock";
    else if (newQuantity <= Number(item.reorder_level)) newStatus = "low_stock";

    await db.execute({
      sql: "UPDATE inventory SET quantity = ?, status = ?, updated_at = datetime('now') WHERE item_id = ?",
      args: [newQuantity, newStatus, itemId],
    });

    await logActivity({
      userId: req.user.user_id,
      entityId: itemId,
      entityType: "inventory",
      action: adjustment > 0 ? "STOCK_ADDED" : "STOCK_REMOVED",
      details: {
        adjustment,
        reason: reason || "Manual adjustment",
        from: item.quantity,
        to: newQuantity,
      },
    });

    res.json({
      message: "Stock adjusted",
      previous_quantity: item.quantity,
      new_quantity: newQuantity,
      new_status: newStatus,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to adjust stock" });
  }
};

const deleteItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const result = await db.execute({
      sql: "SELECT * FROM inventory WHERE item_id = ?",
      args: [itemId],
    });
    if (result.rows.length === 0) return res.status(404).json({ error: "Item not found" });

    await db.execute({ sql: "DELETE FROM inventory WHERE item_id = ?", args: [itemId] });
    res.json({ message: "Item deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete item" });
  }
};

const getInventoryStats = async (req, res) => {
  try {
    const stats = await db.execute(`
      SELECT
        COUNT(*) as total_items,
        SUM(quantity) as total_quantity,
        ROUND(SUM(quantity * unit_price), 2) as total_value,
        SUM(CASE WHEN status = 'in_stock' THEN 1 ELSE 0 END) as in_stock,
        SUM(CASE WHEN status = 'low_stock' THEN 1 ELSE 0 END) as low_stock,
        SUM(CASE WHEN status = 'out_of_stock' THEN 1 ELSE 0 END) as out_of_stock,
        SUM(CASE WHEN status = 'discontinued' THEN 1 ELSE 0 END) as discontinued
      FROM inventory
    `);

    const lowStockItems = await db.execute(`
      SELECT item_id, item_name, quantity, reorder_level, category, supplier
      FROM inventory WHERE status IN ('low_stock', 'out_of_stock')
      ORDER BY quantity ASC LIMIT 10
    `);

    res.json({ stats: stats.rows[0], low_stock_alerts: lowStockItems.rows });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch inventory stats" });
  }
};

module.exports = {
  createItem, getInventory, getItemById, updateItem,
  adjustStock, deleteItem, getInventoryStats,
};
