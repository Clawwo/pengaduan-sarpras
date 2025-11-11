// Theme constants untuk konsistensi design
export const colors = {
  // Primary
  primary: "#f97316", // orange-500
  primaryDark: "#ea580c", // orange-600
  primaryLight: "#fb923c", // orange-400

  // Neutral/Background
  background: "#0a0a0a", // neutral-950
  surface: "#171717", // neutral-900
  surfaceLight: "#262626", // neutral-800

  // Text
  text: "#fafafa", // neutral-50
  textSecondary: "#a3a3a3", // neutral-400
  textMuted: "#737373", // neutral-500

  // Status
  success: "#10b981", // emerald-500
  error: "#ef4444", // red-500
  warning: "#f59e0b", // amber-500
  info: "#3b82f6", // blue-500

  // Border
  border: "#27272a", // neutral-800
  borderLight: "#3f3f46", // neutral-700

  // Others
  white: "#ffffff",
  black: "#000000",
  transparent: "transparent",
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
};

export const fontSize = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const fontWeight = {
  normal: "400" as const,
  medium: "500" as const,
  semibold: "600" as const,
  bold: "700" as const,
};
