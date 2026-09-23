import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import { io } from "socket.io-client";
import { E2EE } from "../lib/E2EE.js";

const BASE_URL =
  import.meta.env.MODE === "development" ? "http://localhost:5000" : "/";

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isCheckingAuth: true,
  isSigningUp: false,
  isSigningIn: false,
  socket: null,
  myPrivateKey: null,

  connectSocket: () => {
    const { authUser } = get();
    // Nếu chưa đăng nhập hoặc socket đã kết nối rồi thì không tạo thêm
    if (!authUser || get().socket?.connected) return;

    const socket = io(BASE_URL, {
      query: {
        userId: authUser._id,
      },
      // THÊM ĐOẠN CẤU HÌNH NÀY ĐỂ TRỊ LỖI CỦA RENDER FREE:
      transports: ["websocket"], // Ép buộc dùng chuẩn WebSocket nhanh nhất, cấm lùi về Long-Polling
      reconnection: true, // Cho phép tự động kết nối lại khi bị Render ngắt
      reconnectionAttempts: 15, // Cố gắng kết nối lại tối đa 15 lần
      reconnectionDelay: 2000, // Mỗi lần thử cách nhau 2 giây
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
      const storedKey = localStorage.getItem("chat-private-key");
      if (storedKey) {
        const privKey = await E2EE.importPrivateKey(storedKey);
        set({ myPrivateKey: privKey });
      }
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
      // [E2EE] 1. Tự động đúc 1 cặp khóa RSA
      const keyPair = await E2EE.generateRSAKeyPair();
      const pubKeyBase64 = await E2EE.exportPublicKey(keyPair.publicKey);
      const privKeyBase64 = await E2EE.exportPrivateKey(keyPair.privateKey);

      // [E2EE] 2. Lưu Private Key an toàn ở LocalStorage (Không bao giờ gửi lên Server)
      localStorage.setItem("chat-private-key", privKeyBase64);
      set({ myPrivateKey: keyPair.privateKey });

      // [E2EE] 3. Gắn Public Key vào data để gửi lên Server
      const payload = { ...data, publicKey: pubKeyBase64 };

      const res = await axiosInstance.post("/auth/signup", payload);
      localStorage.setItem("chat-token", res.data.data.token);
      set({ authUser: res.data.data.user });

      get().connectSocket();
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
      const storedKey = localStorage.getItem("chat-private-key");
      if (storedKey) {
        const privKey = await E2EE.importPrivateKey(storedKey);
        set({ myPrivateKey: privKey });
      }
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
      // [QUAN TRỌNG] Xóa Private Key khi đăng xuất để bảo mật
      localStorage.removeItem("chat-private-key");
      set({ authUser: null, myPrivateKey: null });
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
