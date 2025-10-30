import { io } from "socket.io-client";
import { AppConfigContext } from "./AppContext.jsx";
import React from "react";

let socket;

export function useSocket() {
  const { apiUrl } = React.useContext(AppConfigContext);
  const url = apiUrl?.replace(/\/$/, "");
  if (!socket) {
    socket = io(url, { withCredentials: true });
  }
  return socket;
}

export function getSocketSingleton(baseUrl) {
  const url = (baseUrl || "").replace(/\/$/, "");
  if (!socket) socket = io(url, { withCredentials: true });
  return socket;
}
