import pool from "../config/dbConfig.js";

export const tambahLokasi = async (req, res) => {
  const { nama_lokasi } = req.body;
  try {
    await pool.query("CALL tambahLokasi(?)", [nama_lokasi]);
    res.status(200).json({ message: "Lokasi berhasil ditambahkan" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Gagal menambahkan lokasi" });
  }
};

export const ambilSemuaLokasi = async (req, res) => {
  try {
    const [query] = await pool.query(`
      SELECT l.id_lokasi, l.nama_lokasi, ll.id_list
      FROM pengaduan_sarpras_lokasi l
      LEFT JOIN pengaduan_sarpras_list_lokasi ll ON l.id_lokasi = ll.id_lokasi
    `);
    res.status(200).json(query);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Gagal mengambil data lokasi" });
  }
};

export const updateLokasi = async (req, res) => {
  const { id_lokasi } = req.params;
  const { nama_lokasi } = req.body;
  try {
    await pool.query(
      "UPDATE pengaduan_sarpras_lokasi SET nama_lokasi = ? WHERE id_lokasi = ?",
      [nama_lokasi, id_lokasi]
    );
    res.status(200).json({ message: "Lokasi berhasil diperbarui" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Gagal memperbarui lokasi" });
  }
};

export const hapusLokasi = async (req, res) => {
  const { id_lokasi } = req.params;
  try {
    await pool.query("CALL hapusLokasi(?)", [id_lokasi]);
    res.status(200).json({ message: "Lokasi berhasil dihapus" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Gagal menghapus lokasi" });
  }
};
