const Message = require("../models/messageModel");

exports.getConversations = async (req, res) => {
  try {
    const conversations = await Message.getConversations(req.user.id);
    res.json(conversations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getMessages = async (req, res) => {
  try {
    res.json(await Message.getMessages(req.user.id, req.params.userId));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.markMessagesRead = async (req, res) => {
  try {
    res.json(await Message.markMessagesRead(req.user.id, req.params.userId));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.sendMessage = async (req, res) => {
  try {
    const result = await Message.sendMessage(req.user.id, req.body);
    const io = req.app.get("io");
    if (io && result.newMessage) {
      io.to(`user:${result.newMessage.destinatario_id}`).emit(
        "message-received",
        result.newMessage,
      );
      io.to(`user:${result.newMessage.mittente_id}`).emit(
        "message-received",
        result.newMessage,
      );
    }
    res.status(201).json(result.messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
