import React, { useState } from "react";
import {
  TextInput,
  View,
  Text,
  TextInputProps,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { cn } from "../../lib/utils";

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  hint?: string;
  className?: string;
  containerClassName?: string;
  showPasswordToggle?: boolean;
}

export function Input({
  label,
  error,
  hint,
  className,
  containerClassName,
  showPasswordToggle = false,
  secureTextEntry,
  ...props
}: InputProps) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const isSecure = showPasswordToggle ? !isPasswordVisible : secureTextEntry;

  return (
    <View className={cn("w-full", containerClassName)}>
      {label && (
        <Text className="text-base font-medium text-neutral-300 mb-2.5">
          {label}
        </Text>
      )}
      <View className="relative">
        <TextInput
          className={cn(
            "w-full px-5 py-4 rounded-xl text-base",
            "bg-neutral-900 border border-neutral-800",
            "text-neutral-100",
            "focus:border-orange-500",
            error && "border-red-500",
            showPasswordToggle && "pr-14",
            className
          )}
          placeholderTextColor="rgb(115 115 115)"
          secureTextEntry={isSecure}
          {...props}
        />
        {showPasswordToggle && (
          <TouchableOpacity
            className="absolute right-4 top-0 bottom-0 justify-center"
            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name={isPasswordVisible ? "eye-off-outline" : "eye-outline"}
              size={22}
              color="rgb(163 163 163)"
            />
          </TouchableOpacity>
        )}
      </View>
      {hint && (
        <Text
          className={cn(
            "text-sm mt-2",
            error ? "text-red-400" : "text-neutral-500"
          )}
        >
          {hint}
        </Text>
      )}
      {error && <Text className="text-sm text-red-400 mt-2">{error}</Text>}
    </View>
  );
}
