const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const tutorController = require("../controllers/tutorController");

router.post("/search", authMiddleware, tutorController.searchTutors);
router.get("/me", authMiddleware, tutorController.getTutorMe);
router.put("/me", authMiddleware, tutorController.updateTutorMe);
router.put(
  "/me/availability",
  authMiddleware,
  tutorController.updateAvailabilityMe,
);
router.get("/:id", authMiddleware, tutorController.getTutor);

module.exports = router;
