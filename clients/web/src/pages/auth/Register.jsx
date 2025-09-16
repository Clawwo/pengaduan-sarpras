import React, { useMemo, useState } from "react";
import { useAppConfig } from "../../lib/useAppConfig";
import { registerUser } from "../../lib/utils/auth.js";
import { useNavigate } from "react-router-dom";
import { RegisterForm } from "../../components/ui/form/register-form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const Register = () => {
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [logoFailed, setLogoFailed] = useState(false);
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState([]); // queue of { type, title, description, duration, onClosed }

  const { apiUrl } = useAppConfig();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const username = String(form.get("username") || "");
    const nama = String(form.get("nama") || "");
    const password = String(form.get("password") || "");
    const confirmPassword = String(form.get("confirmPassword") || "");

    if (password !== confirmPassword) {
      setAlerts((prev) => [
        ...prev,
        {
          type: "destructive",
          title: "Konfirmasi password tidak cocok",
          description:
            "Silakan periksa kembali password dan konfirmasi password Anda.",
          duration: 3500,
        },
      ]);
      return;
    }
    setLoading(true);
    try {
      await registerUser(apiUrl, { username, password, nama_pengguna: nama });
      setAlerts((prev) => [
        ...prev,
        {
          type: "default",
          title: "Registrasi berhasil",
          description:
            "Akun Anda telah dibuat. Mengarahkan ke halaman login...",
          duration: 2500,
          onClosed: () => navigate("/"),
        },
      ]);
    } catch (msg) {
      setAlerts((prev) => [
        ...prev,
        {
          type: "destructive",
          title: "Gagal registrasi",
          description: String(msg),
          duration: 3500,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Simple live validation states
  const isUsernameInvalid = useMemo(
    () => username.trim().length > 0 && username.trim().length < 3,
    [username]
  );
  const isPasswordInvalid = useMemo(
    () => password.length > 0 && password.length < 8,
    [password]
  );

  return (
    <>
      <div className="bg-neutral-950 text-neutral-100 flex min-h-svh flex-col items-center justify-center p-6">
        {alerts[0] && (
          <Alert
            floating
            position="top-center"
            variant={alerts[0].type}
            onClose={() => {
              const closed = alerts[0];
              setAlerts((prev) => prev.slice(1));
              if (closed && typeof closed.onClosed === "function") {
                closed.onClosed();
              }
            }}
            duration={alerts[0].duration ?? 3500}
          >
            <AlertTitle>{alerts[0].title}</AlertTitle>
            {alerts[0].description && (
              <AlertDescription>{alerts[0].description}</AlertDescription>
            )}
          </Alert>
        )}
        <div className="w-full max-w-sm">
          {/* Branding di atas judul form */}
          <div className="mb-6 flex items-center justify-center gap-2 select-none">
            {logoFailed ? (
              <div className="size-9 grid place-items-center rounded-full bg-orange-600/10 text-orange-500 ring-1 ring-orange-500/30">
                ⌘
              </div>
            ) : (
              <img
                src="/logo.svg"
                alt="Logo"
                className="size-9 rounded-full ring-1 ring-orange-500/30 object-contain bg-orange-600/10 p-1"
                onError={() => setLogoFailed(true)}
              />
            )}
            <span className="font-semibold tracking-wide text-neutral-100">
              Sarpras
            </span>
          </div>

          {/* Register Form (dark + orange, sama dengan Login) */}
          <RegisterForm
            onSubmit={handleSubmit}
            isLoading={loading}
            // live validation + handlers
            isUsernameInvalid={isUsernameInvalid}
            isPasswordInvalid={isPasswordInvalid}
            onUsernameChange={(e) => setUsername(e.target.value)}
            onPasswordChange={(e) => setPassword(e.target.value)}
          />
        </div>
      </div>
    </>
  );
};

export default Register;
