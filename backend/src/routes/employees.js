const express = require("express");
const router = express.Router();
const { createEmployee, getEmployees, getEmployeeById, updateEmployee, deleteEmployee, getEmployeeStats } = require("../controllers/employeeController");
const { authenticate, requireAdmin } = require("../middleware/auth");
const { validateEmployee } = require("../middleware/validators");

router.use(authenticate);
router.get("/stats",         getEmployeeStats);
router.get("/",              getEmployees);
router.post("/",             validateEmployee, createEmployee);
router.get("/:employeeId",   getEmployeeById);
router.put("/:employeeId",   validateEmployee, updateEmployee);
router.delete("/:employeeId", requireAdmin, deleteEmployee);
module.exports = router;
