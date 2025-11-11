import React from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface StatCardProps {
  title: string;
  value: number;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  valueColor?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  iconColor = "#d4d4d8", // neutral-300
  valueColor = "#f5f5f5", // neutral-100
}) => {
  return (
    <View className="p-6 border rounded-2xl border-neutral-800 bg-neutral-900/60">
      <View className="mb-4">
        <View className="items-center justify-center w-10 h-10 border rounded-xl border-neutral-700 bg-neutral-800/70">
          <Ionicons name={icon} size={20} color={iconColor} />
        </View>
      </View>
      <Text
        className="text-neutral-300 mb-2 text-[13px]"
        style={{ fontFamily: "Poppins_500Medium" }}
      >
        {title}
      </Text>
      <Text
        className="text-[32px]"
        style={{ color: valueColor, fontFamily: "Poppins_700Bold" }}
      >
        {value}
      </Text>
    </View>
  );
};
