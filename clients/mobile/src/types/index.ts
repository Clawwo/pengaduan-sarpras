export interface User {
  id_user: number;
  nama_pengguna: string;
  username: string;
  role: "pengguna";
  created_at?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface RegisterRequest {
  nama_pengguna: string;
  username: string;
  password: string;
}

export interface RegisterResponse {
  message: string;
  user?: User;
}

export interface ApiError {
  message: string;
  status?: number;
}

// Pengaduan types
export interface Pengaduan {
  id_pengaduan: number;
  nama_pengaduan: string;
  deskripsi?: string;
  foto?: string;
  file_id?: string;
  status: string;
  saran_petugas?: string;
  id_user: number;
  id_item?: number;
  id_lokasi: number;
  id_temporary?: number;
  created_at: string;
  tgl_selesai?: string;
  nama_item?: string;
  nama_lokasi?: string;
}

export interface CreatePengaduanRequest {
  nama_pengaduan: string;
  deskripsi?: string;
  foto?: any; // File/URI
  id_item?: number;
  id_lokasi: number;
  nama_item_baru?: string;
}

// Reference types
export interface Lokasi {
  id_lokasi: number;
  nama_lokasi: string;
  deskripsi?: string;
}

export interface Item {
  id_item: number;
  nama_item: string;
  deskripsi?: string;
  foto?: string;
  id_lokasi: number;
  nama_lokasi?: string;
}
