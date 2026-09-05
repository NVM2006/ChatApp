import Message from "../model/messageModel.js";
import User from "../model/userModel.js";
import Conversation from "../model/conversationModel.js";

export const getMessages = async (req, res, next) => {
  try {
    const currentUserId = req.user.id;
    const partnerId = req.params.id;

    let conversation = await Conversation.findOne({
      participants: { $all: [currentUserId, partnerId] },
    }).populate("participants", "-password");

    if (conversation) {
      res.status(200).json({
        success: true,
        data: conversation,
      });
    }

    const newConversation = await Conversation.create({
      participants: [currentUserId, partnerId],
    });

    const populatedConversation = await Conversation.findById(
      newConversation._id,
    ).populate("participants", "-password");

    res.status(201).json({
      success: true,
      data: populatedConversation,
    });
  } catch (error) {
    next(error);
  }
};

export const sendMessage = async (req, res, next) => {
  try {
    const currentUserId = req.user.id;
    const partnerId = req.params.id;
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

    res.status(200).json({
      success: true,
      data: newMessage,
    });
  } catch (error) {
    next(error);
  }
};
