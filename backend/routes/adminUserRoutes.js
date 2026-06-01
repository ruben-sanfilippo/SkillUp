const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const adminController = require("../controllers/adminController");

router.get("/users", authMiddleware, adminController.getAdminUsers);
router.put("/users/:id/status", authMiddleware, adminController.updateUserStatus);
router.delete("/users/:id", authMiddleware, adminController.deleteUser);

module.exports = router;
