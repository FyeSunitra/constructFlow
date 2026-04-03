import { http } from "../lib/apiClient";
import type { LoginRequest, LoginResponse } from "../types/auth";

export const login = async (payload: LoginRequest): Promise<LoginResponse> => {
  return await http.post("/auth/login", payload);
};

export const logout = () => http.post("/auth/logout", {});
