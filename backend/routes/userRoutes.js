const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const userController = require("../controllers/userController");
const { upload } = require("../middleware/uploadMiddleware");

router.get("/me", authMiddleware, userController.getMe);
router.put("/me", authMiddleware, userController.updateMe);
router.post(
  "/me/avatar",
  authMiddleware,
  upload.single("immagine_profilo"),
  userController.uploadMyAvatar,
);
router.get("/:id", authMiddleware, userController.getUser);

module.exports = router;
