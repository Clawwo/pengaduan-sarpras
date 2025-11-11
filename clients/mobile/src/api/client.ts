import axios from "axios";
import * as SecureStore from "expo-secure-store";
import config from "../constants/config";

const apiClient = axios.create({
  baseURL: `${config.apiUrl}/api`,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  async (config) => {
    console.log("📤 API Request:", {
      method: config.method?.toUpperCase(),
      url: `${config.baseURL || ""}${config.url || ""}`,
      data: config.data,
    });

    const token = await SecureStore.getItemAsync("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error("❌ Request interceptor error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    console.log("📥 API Response:", {
      status: response.status,
      url: response.config.url,
      data: response.data,
    });
    return response;
  },
  async (error) => {
    console.error("❌ API Error:", {
      message: error.message,
      code: error.code,
      status: error.response?.status,
      url: error.config?.url,
      data: error.response?.data,
    });

    if (error.response?.status === 401) {
      // Token expired or invalid, clear auth
      await SecureStore.deleteItemAsync("authToken");
      await SecureStore.deleteItemAsync("user");
      // You can emit event or use context to redirect to login
    }
    return Promise.reject(error);
  }
);

export default apiClient;
