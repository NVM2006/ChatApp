import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import { useAuthStore } from "./useAuthStore.js";

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
      set({ messages: res.data });
    } catch (error) {
      console.log("Lỗi lấy tin nhắn:", error);
    } finally {
      set({ isMessagesLoading: false });
    }
  },
  sendMessage: async (messageData) => {
    try {
      const { messages } = get();
      const res = await axiosInstance.post(
        `/messages/send/${messageData.receiverId}`,
        {
          text: messageData.text,
          image: messageData.image,
        },
      );
      set({ messages: [...messages, res.data] });
    } catch (error) {
      console.log("Lỗi gửi tin nhắn:", error);
    }
  },
  subscribeToMessages: () => {
    const { selectedUser } = get();
    if (!selectedUser) return;
    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    socket.on("newMessage", (newMessage) => {
      if (newMessage.senderId === selectedUser._id) {
        set({ messages: [...get().messages, newMessage] });
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
