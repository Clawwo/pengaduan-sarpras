import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { PieChart } from "react-native-svg-charts";
import { PengaduanStats } from "../hooks/usePengaduan";
import { Ionicons } from "@expo/vector-icons";

interface StatusChartProps {
  stats: PengaduanStats;
}

export const StatusChart: React.FC<StatusChartProps> = ({ stats }) => {
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  const data = [
    {
      key: "diajukan",
      value: stats.diajukan,
      svg: {
        fill: "#fbbf24",
        fillOpacity: selectedKey === "diajukan" || !selectedKey ? 1 : 0.3,
      },
      label: "Diajukan",
      color: "#fbbf24",
    },
    {
      key: "proses",
      value: stats.proses,
      svg: {
        fill: "#60a5fa",
        fillOpacity: selectedKey === "proses" || !selectedKey ? 1 : 0.3,
      },
      label: "Proses",
      color: "#60a5fa",
    },
    {
      key: "diterima",
      value: stats.diterima,
      svg: {
        fill: "#34d399",
        fillOpacity: selectedKey === "diterima" || !selectedKey ? 1 : 0.3,
      },
      label: "Diterima",
      color: "#34d399",
    },
    {
      key: "ditolak",
      value: stats.ditolak,
      svg: {
        fill: "#f87171",
        fillOpacity: selectedKey === "ditolak" || !selectedKey ? 1 : 0.3,
      },
      label: "Ditolak",
      color: "#f87171",
    },
  ];

  return (
    <View className="p-6 border bg-neutral-900/60 border-neutral-800 rounded-2xl">
      <View className="flex-row items-center mb-6">
        <View className="items-center justify-center w-10 h-10 mr-3 border rounded-xl border-neutral-700 bg-neutral-800/70">
          <Ionicons name="pie-chart" size={22} color="#d4d4d8" />
        </View>
        <View className="flex-1">
          <Text
            className="text-neutral-100 text-[23px]"
            style={{ fontFamily: "Poppins_700Bold" }}
          >
            Distribusi Status
          </Text>
          <Text
            className="text-neutral-400 text-[15px]"
            style={{ fontFamily: "Poppins_400Regular" }}
          >
            {selectedKey
              ? "Tap lagi untuk lihat semua"
              : "Tap untuk lihat detail"}
          </Text>
        </View>
      </View>

      {stats.total === 0 ? (
        <View className="items-center py-16">
          <Ionicons name="stats-chart-outline" size={64} color="#404040" />
          <Text
            className="mt-5 text-neutral-500 text-[14px]"
            style={{ fontFamily: "Poppins_400Regular" }}
          >
            Belum ada data untuk ditampilkan
          </Text>
        </View>
      ) : (
        <View className="flex-row items-center justify-center px-2">
          {/* Donut Chart */}
          <View style={{ width: 150, height: 150 }}>
            <PieChart
              style={{ height: 150, width: 150 }}
              data={data}
              innerRadius="60%"
              outerRadius="100%"
              padAngle={0}
            />
            {/* Center Info */}
            <View
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              {selectedKey ? (
                <>
                  <Text
                    className="text-[36px]"
                    style={{
                      color:
                        data.find((d) => d.key === selectedKey)?.color ||
                        "#f5f5f5",
                      fontFamily: "Poppins_700Bold",
                    }}
                  >
                    {data.find((d) => d.key === selectedKey)?.value}
                  </Text>
                </>
              ) : (
                <>
                  <Text
                    className="text-[36px] text-neutral-100"
                    style={{ fontFamily: "Poppins_700Bold" }}
                  >
                    {stats.total}
                  </Text>
                </>
              )}
            </View>
          </View>

          {/* Legend */}
          <View className="ml-20">
            {data.map((item) => {
              const isSelected = selectedKey === item.key;
              const isOtherSelected = selectedKey && selectedKey !== item.key;

              return (
                <TouchableOpacity
                  key={item.key}
                  onPress={() =>
                    setSelectedKey(selectedKey === item.key ? null : item.key)
                  }
                  activeOpacity={0.7}
                  className="flex-row items-center mb-4"
                  style={{
                    opacity: isOtherSelected ? 0.4 : 1,
                  }}
                >
                  <View
                    className="w-4 h-4 mr-3 rounded-full"
                    style={{
                      backgroundColor: item.color,
                      transform: [{ scale: isSelected ? 1.2 : 1 }],
                    }}
                  />
                  <View>
                    <Text
                      className="text-[17px]"
                      style={{
                        color: isSelected ? item.color : "#e5e5e5",
                        fontFamily: isSelected
                          ? "Poppins_700Bold"
                          : "Poppins_500Medium",
                      }}
                    >
                      {item.label}
                    </Text>
                    <Text
                      className="text-[15px]"
                      style={{
                        color: isSelected ? item.color : "#a3a3a3",
                        fontFamily: "Poppins_600SemiBold",
                      }}
                    >
                      {item.value} Pengaduan
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      )}
    </View>
  );
};
