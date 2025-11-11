import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import * as SecureStore from "expo-secure-store";
import { authApi } from "../api/auth";
import type { User, LoginRequest, RegisterRequest } from "../types";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (userData: RegisterRequest) => Promise<{ message: string }>;
  logout: () => Promise<void>;
  updateProfile: (data: {
    nama_pengguna?: string;
    username?: string;
  }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadUser = useCallback(async () => {
    try {
      const token = await SecureStore.getItemAsync("authToken");
      const userStr = await SecureStore.getItemAsync("user");

      if (token && userStr) {
        const userData = JSON.parse(userStr);
        // Only allow pengguna role
        if (userData.role === "pengguna") {
          setUser(userData);
        } else {
          // Clear if not pengguna
          await clearAuth();
        }
      }
    } catch (error) {
      console.error("Failed to load user:", error);
      await clearAuth();
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load user from storage on mount
  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const clearAuth = async () => {
    await SecureStore.deleteItemAsync("authToken");
    await SecureStore.deleteItemAsync("user");
    setUser(null);
  };

  const login = useCallback(async (credentials: LoginRequest) => {
    try {
      const response = await authApi.login(credentials);

      // Validate role is pengguna
      if (response.user.role !== "pengguna") {
        throw new Error("Akses ditolak. Aplikasi ini hanya untuk pengguna.");
      }

      // Save token and user
      await SecureStore.setItemAsync("authToken", response.token);
      await SecureStore.setItemAsync("user", JSON.stringify(response.user));

      setUser(response.user);
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          "Login gagal. Periksa username dan password Anda."
      );
    }
  }, []);

  const register = useCallback(async (userData: RegisterRequest) => {
    try {
      const response = await authApi.register(userData);
      // After register, user needs to login
      // Or auto-login if backend returns token
      return response;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          "Registrasi gagal. Silakan coba lagi."
      );
    }
  }, []);

  const logout = useCallback(async () => {
    await clearAuth();
  }, []);

  const updateProfile = useCallback(
    async (data: { nama_pengguna?: string; username?: string }) => {
      try {
        const token = await SecureStore.getItemAsync("authToken");
        if (!token) {
          throw new Error("Token tidak ditemukan");
        }

        const response = await authApi.updateProfile(token, data);

        // Update user in state and storage
        const updatedUser = {
          ...user!,
          ...(data.nama_pengguna && { nama_pengguna: data.nama_pengguna }),
          ...(data.username && { username: data.username }),
        };

        await SecureStore.setItemAsync("user", JSON.stringify(updatedUser));
        setUser(updatedUser);

        return response;
      } catch (error: any) {
        throw new Error(
          error.response?.data?.message ||
            error.message ||
            "Gagal memperbarui profil"
        );
      }
    },
    [user]
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
