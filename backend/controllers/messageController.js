const Message = require('../models/Message');

exports.sendMessage = async (req, res) => {
  try {
    const { recipientId, content } = req.body;
    const senderId = req.user.id;

    const message = new Message({
      sender: senderId,
      recipient: recipientId,
      content
    });

    await message.save();
    res.status(201).json(message);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.id;

    const messages = await Message.find({
      $or: [
        { sender: currentUserId, recipient: userId },
        { sender: userId, recipient: currentUserId }
      ]
    })
    .sort({ createdAt: 1 })
    .populate('sender', 'username')
    .populate('recipient', 'username');

    res.json(messages);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};