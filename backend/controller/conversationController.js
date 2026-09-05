import Conversation from "../model/conversationModel.js";

export const getConversations = async (req, res, next) => {
  try {
    const currentUserId = req.user.id;

    let conversations = await Conversation.find({
      participants: { $in: [currentUserId] },
    })
      .populate("participants", "-password")
      .populate("lastMessage")
      .sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,
      data: conversations,
    });
  } catch (error) {
    next(error);
  }
};

export const accessConversation = async (req, res, next) => {
  try {
    const currentUserId = req.user.id;
    const partnerId = req.params.partnerId;

    let conversation = await Conversation.findOne({
      participants: { $all: [currentUserId, partnerId] },
    }).populate("participants", "-password");

    res.status(200).json({
      success: true,
      data: conversation,
    });
  } catch (error) {
    next(error);
  }
};
