import axios from "axios";
import config from "../constants/config";

export const testConnection = async () => {
  try {
    console.log("🔍 Testing connection to:", `${config.apiUrl}/api`);

    // Test basic connectivity with shorter timeout
    const response = await axios.get(`${config.apiUrl}/api`, {
      timeout: 3000,
    });

    console.log("✅ Server reachable:", response.status, response.data);
    return true;
  } catch (error: any) {
    console.error("❌ Connection test failed:");
    console.error("  Error message:", error.message);
    console.error("  Code:", error.code);
    console.error("  URL:", error.config?.url);
    console.error("  Config API URL:", config.apiUrl);

    let errorMsg = "Cannot connect to server";

    if (error.code === "ECONNREFUSED") {
      errorMsg = "Server tidak running atau IP/port salah";
      console.error("  💡 Check: Is server running? Correct IP in .env?");
    } else if (error.code === "ETIMEDOUT" || error.code === "ECONNABORTED") {
      errorMsg = "Connection timeout. Periksa WiFi dan firewall";
      console.error("  💡 Check: Same WiFi? Windows Firewall allows Node.js?");
    } else if (error.code === "ENOTFOUND") {
      errorMsg = "IP address tidak ditemukan";
      console.error("  💡 Check: Run 'ipconfig' and update .env");
    } else if (error.code === "ERR_NETWORK") {
      errorMsg = "Network error. Expo belum reload .env?";
      console.error("  💡 RESTART Expo with: npx expo start --clear");
    }

    console.error("=".repeat(60));
    console.error("⚠️  CONNECTION FAILED");
    console.error("📍 Trying to reach:", config.apiUrl);
    console.error("💡 Solution:", errorMsg);
    console.error("=".repeat(60));

    // Don't show alert on first load, just log
    return false;
  }
};

export const testAuthEndpoint = async () => {
  try {
    console.log("🔍 Testing auth endpoint...");

    // Try to POST to login (will fail with validation error, but proves endpoint works)
    const response = await axios.post(
      `${config.apiUrl}/api/auth/login`,
      {},
      { timeout: 5000, validateStatus: () => true }
    );

    console.log("✅ Auth endpoint status:", response.status);
    console.log("   Response:", response.data);
    return true;
  } catch (error: any) {
    console.error("❌ Auth endpoint test failed:");
    console.error("  Error:", error.message);
    console.error("  Code:", error.code);
    return false;
  }
};
