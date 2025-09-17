import axios from "axios";

export const createTemporaryItem = async (
  apiUrl,
  nama_barang_baru,
  id_lokasi
) => {
  const token = localStorage.getItem("token");
  const { data } = await axios.post(
    `${apiUrl}/api/temporary-items`,
    { nama_barang_baru, id_lokasi },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return data;
};
