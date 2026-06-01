const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const messageController = require("../controllers/messageController");

router.get("/", authMiddleware, messageController.getConversations);
router.get("/:userId", authMiddleware, messageController.getMessages);
router.patch("/:userId/read", authMiddleware, messageController.markMessagesRead);
router.post("/", authMiddleware, messageController.sendMessage);

module.exports = router;
