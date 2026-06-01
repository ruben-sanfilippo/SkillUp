const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const bookingController = require("../controllers/bookingController");

router.post("/", authMiddleware, bookingController.createBooking);
router.get("/me", authMiddleware, bookingController.getBookings);

module.exports = router;
