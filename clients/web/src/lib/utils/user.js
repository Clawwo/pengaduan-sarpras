import axios from "axios";

export const updateMyProfile = async (apiUrl, payload) => {
  const token = localStorage.getItem("token");
  const res = await axios.put(`${apiUrl}/api/user/me`, payload, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};
