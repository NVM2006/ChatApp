import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import { io } from "socket.io-client";

const BASE_URL =
  import.meta.env.MODE === "development" ? "http://localhost:5000" : "/";

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isCheckingAuth: true,
  isSigningUp: false,
  isSigningIn: false,
  socket: null,

  connectSocket: () => {
    const { authUser } = get();
    if (!authUser || get().socket?.connected) return;

    const socket = io(BASE_URL, {
      query: {
        userId: authUser._id,
      },
    });

    socket.connect();
    set({ socket });
  },

  disconnectSocket: () => {
    if (get().socket?.connected) {
      get().socket.disconnect();
      set({ socket: null });
    }
  },

  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/auth/check");
      set({ authUser: res.data });
      get().connectSocket();
    } catch (error) {
      console.log("Error in auth check: ", error);
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signup: async (data) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post("/auth/signup", data);
      localStorage.setItem("chat-token", res.data.data.token);
      set({ authUser: res.data.data.user });
      get().connectSocket();
      console.log("Đăng ký thành công!");
    } catch (error) {
      console.log(
        "Lỗi đăng ký:",
        error.response?.data?.message || error.message,
      );
    } finally {
      set({ isSigningUp: false });
    }
  },

  signin: async (data) => {
    set({ isSigningIn: true });
    try {
      const res = await axiosInstance.post("/auth/signin", data);
      localStorage.setItem("chat-token", res.data.data.token);
      set({ authUser: res.data.data.user });
      get().connectSocket();
      console.log("Đăng nhập thành công!");
    } catch (error) {
      console.log(
        "Lỗi đăng nhập:",
        error.response?.data?.message || error.message,
      );
    } finally {
      set({ isSigningIn: false });
    }
  },

  signout: async () => {
    try {
      // Vẫn gọi API signout để Backend xóa Cookie (nếu bạn có dùng)
      await axiosInstance.post("/auth/signout");
      localStorage.removeItem("chat-token");
      set({ authUser: null });
      get().disconnectSocket();
      console.log("Đăng xuất thành công!");
    } catch (error) {
      console.log(
        "Lỗi đăng xuất:",
        error.response?.data?.message || error.message,
      );
    }
  },
}));
