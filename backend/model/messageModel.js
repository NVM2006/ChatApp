import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    encryptedAesKey: {
      type: String, // Lưu khóa AES đã bị bọc bởi RSA
    },
    senderEncryptedAesKey: {
      type: String, // THÊM DÒNG NÀY: Khóa dành cho người gửi tự xem lại
    },
    iv: {
      type: String, // Vector khởi tạo ngẫu nhiên của AES
    },
    shaHash: {
      type: String, // Mã băm SHA-256 để kiểm tra toàn vẹn
    },
    image: {
      type: String,
    },
  },
  { timestamps: true },
);

const Message = mongoose.model("Message", messageSchema);

export default Message;
