import axios from "axios";

export async function loginUser(apiUrl, username, password) {
  try {
    const res = await axios.post(`${apiUrl}/api/auth/login`, {
      username,
      password,
    });
    return {
      token: res.data.token,
      user: res.data.user,
    };
  } catch (err) {
    throw err.response?.data?.message || "Login gagal";
  }
}

export async function registerUser(apiUrl, payload) {
  try {
    const res = await axios.post(`${apiUrl}/api/auth/register`, payload);
    return res.data;
  } catch (err) {
    throw err.response?.data?.message || "Registrasi gagal";
  }
}
