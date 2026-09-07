import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";

export const useAuthStore = create((set) => ({
  authUser: null,
  isCheckingAuth: true,
  isSigningUp: false,
  isSigningIn: false,

  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/auth/check");
      // res.data là thông tin user trả về từ backend
      set({ authUser: res.data });
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

      // 1. Lưu token vào LocalStorage
      localStorage.setItem("chat-token", res.data.data.token);

      // 2. Cập nhật state người dùng
      set({ authUser: res.data.data.user });

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

      // 1. Lưu token vào LocalStorage
      localStorage.setItem("chat-token", res.data.data.token);

      // 2. Cập nhật state người dùng
      set({ authUser: res.data.data.user });

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

      // Xóa token ở Frontend
      localStorage.removeItem("chat-token");
      set({ authUser: null });

      console.log("Đăng xuất thành công!");
    } catch (error) {
      console.log(
        "Lỗi đăng xuất:",
        error.response?.data?.message || error.message,
      );
    }
  },
}));
