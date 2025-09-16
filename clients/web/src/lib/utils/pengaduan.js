import axios from "axios";

export const getRiwayatPengaduan = async (apiUrl) => {
  const token = localStorage.getItem("token");
  const { data } = await axios.get(`${apiUrl}/api/pengaduan/pengaduanku`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

export const createPengaduan = async (apiUrl, payload) => {
  // payload: { nama_pengaduan, deskripsi, id_item, id_lokasi, foto?: File }
  const token = localStorage.getItem("token");
  const form = new FormData();
  Object.entries(payload).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") form.append(k, v);
  });
  const { data } = await axios.post(`${apiUrl}/api/pengaduan`, form, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data",
    },
  });
  return data;
};
