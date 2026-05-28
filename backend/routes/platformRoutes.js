const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const platformController = require("../controllers/platformController");

router.get("/users/me", authMiddleware, platformController.getMe);
router.put("/users/me", authMiddleware, platformController.updateMe);

router.post("/tutors/search", platformController.searchTutors);
router.get("/tutors/me", authMiddleware, platformController.getTutorMe);
router.put("/tutors/me", authMiddleware, platformController.updateTutorMe);
router.put(
  "/tutors/me/availability",
  authMiddleware,
  platformController.updateAvailabilityMe,
);
router.get("/tutors/:id", authMiddleware, platformController.getTutor);

router.post("/materials", authMiddleware, platformController.createMaterial);
router.post(
  "/materials/:id/purchase",
  authMiddleware,
  platformController.purchaseMaterial,
);
router.get(
  "/materials/purchased/me",
  authMiddleware,
  platformController.getPurchasedMaterials,
);

router.post("/bookings", authMiddleware, platformController.createBooking);
router.get("/bookings/me", authMiddleware, platformController.getBookings);

router.post("/reviews", authMiddleware, platformController.createReview);

router.get("/messages", authMiddleware, platformController.getConversations);
router.get(
  "/messages/:userId",
  authMiddleware,
  platformController.getMessages,
);
router.post("/messages", authMiddleware, platformController.sendMessage);

router.get("/admin/users", authMiddleware, platformController.getAdminUsers);
router.put(
  "/admin/users/:id/status",
  authMiddleware,
  platformController.updateUserStatus,
);
router.delete("/admin/users/:id", authMiddleware, platformController.deleteUser);

module.exports = router;
