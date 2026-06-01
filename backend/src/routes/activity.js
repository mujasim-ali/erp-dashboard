const express = require("express");
const router = express.Router({ mergeParams: true });
const { getActivityLogs, getGlobalActivityLogs } = require("../controllers/activityController");
const { authenticate, requireAdmin } = require("../middleware/auth");

router.use(authenticate);

router.get("/global", requireAdmin, getGlobalActivityLogs);
router.get("/:projectId", getActivityLogs);

module.exports = router;
