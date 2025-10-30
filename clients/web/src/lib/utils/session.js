// Simple session utilities to centralize auth state

const TOKEN_KEY = "token";
const USER_KEY = "user";

export function setSession(token, user) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY) || null;
}

export function getUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function decodeJwt(token) {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = JSON.parse(atob(parts[1]));
    return payload || null;
  } catch {
    return null;
  }
}

export function getRole() {
  const token = getToken();
  if (token) {
    const payload = decodeJwt(token);
    const role = payload?.role || getUser()?.role || null;
    return role ? String(role).toLowerCase() : null;
  }
  const role = getUser()?.role || null;
  return role ? String(role).toLowerCase() : null;
}

export function isTokenExpired(token) {
  const payload = decodeJwt(token);
  if (!payload) return true;
  if (!payload.exp) return false; // if no exp, treat as not expired
  const nowSec = Math.floor(Date.now() / 1000);
  return nowSec >= payload.exp;
}

export function isAuthenticated() {
  const token = getToken();
  if (!token) return false;
  return !isTokenExpired(token);
}

export function getSession() {
  return { token: getToken(), user: getUser(), role: getRole() };
}
