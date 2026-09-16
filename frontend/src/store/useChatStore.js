import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import { useAuthStore } from "./useAuthStore.js";
import { E2EE } from "../lib/E2EE.js";

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
          // 1. Nếu đây là tin nhắn do MÌNH gửi đi:
          // Vì nó được mã hóa bằng Public Key của người nhận, nên Private Key của mình KHÔNG THỂ mở được.
          if (msg.senderId === authUser._id && msg.encryptedAesKey) {
            return { ...msg, text: "[Tin nhắn bạn đã gửi - Mã hóa E2EE]" };
          }

          // 2. Nếu đây là tin nhắn NGƯỜI KHÁC gửi cho mình:
          // Dùng Private Key của mình để giải mã
          if (msg.encryptedAesKey && myPrivateKey) {
            const plainText = await E2EE.decryptMessage(msg, myPrivateKey);
            return { ...msg, text: plainText };
          }

          // 3. Tin nhắn cũ (chưa áp dụng mã hóa)
          return msg;
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

      // Khởi tạo Payload mặc định
      let payloadToSend = { text: messageData.text, image: messageData.image };

      // [E2EE] MÃ HÓA TIN NHẮN TRƯỚC KHI GỬI
      if (selectedUser.publicKey) {
        // Dùng Public Key của người nhận để mã hóa
        const encryptedData = await E2EE.encryptMessage(
          messageData.text,
          selectedUser.publicKey,
        );
        payloadToSend = { ...payloadToSend, ...encryptedData };
      }

      // Gửi mớ dữ liệu hỗn độn (đã mã hóa) lên Server
      const res = await axiosInstance.post(
        `/messages/send/${messageData.receiverId}`,
        payloadToSend,
      );

      // Hiển thị tạm thời tin nhắn GỐC lên màn hình của người gửi để họ đọc được
      const newMessageForMe = { ...res.data, text: messageData.text };
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

        // [E2EE] GIẢI MÃ TIN NHẮN REAL-TIME VỪA NHẬN ĐƯỢC
        let plainText = newMessage.text;
        if (newMessage.encryptedAesKey && myPrivateKey) {
          plainText = await E2EE.decryptMessage(newMessage, myPrivateKey);
        }

        const decryptedMessage = { ...newMessage, text: plainText };
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
