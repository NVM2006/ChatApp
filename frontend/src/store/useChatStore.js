import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import { useAuthStore } from "./useAuthStore.js";
import { E2EE } from "../lib/E2EE.js";

//Dùng để tách "Chữ" và "Ảnh" ra sau khi giải mã E2EE thành công
const parseDecryptedPayload = (decryptedString, originalImage) => {
  // Thử giải nén JSON (nếu tin nhắn có chứa cả chữ và ảnh)
  const parsed = JSON.parse(decryptedString);
  if (parsed.text !== undefined || parsed.image !== undefined) {
    return { text: parsed.text, image: parsed.image };
  }
  return { text: decryptedString, image: originalImage };
};

export const useChatStore = create((set, get) => ({
  messages: [],
  contacts: [],
  selectedUser: null,

  isMessagesLoading: false,
  isContactsLoading: false,
  setSelectedUser: (selectedUser) => set({ selectedUser }),

  getContacts: async () => {
    set({ isContactsLoading: true });
    try {
      const res = await axiosInstance.get("/messages/users");
      set({ contacts: res.data });
    } catch (error) {
      console.log("Lỗi lấy danh sách bạn bè:", error);
    } finally {
      set({ isContactsLoading: false });
    }
  },

  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      const rawMessages = res.data;
      const { authUser, myPrivateKey } = useAuthStore.getState();

      // [E2EE] GIẢI MÃ TOÀN BỘ TIN NHẮN TẢI VỀ
      const decryptedMessages = await Promise.all(
        rawMessages.map(async (msg) => {
          const isMe = msg.senderId === authUser._id;
          let plainText = msg.text;
          let finalImage = msg.image;

          // 1. Giải mã tin nhắn do MÌNH gửi đi
          if (isMe && msg.senderEncryptedAesKey && myPrivateKey) {
            const fakeMsgObj = {
              ...msg,
              encryptedAesKey: msg.senderEncryptedAesKey,
            };
            const decryptedString = await E2EE.decryptMessage(
              fakeMsgObj,
              myPrivateKey,
            );

            // Tách dữ liệu
            const parsed = parseDecryptedPayload(decryptedString, msg.image);
            plainText = parsed.text;
            finalImage = parsed.image;
          }
          // 2. Tin nhắn cũ (bị mất chìa)
          else if (isMe && msg.encryptedAesKey && !msg.senderEncryptedAesKey) {
            plainText = "🔒 [Tin nhắn cũ không thể giải mã]";
          }
          // 3. Giải mã tin nhắn NGƯỜI KHÁC gửi cho mình
          else if (!isMe && msg.encryptedAesKey && myPrivateKey) {
            const decryptedString = await E2EE.decryptMessage(
              msg,
              myPrivateKey,
            );

            // Tách dữ liệu
            const parsed = parseDecryptedPayload(decryptedString, msg.image);
            plainText = parsed.text;
            finalImage = parsed.image;
          }

          return { ...msg, text: plainText, image: finalImage };
        }),
      );

      set({ messages: decryptedMessages });
    } catch (error) {
      console.log("Lỗi lấy tin nhắn:", error);
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  sendMessage: async (messageData) => {
    try {
      const { messages, selectedUser } = get();
      let payloadToSend = { text: messageData.text, image: messageData.image };

      // [E2EE] MÃ HÓA TIN NHẮN & HÌNH ẢNH TRƯỚC KHI GỬI
      if (selectedUser.publicKey) {
        const { authUser } = useAuthStore.getState();

        // [QUAN TRỌNG] Đóng gói cả Chữ và Ảnh vào chung 1 chuỗi JSON
        const combinedPayload = JSON.stringify({
          text: messageData.text || "",
          image: messageData.image || "",
        });

        // Bắt đầu đem toàn bộ cục JSON đó đi mã hóa
        const encryptedData = await E2EE.encryptMessage(
          combinedPayload,
          selectedUser.publicKey,
          authUser.publicKey,
        );

        // Ghi đè Payload gửi lên Server:
        // Ẩn toàn bộ ảnh đi (để trống), vì lúc này ảnh đã bị mã hóa nén hết vào trường 'text'
        payloadToSend = {
          ...encryptedData,
          image: "",
        };
      }

      const res = await axiosInstance.post(
        `/messages/send/${messageData.receiverId}`,
        payloadToSend,
      );

      // Hiển thị tạm thời tin nhắn GỐC lên màn hình của người gửi
      const newMessageForMe = {
        ...res.data,
        text: messageData.text,
        image: messageData.image,
      };
      set({ messages: [...messages, newMessageForMe] });
    } catch (error) {
      console.log("Lỗi gửi tin nhắn:", error);
    }
  },

  subscribeToMessages: () => {
    const { selectedUser } = get();
    if (!selectedUser) return;
    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    socket.on("newMessage", async (newMessage) => {
      if (newMessage.senderId === selectedUser._id) {
        const { myPrivateKey } = useAuthStore.getState();

        // [E2EE] GIẢI MÃ TIN NHẮN REAL-TIME
        let plainText = newMessage.text;
        let finalImage = newMessage.image;

        if (newMessage.encryptedAesKey && myPrivateKey) {
          const decryptedString = await E2EE.decryptMessage(
            newMessage,
            myPrivateKey,
          );

          // Tách dữ liệu chữ và ảnh ra
          const parsed = parseDecryptedPayload(
            decryptedString,
            newMessage.image,
          );
          plainText = parsed.text;
          finalImage = parsed.image;
        }

        const decryptedMessage = {
          ...newMessage,
          text: plainText,
          image: finalImage,
        };
        set({ messages: [...get().messages, decryptedMessage] });
      }
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (socket) {
      socket.off("newMessage");
    }
  },
}));
