import axios from "axios";

export const getLokasi = async (apiUrl) => {
  const token = localStorage.getItem("token");
  const { data } = await axios.get(`${apiUrl}/api/lokasi`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

export const getItems = async (apiUrl) => {
  const token = localStorage.getItem("token");
  const { data } = await axios.get(`${apiUrl}/api/items`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};
