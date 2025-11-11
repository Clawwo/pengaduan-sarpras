// API Configuration

// Read from environment variables (Expo uses process.env with EXPO_PUBLIC_ prefix)
const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:5000";
const ENVIRONMENT = process.env.EXPO_PUBLIC_ENV || "dev";

const ENV = {
  dev: {
    apiUrl: API_URL,
  },
  staging: {
    apiUrl: API_URL,
  },
  prod: {
    apiUrl: API_URL,
  },
};

const getEnvVars = (env = ENVIRONMENT) => {
  if (env === "prod") return ENV.prod;
  if (env === "staging") return ENV.staging;
  return ENV.dev;
};

const config = getEnvVars();

// Log untuk debugging (hapus di production)
console.log("=".repeat(60));
console.log("🔧 API Configuration Loaded");
console.log("=".repeat(60));
console.log("📍 API URL:", config.apiUrl);
console.log("📍 Base URL:", `${config.apiUrl}/api`);
console.log("🌍 Environment:", ENVIRONMENT);
console.log("⚠️  If IP is wrong, you MUST restart Expo with --clear flag!");
console.log("   Command: npx expo start --clear");
console.log("=".repeat(60));

export default config;
