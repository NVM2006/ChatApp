import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";

export const useAuthStore = create((set) => ({
  authUser: null,
  isCheckingAuth: true,

  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/auth/check");
      set({ authUser: res.data });
    } catch (error) {
      console.log("Error in auth check: ", error);
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signin: async (data) => {
    try {
      const res = await axiosInstance.post("/auth/signin", data);

      localStorage.setItem("chat-token", res.data.data.token);

      set({ authUser: res.data.data.user });
    } catch (error) {
      console.log("Sign in error:", error);
    }
  },

  signout: async () => {
    try {
      await axiosInstance.post("/auth/signout");

      localStorage.removeItem("chat-token");

      set({ authUser: null });
    } catch (error) {
      console.log("Sign out error:", error);
    }
  },
}));
