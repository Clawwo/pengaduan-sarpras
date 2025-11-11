import React from "react";
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  TouchableOpacityProps,
} from "react-native";
import { cn } from "../lib/utils";

interface ButtonProps extends TouchableOpacityProps {
  title?: string;
  children?: React.ReactNode;
  variant?: "primary" | "secondary" | "outline" | "destructive";
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  textClassName?: string;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  children,
  onPress,
  variant = "primary",
  disabled = false,
  loading = false,
  className,
  textClassName,
  ...props
}) => {
  const getButtonClass = () => {
    const base =
      "px-6 py-4 rounded-xl items-center justify-center min-h-[56px]";

    if (disabled) {
      return cn(base, "bg-neutral-700 opacity-60", className);
    }

    switch (variant) {
      case "secondary":
        return cn(base, "bg-neutral-800 border border-neutral-700", className);
      case "outline":
        return cn(base, "bg-transparent border border-orange-600", className);
      case "destructive":
        return cn(base, "bg-red-600 border border-red-700", className);
      default:
        return cn(
          base,
          "bg-orange-600 border border-orange-700 active:bg-orange-500",
          className
        );
    }
  };

  const getTextClass = () => {
    const base = "text-lg font-semibold";

    if (disabled) {
      return cn(base, "text-neutral-400", textClassName);
    }

    switch (variant) {
      case "outline":
        return cn(base, "text-orange-500", textClassName);
      default:
        return cn(base, "text-white", textClassName);
    }
  };

  return (
    <TouchableOpacity
      className={getButtonClass()}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color="white" />
      ) : children ? (
        children
      ) : (
        <Text className={getTextClass()}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};
