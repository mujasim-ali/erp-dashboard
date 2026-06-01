const express = require("express");
const router = express.Router();
const { register, login, getMe, updateProfile, getAllUsers } = require("../controllers/authController");
const { authenticate, requireAdmin } = require("../middleware/auth");

router.post("/register", register);
router.post("/login", login);
router.get("/me", authenticate, getMe);
router.put("/me", authenticate, updateProfile);
router.get("/users", authenticate, getAllUsers); // list all users (for assigning tasks etc.)

module.exports = router;
