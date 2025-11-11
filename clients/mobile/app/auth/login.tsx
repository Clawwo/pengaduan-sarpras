import React, { useState } from "react";
import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Link, router } from "expo-router";
import { useAuth } from "../../src/contexts/AuthContext";
import { Input } from "../../src/components/ui/Input";
import { Button } from "../../src/components/Button";
import { CustomAlert } from "../../src/components/CustomAlert";

export default function LoginScreen() {
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Alert states
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    type: "error" as "success" | "error" | "info" | "warning",
    title: "",
    message: "",
  });

  const showAlert = (
    type: "success" | "error" | "info" | "warning",
    title: string,
    message: string
  ) => {
    setAlertConfig({ type, title, message });
    setAlertVisible(true);
  };

  const handleLogin = async () => {
    // Validation
    if (!username.trim()) {
      showAlert("error", "Username Kosong", "Silakan masukkan username Anda");
      return;
    }

    if (!password.trim()) {
      showAlert("error", "Password Kosong", "Silakan masukkan password Anda");
      return;
    }

    if (username.trim().length < 3) {
      showAlert(
        "error",
        "Username Terlalu Pendek",
        "Username minimal 3 karakter"
      );
      return;
    }

    try {
      setLoading(true);
      await login({ username: username.trim(), password });
      router.replace("/main");
    } catch (error: any) {
      showAlert(
        "error",
        "Login Gagal",
        error.message || "Username atau password salah. Silakan coba lagi"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-neutral-950">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          contentContainerClassName="flex-grow justify-center p-6"
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo & Brand Section */}
          <View className="items-center mb-16">
            {/* Logo */}
            <View className="mb-6">
              <View className="w-20 h-20 rounded-full bg-orange-600/10 border border-orange-500/30 items-center justify-center">
                <Text className="text-5xl text-orange-500 font-bold">⌘</Text>
              </View>
            </View>

            {/* Brand Name */}
            <Text className="text-3xl font-bold text-neutral-100">Sarpras</Text>
          </View>

          {/* Form Section */}
          <View className="w-full px-2">
            {/* Welcome Title & Description */}
            <View className="items-center mb-8">
              <Text className="text-2xl font-bold text-white mb-3">
                Masuk ke akun
              </Text>
              <Text className="text-base text-neutral-400 text-center px-4">
                Masukkan username dan kata sandi untuk melanjutkan.
              </Text>
            </View>

            {/* Inputs */}
            <View className="gap-6">
              <Input
                label="Username"
                placeholder="Masukkan Username"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
              />

              <Input
                label="Kata sandi"
                placeholder="Masukkan Kata Sandi"
                value={password}
                onChangeText={setPassword}
                showPasswordToggle={true}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
              />

              <Button
                title={loading ? "Memproses..." : "Masuk"}
                onPress={handleLogin}
                disabled={loading}
                loading={loading}
                className="w-full mt-3"
              />
            </View>

            {/* Register Link */}
            <View className="flex-row justify-center mt-8">
              <Text className="text-base text-neutral-400">
                Belum punya akun?{" "}
              </Text>
              <Link href="/auth/register" asChild>
                <Text className="text-base text-neutral-200 underline font-medium">
                  Daftar
                </Text>
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Custom Alert */}
      <CustomAlert
        visible={alertVisible}
        type={alertConfig.type}
        title={alertConfig.title}
        message={alertConfig.message}
        onClose={() => setAlertVisible(false)}
      />
    </SafeAreaView>
  );
}
