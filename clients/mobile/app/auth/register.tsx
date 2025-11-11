import React, { useState, useMemo } from "react";
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

export default function RegisterScreen() {
  const { register } = useAuth();
  const [nama, setNama] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Alert states
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    type: "error" as "success" | "error" | "info" | "warning",
    title: "",
    message: "",
    onConfirm: undefined as (() => void) | undefined,
  });

  const showAlert = (
    type: "success" | "error" | "info" | "warning",
    title: string,
    message: string,
    onConfirm?: () => void
  ) => {
    setAlertConfig({ type, title, message, onConfirm });
    setAlertVisible(true);
  };

  // Live validation
  const isUsernameInvalid = useMemo(
    () => username.trim().length > 0 && username.trim().length < 3,
    [username]
  );
  const isPasswordInvalid = useMemo(
    () => password.length > 0 && password.length < 8,
    [password]
  );

  const handleRegister = async () => {
    // Validation
    if (!nama.trim()) {
      showAlert("error", "Nama Kosong", "Silakan masukkan nama lengkap Anda");
      return;
    }

    if (nama.trim().length < 3) {
      showAlert("error", "Nama Terlalu Pendek", "Nama minimal 3 karakter");
      return;
    }

    if (!username.trim()) {
      showAlert("error", "Username Kosong", "Silakan masukkan username Anda");
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

    if (!password) {
      showAlert("error", "Password Kosong", "Silakan masukkan password Anda");
      return;
    }

    if (password.length < 8) {
      showAlert(
        "error",
        "Password Terlalu Pendek",
        "Password minimal 8 karakter untuk keamanan akun Anda"
      );
      return;
    }

    if (!confirmPassword) {
      showAlert(
        "error",
        "Konfirmasi Password Kosong",
        "Silakan ulangi password Anda"
      );
      return;
    }

    if (password !== confirmPassword) {
      showAlert(
        "error",
        "Password Tidak Sama",
        "Password dan konfirmasi password harus sama"
      );
      return;
    }

    try {
      setLoading(true);
      await register({
        nama_pengguna: nama.trim(),
        username: username.trim(),
        password,
      });

      showAlert(
        "success",
        "Registrasi Berhasil! 🎉",
        "Akun Anda telah dibuat. Silakan login untuk melanjutkan",
        () => router.replace("/auth/login")
      );
    } catch (error: any) {
      showAlert(
        "error",
        "Registrasi Gagal",
        error.message || "Terjadi kesalahan saat registrasi. Silakan coba lagi"
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
                Buat Akun Pengguna
              </Text>
              <Text className="text-base text-neutral-400 text-center px-4">
                Daftar untuk mulai mengajukan aduan.
              </Text>
            </View>

            {/* Inputs */}
            <View className="gap-6">
              <Input
                label="Nama Pengguna"
                placeholder="Masukkan Nama"
                value={nama}
                onChangeText={setNama}
                autoCapitalize="words"
                autoCorrect={false}
                editable={!loading}
              />

              <Input
                label="Username"
                placeholder="Masukkan Username"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
                error={
                  isUsernameInvalid ? "Username minimal 3 karakter" : undefined
                }
              />

              <Input
                label="Password"
                placeholder="Masukkan Password"
                value={password}
                onChangeText={setPassword}
                showPasswordToggle={true}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
                hint="Password minimal 8 karakter"
                error={
                  isPasswordInvalid ? "Password minimal 8 karakter" : undefined
                }
              />

              <Input
                label="Konfirmasi Password"
                placeholder="Ulangi Password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                showPasswordToggle={true}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
              />

              <Button
                title={loading ? "Memproses..." : "Daftar"}
                onPress={handleRegister}
                disabled={loading}
                loading={loading}
                className="w-full mt-3"
              />
            </View>

            {/* Login Link */}
            <View className="flex-row justify-center mt-8">
              <Text className="text-base text-neutral-400">
                Sudah punya akun?{" "}
              </Text>
              <Link href="/auth/login" asChild>
                <Text className="text-base text-neutral-200 underline font-medium">
                  Login
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
        onConfirm={alertConfig.onConfirm}
      />
    </SafeAreaView>
  );
}
