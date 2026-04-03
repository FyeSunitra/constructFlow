import { defineStore } from "pinia";
import { clearAuth, setAuth, useAuth } from "../utils/useAuthStorage";
import type { LoginRequest } from "../types/auth";
import { login, logout } from "../services/auth.service";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    user: useAuth("user") || null,
    isAuthenticated: !!useAuth("accessToken"),
  }),

  actions: {
    async login(payload: LoginRequest) {
      const res = await login(payload);

      setAuth({
        accessToken: res.access_token,
        refreshToken: res.refresh_token,
        expiresIn: res.expires_in,
        user: res.user,
      });

      this.user = res.user;
      this.isAuthenticated = true;

      return res;
    },

    async logout() {
      try {
        await logout();
      } catch (e) {
        console.warn("logout api fail", e);
      } finally {
        clearAuth();
        this.user = null;
        this.isAuthenticated = false;
      }
    },
  },
});
