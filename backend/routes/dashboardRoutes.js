const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const dashboardController = require("../controllers/dashboardController");

router.get("/tutor", authMiddleware, dashboardController.getTutorDashboard);

module.exports = router;
