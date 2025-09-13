/* eslint-disable react-refresh/only-export-components */
import React, { createContext } from "react";

export const AppConfigContext = createContext({
  apiUrl: import.meta.env.VITE_API_URL || "http://localhost:5000",
});
export const AppConfigProvider = ({ children }) => {
  const config = {
    apiUrl: import.meta.env.VITE_API_URL || "http://localhost:5000",
  };
  return (
    <AppConfigContext.Provider value={config}>
      {children}
    </AppConfigContext.Provider>
  );
};

