import React from "react";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { AppConfigProvider } from "./lib/AppContext.jsx";
import { NotificationProvider } from "./contexts/NotificationContext.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AppConfigProvider>
      <NotificationProvider>
        <App />
      </NotificationProvider>
    </AppConfigProvider>
  </StrictMode>
);
