import api from "./api";
import type { LoginDto, RegisterDto, AuthResponse, User } from "../types";

export const authService = {
  async login(data: LoginDto): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>("/auth/login", data);
    if (response.data.accessToken) {
      localStorage.setItem("token", response.data.accessToken);
    }
    return response.data;
  },

  async register(data: RegisterDto): Promise<void> {
    await api.post("/auth/register", data);
  },

  async getMe(): Promise<User> {
    const response = await api.get<User>("/users/me");
    return response.data;
  },

  async getUsers(): Promise<User[]> {
    const response = await api.get<User[]>("/users");
    return response.data;
  },

  async logout(): Promise<void> {
    try {
      if (localStorage.getItem("token")) {
        await api.post("/auth/logout");
      }
    } catch (error) {
      // Ignore errors during logout (e.g., token already invalid)
    } finally {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem("token");
  },
};
