import Message from "../model/messageModel.js";
import Conversation from "../model/conversationModel.js";
import User from "../model/userModel.js";

export const getUsersForSidebar = async (req, res, next) => {
  try {
    const loggedInUserId = req.user._id;
    const filteredUsers = await User.find({
      _id: { $ne: loggedInUserId },
    }).select("-password");

    res.status(200).json(filteredUsers);
  } catch (error) {
    next(error);
  }
};

export const getMessages = async (req, res, next) => {
  try {
    const currentUserId = req.user._id;
    const partnerId = req.params.partnerId;

    const conversation = await Conversation.findOne({
      participants: { $all: [currentUserId, partnerId] },
    });

    if (!conversation) {
      return res.status(200).json([]);
    }

    const messages = await Message.find({
      conversationId: conversation._id,
    }).sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (error) {
    next(error);
  }
};

export const sendMessage = async (req, res, next) => {
  try {
    const currentUserId = req.user._id;
    const partnerId = req.params.partnerId;
    const { text, image } = req.body;

    let conversation = await Conversation.findOne({
      participants: { $all: [currentUserId, partnerId] },
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [currentUserId, partnerId],
      });
    }
    const newMessage = await Message.create({
      senderId: currentUserId,
      conversationId: conversation._id,
      text,
      image,
    });

    conversation.lastMessage = newMessage._id;
    await conversation.save();

    res.status(200).json(newMessage);
  } catch (error) {
    next(error);
  }
};
