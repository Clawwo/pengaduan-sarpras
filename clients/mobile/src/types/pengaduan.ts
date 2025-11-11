export interface KategoriLokasi {
  id_kategori: number;
  nama_kategori: string;
  deskripsi?: string;
  jumlah_lokasi?: number;
  created_at?: string;
}

export interface Lokasi {
  id_lokasi: number;
  nama_lokasi: string;
  id_kategori?: number;
  jumlah_item?: number;
}

export interface Item {
  id_item: number;
  nama_item: string;
  deskripsi?: string;
  foto?: string;
  file_id?: string;
  id_lokasi: number;
  nama_lokasi?: string;
}

export interface CreatePengaduanData {
  nama_pengaduan: string;
  id_item?: number;
  id_temporary?: number;
  id_lokasi: number;
  deskripsi: string;
  foto?: string;
}
