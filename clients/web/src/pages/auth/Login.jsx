import React, { useState } from "react";
import { useAppConfig } from "../../lib/useAppConfig";
import { loginUser } from "../../lib/utils/auth.js";
import { LoginForm } from "../../components/ui/form/login-form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [alerts, setAlerts] = useState([]); // queue of {type, title, description, duration, onClosed}
  const { apiUrl } = useAppConfig();

  const currentAlert = alerts[0] || null;
  const pushAlert = (a) => setAlerts((prev) => [...prev, a]);
  const handleAlertClose = () => {
    const closed = alerts[0];
    setAlerts((prev) => prev.slice(1));
    if (closed && typeof closed.onClosed === "function") closed.onClosed();
  };

  // Bridge the shared LoginForm with our backend login flow
  const onSubmit = async (e) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const username = form.get("username");
    const password = form.get("password");
    if (!username || !password) return;

    try {
      setLoading(true);
      // Backend expects username + password
      const res = await loginUser(apiUrl, String(username), String(password));
      localStorage.setItem("token", res.token);
      localStorage.setItem("user", JSON.stringify(res.user));
      const role = res.user.role;
      if (role === "pengguna") window.location.href = "/dashboard";
      else if (role === "admin") window.location.href = "/admin";
      else if (role === "petugas") window.location.href = "/petugas";
      else window.location.href = "/";
    } catch (msg) {
      pushAlert({
        type: "destructive",
        title: "Login gagal",
        description: String(msg),
        duration: 3500,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="bg-neutral-950 text-neutral-100 flex min-h-svh flex-col items-center justify-center p-6">
        {currentAlert && (
          <Alert
            floating
            position="top-center"
            variant={currentAlert.type}
            onClose={handleAlertClose}
            duration={currentAlert.duration ?? 3500}
          >
            <AlertTitle>{currentAlert.title}</AlertTitle>
            {currentAlert.description && (
              <AlertDescription>{currentAlert.description}</AlertDescription>
            )}
          </Alert>
        )}
        <div className="w-full max-w-sm">
          <div className="mb-6 flex items-center justify-center gap-2 select-none">
            <div className="size-9 grid place-items-center rounded-full bg-orange-600/10 text-orange-500 ring-1 ring-orange-500/30">
              ⌘
            </div>
            <span className="font-semibold tracking-wide text-neutral-100">
              Sarpras
            </span>
          </div>
          <LoginForm onSubmit={onSubmit} isLoading={loading} />
        </div>
      </div>
    </>
  );
};

export default Login;
