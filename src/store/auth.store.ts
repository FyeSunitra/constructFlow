import { defineStore } from "pinia";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    isLogin: false,
    role: "admin" as "admin" | "user",
  }),

  actions: {
    login() {
      this.isLogin = true;
      this.role = "admin";
    },
    logout() {
      this.isLogin = false;
    },
  },
});
