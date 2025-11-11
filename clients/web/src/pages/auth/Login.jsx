import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppConfig } from "../../lib/useAppConfig";
import { loginUser } from "../../lib/utils/auth.js";
import { LoginForm } from "../../components/ui/form/login-form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const Login = () => {
  const navigate = useNavigate();
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
      if (role === "pengguna") navigate("/dashboard", { replace: true });
      else if (role === "admin") navigate("/admin", { replace: true });
      else if (role === "petugas") navigate("/petugas", { replace: true });
      else navigate("/", { replace: true });
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
      <div className="flex flex-col items-center justify-center p-6 bg-neutral-950 text-neutral-100 min-h-svh">
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
          <div className="flex items-center justify-center gap-2 mb-6 select-none">
            <div className="grid text-orange-500 rounded-full size-9 place-items-center bg-orange-600/10 ring-1 ring-orange-500/30">
              ⌘
            </div>
            <span className="font-semibold tracking-wide text-neutral-100">
              SMKN 1 BANTUL
            </span>
          </div>
          <LoginForm onSubmit={onSubmit} isLoading={loading} />
        </div>
      </div>
    </>
  );
};

export default Login;
