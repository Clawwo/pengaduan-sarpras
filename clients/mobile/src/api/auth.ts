import apiClient from "./client";
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
} from "../types";

export const authApi = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const { data } = await apiClient.post<LoginResponse>(
      "/auth/login",
      credentials
    );
    return data;
  },

  register: async (userData: RegisterRequest): Promise<RegisterResponse> => {
    const { data } = await apiClient.post<RegisterResponse>(
      "/auth/register",
      userData
    );
    return data;
  },

  updateProfile: async (
    token: string,
    profileData: { nama_pengguna?: string; username?: string }
  ): Promise<{ message: string }> => {
    const { data } = await apiClient.put<{ message: string }>(
      "/user/me",
      profileData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return data;
  },

  // Optional: refresh token if you implement it
  // refreshToken: async () => {
  //   const { data } = await apiClient.post('/auth/refresh');
  //   return data;
  // },
};
