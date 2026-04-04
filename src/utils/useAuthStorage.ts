import type { User } from "../types/auth";
import { KeyStorage } from "./constant";

type AuthStorage = {
  accessToken?: string;
  refreshToken?: string;
  expiresIn?: number;
  user?: User;
};

function getAuth(): AuthStorage | null {
  try {
    const value = localStorage.getItem(KeyStorage.AUTH);
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
}

export function setAuth(data: AuthStorage) {
  localStorage.setItem(KeyStorage.AUTH, JSON.stringify(data));
}

export function clearAuth() {
  localStorage.removeItem(KeyStorage.AUTH);
}

export function useAuth(
  key: "accessToken" | "refreshToken" | "user" | "expiresIn",
) {
  const raw = localStorage.getItem(KeyStorage.AUTH);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw);
    return parsed[key];
  } catch {
    return null;
  }
}

export function useUser() {
  return useAuth("user");
}

export function useAccessToken() {
  return useAuth("accessToken");
}

export function useRefreshToken() {
  return useAuth("refreshToken");
}
