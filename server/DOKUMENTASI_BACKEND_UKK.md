# 📚 DOKUMENTASI BACKEND UKK - SISTEM PENGADUAN SARANA & PRASARANA

**Dibuat oleh:** Farel Hariyadhi  
**Tanggal:** 16 November 2025  
**Tech Stack:** Node.js, Express.js, MySQL, REST API  
**Tujuan:** Dokumentasi lengkap backend untuk Ujian Kompetensi Kejuruan (UKK)

---

## 📋 DAFTAR ISI

1. [Struktur Folder Backend](#1-struktur-folder-backend)
2. [Penjelasan File Utama](#2-penjelasan-file-utama)
3. [Alur Kerja Backend (Flow)](#3-alur-kerja-backend-flow)
4. [Penjelasan API Endpoint](#4-penjelasan-api-endpoint)
5. [Sistem Keamanan](#5-sistem-keamanan)
6. [Optimasi & Saran Perbaikan](#6-optimasi--saran-perbaikan)

---

## 1. STRUKTUR FOLDER BACKEND

```
server/
├── config/                    # ⚙️ Konfigurasi aplikasi
│   ├── dbConfig.js           # Koneksi database MySQL
│   └── imageKitConfig.js     # Konfigurasi upload gambar
│
├── controllers/               # 🎮 Pengendali logika bisnis
│   ├── authController.js     # Login, register, register petugas
│   ├── userController.js     # Update profil, get user info
│   ├── pengaduanController.js # CRUD pengaduan
│   ├── petugasController.js  # Kelola data petugas
│   ├── itemController.js     # Kelola item sarana/prasarana
│   ├── lokasiController.js   # Kelola lokasi
│   ├── notificationController.js # Sistem notifikasi
│   └── ... (lainnya)
│
├── services/                  # 🔧 Lapisan akses database
│   ├── authService.js        # Query database untuk auth
│   ├── pengaduanService.js   # Query database pengaduan
│   ├── userService.js        # Query database user
│   ├── notificationService.js # Query database notifikasi
│   └── ... (lainnya)
│
├── middleware/                # 🛡️ Filter & validasi request
│   ├── authMiddleware.js     # Verifikasi JWT token & role
│   ├── uploadImageMiddleware.js # Upload gambar (Multer)
│   ├── validateInputMiddleware.js # Validasi input user
│   ├── validateFileMiddleware.js # Validasi file upload
│   └── rateLimitMiddleware.js # Batasi request (anti spam)
│
├── helpers/                   # 🔨 Fungsi pembantu
│   ├── jwtHelper.js          # Generate JWT token
│   └── imageKitHelper.js     # Upload & delete gambar ke ImageKit
│
├── routes/                    # 🛣️ Definisi endpoint API
│   ├── authRoute.js          # /api/auth/...
│   ├── userRoute.js          # /api/user/...
│   ├── pengaduanRoute.js     # /api/pengaduan/...
│   ├── notificationRoute.js  # /api/notifications/...
│   └── ... (lainnya)
│
├── database/                  # 🗄️ SQL & dokumentasi database
│   ├── stored_procedures.sql # Stored procedures MySQL
│   ├── fix_roles.sql         # Script perbaikan role
│   └── ... (dokumentasi lain)
│
├── .env                       # 🔒 Environment variables (RAHASIA)
├── .env.example              # 📄 Contoh konfigurasi .env
├── server.js                 # 🚀 File utama server (entry point)
├── socket.js                 # 🔌 WebSocket (real-time)
├── package.json              # 📦 Daftar library yang digunakan
└── accountService.json       # 🔥 Firebase credentials (untuk notif)
```

### **Penjelasan Struktur:**

| Folder           | Fungsi                                                                  | Contoh                        |
| ---------------- | ----------------------------------------------------------------------- | ----------------------------- |
| **config/**      | Menyimpan konfigurasi seperti koneksi database dan layanan pihak ketiga | Database pool, ImageKit setup |
| **controllers/** | Menerima request dari client, memanggil service, mengirim response      | Login user, create pengaduan  |
| **services/**    | Berisi query SQL dan logika database, dipanggil oleh controller         | `SELECT * FROM pengaduan`     |
| **middleware/**  | Filter yang dijalankan sebelum request sampai ke controller             | Cek token JWT, validasi input |
| **helpers/**     | Fungsi-fungsi kecil yang bisa digunakan di mana saja                    | Generate JWT, upload gambar   |
| **routes/**      | Mendefinisikan endpoint API dan middleware yang digunakan               | `POST /api/auth/login`        |

---

## 2. PENJELASAN FILE UTAMA

### **A. server.js** (File Utama - Entry Point)

```javascript
import express from "express";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();
const app = express();

// 1. MIDDLEWARE GLOBAL
app.use(cors({ origin: [...], credentials: true }));
app.use(express.json()); // Parse JSON dari request body

// 2. HEALTH CHECK
app.get("/api/health", (req, res) => {
  res.json({ status: "healthy", uptime: process.uptime() });
});

// 3. ROUTING
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/pengaduan", pengaduanRoutes);
// ... routes lainnya

// 4. START SERVER
const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
```

**Fungsi utama:**

- ✅ Inisialisasi Express.js
- ✅ Load environment variables dari `.env`
- ✅ Setup CORS untuk frontend (React/Mobile)
- ✅ Menghubungkan semua routes
- ✅ Menjalankan server di port 5000

---

### **B. config/dbConfig.js** (Koneksi Database)

```javascript
import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST, // localhost
  user: process.env.DB_USER, // root / clawwo
  password: process.env.DB_PASSWORD, // password MySQL
  database: process.env.DB_NAME, // pengaduan_sarpras
  waitForConnections: true,
  connectionLimit: 10, // Maksimal 10 koneksi simultan
});

export default pool;
```

**Kenapa pakai Connection Pool?**

- ⚡ **Lebih cepat**: Koneksi tidak dibuat ulang setiap request
- 🔄 **Reusable**: Koneksi dipakai ulang (efisien)
- 🛡️ **Aman dari crash**: Jika ada error, koneksi lain tetap jalan

---

### **C. .env** (Environment Variables)

```bash
# SERVER
NODE_ENV=production
PORT=5000
JWT_SECRET=rahasia_token_unik_123456
JWT_EXPIRES_IN=7d

# DATABASE
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=password123
DB_NAME=pengaduan_sarpras

# IMAGEKIT (Upload Gambar)
IMAGEKIT_PUBLIC_KEY=public_xxxxx
IMAGEKIT_PRIVATE_KEY=private_xxxxx
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/...

# FIREBASE (Push Notification)
FIREBASE_SERVICE_ACCOUNT_PATH=./accountService.json
```

**⚠️ PENTING:**

- File `.env` **TIDAK BOLEH** di-upload ke GitHub (sudah di `.gitignore`)
- Gunakan `.env.example` sebagai template
- JWT_SECRET harus unik dan sulit ditebak

---

### **D. package.json** (Daftar Library)

```json
{
  "name": "server",
  "version": "1.0.0",
  "type": "module", // Pakai ES6 import/export
  "scripts": {
    "start": "node server.js", // Production
    "dev": "nodemon server.js" // Development (auto-restart)
  },
  "dependencies": {
    "express": "^5.1.0", // Framework backend
    "mysql2": "^3.14.4", // Driver MySQL
    "bcryptjs": "^3.0.2", // Hash password
    "jsonwebtoken": "^9.0.2", // JWT authentication
    "cors": "^2.8.5", // Cross-Origin Resource Sharing
    "dotenv": "^17.2.2", // Load .env file
    "multer": "^2.0.2", // Upload file
    "imagekit": "^6.0.0", // Upload ke ImageKit
    "firebase-admin": "^13.6.0", // Push notification
    "express-rate-limit": "^8.1.0" // Rate limiting (anti spam)
  }
}
```

**Cara install:**

```bash
cd server
npm install
```

---

## 3. ALUR KERJA BACKEND (FLOW)

### **🔄 Request-Response Flow (Lengkap)**

```
┌─────────────┐
│   CLIENT    │ (React Web / Mobile App)
│ (Frontend)  │
└──────┬──────┘
       │
       │ 1. HTTP Request
       │    POST /api/auth/login
       │    Body: { username, password }
       ▼
┌─────────────────────────────────────────────────┐
│              EXPRESS SERVER                      │
│               (server.js)                        │
└──────┬──────────────────────────────────────────┘
       │
       │ 2. Route Matching
       │    /api/auth → authRoute.js
       ▼
┌─────────────────────────────────────────────────┐
│               MIDDLEWARE                         │
│  ┌─────────────────────────────────────┐        │
│  │ 1. validateLogin (input validation) │        │
│  │    - Check username & password ada  │        │
│  │    - Return 400 jika tidak lengkap  │        │
│  └─────────────────────────────────────┘        │
│                                                  │
│  ┌─────────────────────────────────────┐        │
│  │ 2. authMiddleware (JWT check)       │        │
│  │    - Extract token dari header      │        │
│  │    - Verify token dengan JWT_SECRET │        │
│  │    - Check role user (admin/petugas)│        │
│  │    - Return 403 jika role salah     │        │
│  └─────────────────────────────────────┘        │
└──────┬──────────────────────────────────────────┘
       │
       │ 3. Controller dipanggil
       │    authController.login()
       ▼
┌─────────────────────────────────────────────────┐
│             CONTROLLER LAYER                     │
│  ┌─────────────────────────────────────┐        │
│  │  authController.js                  │        │
│  │  - Terima req.body                  │        │
│  │  - Panggil authService              │        │
│  │  - Kirim response ke client         │        │
│  └─────────────────────────────────────┘        │
└──────┬──────────────────────────────────────────┘
       │
       │ 4. Query database
       │    authService.findUserByUsername()
       ▼
┌─────────────────────────────────────────────────┐
│              SERVICE LAYER                       │
│  ┌─────────────────────────────────────┐        │
│  │  authService.js                     │        │
│  │  - Eksekusi query SQL               │        │
│  │  - Return data dari database        │        │
│  └─────────────────────────────────────┘        │
└──────┬──────────────────────────────────────────┘
       │
       │ 5. Query ke MySQL
       │    SELECT * FROM pengaduan_sarpras_user WHERE username = ?
       ▼
┌─────────────────────────────────────────────────┐
│              MYSQL DATABASE                      │
│     pengaduan_sarpras_user table                 │
│  ┌─────────────────────────────────────┐        │
│  │ id_user | username | password | role│        │
│  │    1    | admin    | $2a$10...| admin│       │
│  │    2    | user1    | $2a$10...| pengguna│    │
│  └─────────────────────────────────────┘        │
└──────┬──────────────────────────────────────────┘
       │
       │ 6. Return data user
       │    { id_user: 1, username: "admin", ... }
       ▼
┌─────────────────────────────────────────────────┐
│            CONTROLLER (lagi)                     │
│  - Bandingkan password dengan bcrypt            │
│  - Generate JWT token                            │
│  - Return response                               │
│                                                  │
│  res.json({                                      │
│    message: "Login berhasil",                    │
│    token: "eyJhbGciOiJIUzI1NiIsInR5cCI6...",   │
│    user: { id, username, role }                  │
│  })                                              │
└──────┬──────────────────────────────────────────┘
       │
       │ 7. HTTP Response (JSON)
       │    Status: 200 OK
       ▼
┌─────────────┐
│   CLIENT    │
│  Terima:    │
│  - Token    │
│  - User data│
│  Simpan di  │
│  localStorage│
└─────────────┘
```

### **📝 Contoh Alur CRUD Pengaduan**

#### **A. CREATE Pengaduan (POST /api/pengaduan)**

```
1. User (pengguna) submit form pengaduan di frontend
   ├─ Nama pengaduan
   ├─ Deskripsi
   ├─ Foto (file)
   ├─ Lokasi
   └─ Item

2. Frontend kirim ke backend dengan FormData
   POST /api/pengaduan
   Headers: { Authorization: "Bearer <token>" }
   Body: FormData (multipart/form-data)

3. Backend: authMiddleware
   ├─ Cek token valid ✅
   └─ Cek role = "pengguna" ✅

4. Backend: uploadImageMiddleware
   ├─ Validasi file (JPG/PNG, max 2MB)
   ├─ Upload ke ImageKit CDN
   └─ Dapat URL gambar

5. Backend: pengaduanController.createPengaduan()
   ├─ Validasi input (nama, lokasi wajib diisi)
   ├─ Panggil pengaduanService.createPengaduan()
   ├─ Insert ke database
   ├─ Kirim notifikasi ke admin & petugas
   └─ Return response sukses

6. Database: sp_create_pengaduan (Stored Procedure)
   ├─ INSERT INTO pengaduan_sarpras_pengaduan
   ├─ UPDATE item jika proposal item baru
   └─ Return ID pengaduan baru

7. Backend: notificationController
   ├─ notifyAdmins() → "📋 Pengaduan Baru Masuk"
   └─ notifyPetugas() → "🔧 Tugas Baru"

8. Response ke frontend
   Status: 201 Created
   { message: "Pengaduan berhasil dibuat", id_pengaduan: 123 }
```

#### **B. READ Pengaduan (GET /api/pengaduan)**

```
1. Frontend request daftar pengaduan
   GET /api/pengaduan
   Headers: { Authorization: "Bearer <token>" }

2. Backend: authMiddleware
   └─ Cek role = "petugas" atau "admin" ✅

3. Backend: pengaduanController.getAllPengaduan()
   └─ Panggil pengaduanService.getAllPengaduan()

4. Database query:
   SELECT p.*, u.nama_pengguna, l.nama_lokasi, i.nama_item
   FROM pengaduan_sarpras_pengaduan p
   JOIN pengaduan_sarpras_user u ON p.id_user = u.id_user
   JOIN pengaduan_sarpras_lokasi l ON p.id_lokasi = l.id_lokasi
   LEFT JOIN pengaduan_sarpras_items i ON p.id_item = i.id_item
   ORDER BY p.tgl_pengajuan DESC

5. Response:
   Status: 200 OK
   { data: [{ id_pengaduan, nama_pengaduan, status, ... }] }
```

#### **C. UPDATE Status (PATCH /api/pengaduan/:id/status)**

```
1. Petugas/Admin update status pengaduan di frontend
   PATCH /api/pengaduan/123/status
   Body: { status: "Diproses", saran_petugas: "..." }

2. Backend: authMiddleware
   └─ Cek role = "petugas" atau "admin" ✅

3. Backend: pengaduanController.updatePengaduanStatus()
   ├─ Validasi status (harus valid enum)
   ├─ Get data pengaduan lama
   ├─ Update status di database
   ├─ Simpan riwayat aksi
   └─ Kirim notifikasi ke pengguna

4. Database:
   UPDATE pengaduan_sarpras_pengaduan
   SET status = ?, saran_petugas = ?, id_petugas = ?
   WHERE id_pengaduan = ?

5. Riwayat Aksi:
   INSERT INTO pengaduan_sarpras_riwayat_aksi
   (id_pengaduan, id_user, aksi, detail)
   VALUES (123, 5, "update_status", "Selesai → Diproses")

6. Notifikasi ke Pengguna:
   notifyUser() → "✅ Pengaduan Selesai"

7. Response:
   Status: 200 OK
   { message: "Status berhasil diupdate" }
```

---

## 4. PENJELASAN API ENDPOINT

### **🔐 A. Authentication Endpoints** (`/api/auth`)

| Method   | Endpoint            | Middleware                                                   | Fungsi                 | Request Body                                                | Response                                                            |
| -------- | ------------------- | ------------------------------------------------------------ | ---------------------- | ----------------------------------------------------------- | ------------------------------------------------------------------- |
| **POST** | `/register`         | validateRegister                                             | Register pengguna baru | `{ username, password, nama_pengguna }`                     | `201`: Registrasi berhasil<br>`400`: Username sudah terdaftar       |
| **POST** | `/login`            | validateLogin                                                | Login pengguna         | `{ username, password }`                                    | `200`: Token JWT + data user<br>`400`: Username/password salah      |
| **POST** | `/register-petugas` | authMiddleware(admin)<br>validateRegister<br>validatePetugas | Admin tambah petugas   | `{ username, password, nama_pengguna, nama, gender, telp }` | `201`: Petugas berhasil ditambahkan<br>`403`: Hanya admin yang bisa |

**Contoh Request Login:**

```javascript
// Frontend (Axios)
const response = await axios.post('http://localhost:5000/api/auth/login', {
  username: 'admin',
  password: 'password123'
});

// Response
{
  "message": "Login berhasil",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "admin",
    "nama_pengguna": "Administrator",
    "role": "admin"
  }
}
```

---

### **👤 B. User Endpoints** (`/api/user`)

| Method  | Endpoint | Middleware                    | Fungsi                     | Request Body                               | Response                                                         |
| ------- | -------- | ----------------------------- | -------------------------- | ------------------------------------------ | ---------------------------------------------------------------- |
| **GET** | `/me`    | authMiddleware                | Get profil user yang login | -                                          | `200`: Data user<br>`401`: Token tidak ada                       |
| **PUT** | `/me`    | authMiddleware                | Update profil sendiri      | `{ username?, nama_pengguna?, password? }` | `200`: Profil berhasil diupdate<br>`409`: Username sudah dipakai |
| **GET** | `/:id`   | authMiddleware(admin/petugas) | Get detail user by ID      | -                                          | `200`: Data user<br>`404`: User tidak ditemukan                  |

**⚠️ Penting:** Route `/me` harus di **atas** `/:id` agar tidak tertimpa parameter route!

---

### **📋 C. Pengaduan Endpoints** (`/api/pengaduan`)

| Method    | Endpoint       | Middleware                                      | Fungsi                         | Request Body                                                                  | Response                                                            |
| --------- | -------------- | ----------------------------------------------- | ------------------------------ | ----------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| **POST**  | `/`            | authMiddleware(pengguna)<br>uploadImage('foto') | Buat pengaduan baru            | `{ nama_pengaduan, deskripsi, foto, id_item, id_lokasi, nama_item_baru? }`    | `201`: Pengaduan berhasil dibuat<br>`400`: Data tidak lengkap       |
| **GET**   | `/`            | authMiddleware(petugas/admin)                   | Get semua pengaduan            | -                                                                             | `200`: Array pengaduan                                              |
| **GET**   | `/pengaduanku` | authMiddleware(pengguna)                        | Get pengaduan milik user login | -                                                                             | `200`: Array pengaduan user                                         |
| **PATCH** | `/:id/status`  | authMiddleware(petugas/admin)                   | Update status pengaduan        | `{ status, saran_petugas?, catatan_admin? }`                                  | `200`: Status berhasil diupdate<br>`404`: Pengaduan tidak ditemukan |
| **GET**   | `/report`      | authMiddleware(admin)                           | Get laporan pengaduan (filter) | Query: `?status=Selesai&id_petugas=5&startDate=2025-01-01&endDate=2025-12-31` | `200`: Data laporan                                                 |

**Contoh Request Buat Pengaduan:**

```javascript
const formData = new FormData();
formData.append("nama_pengaduan", "Kursi Rusak");
formData.append("deskripsi", "Kursi di Lab RPL kaki patah");
formData.append("foto", fileInput.files[0]); // File gambar
formData.append("id_lokasi", "3");
formData.append("id_item", "15");

const response = await axios.post(
  "http://localhost:5000/api/pengaduan",
  formData,
  {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data",
    },
  }
);
```

---

### **🔔 D. Notification Endpoints** (`/api/notifications`)

| Method    | Endpoint      | Middleware     | Fungsi                                   | Response                                             |
| --------- | ------------- | -------------- | ---------------------------------------- | ---------------------------------------------------- | ------------------------------ |
| **GET**   | `/unread`     | authMiddleware | Get 10 notifikasi belum dibaca           | `200`: Array notifikasi                              |
| **PATCH** | `/:id/read`   | authMiddleware | Tandai 1 notifikasi sudah dibaca         | `200`: Berhasil<br>`404`: Notifikasi tidak ditemukan |
| **PATCH** | `/read-all`   | authMiddleware | Tandai semua notifikasi sudah dibaca     | `200`: { count: 5 }                                  |
| **POST**  | `/save-token` | authMiddleware | Simpan FCM token untuk push notification | `{ fcm_token, device_info }`                         | `200`: Token berhasil disimpan |

**Frontend Polling (setiap 10 detik):**

```javascript
useEffect(() => {
  const interval = setInterval(() => {
    fetchNotifications(); // GET /api/notifications/unread
  }, 10000);

  return () => clearInterval(interval);
}, []);
```

---

### **🏢 E. Lokasi Endpoints** (`/api/lokasi`)

| Method     | Endpoint | Middleware            | Fungsi             |
| ---------- | -------- | --------------------- | ------------------ |
| **GET**    | `/`      | authMiddleware        | Get semua lokasi   |
| **POST**   | `/`      | authMiddleware(admin) | Tambah lokasi baru |
| **PUT**    | `/:id`   | authMiddleware(admin) | Update lokasi      |
| **DELETE** | `/:id`   | authMiddleware(admin) | Hapus lokasi       |

---

### **🔧 F. Item Endpoints** (`/api/items`)

| Method     | Endpoint             | Middleware                    | Fungsi             |
| ---------- | -------------------- | ----------------------------- | ------------------ |
| **GET**    | `/`                  | authMiddleware                | Get semua item     |
| **GET**    | `/lokasi/:id_lokasi` | authMiddleware                | Get item by lokasi |
| **POST**   | `/`                  | authMiddleware(admin/petugas) | Tambah item baru   |
| **PUT**    | `/:id`               | authMiddleware(admin/petugas) | Update item        |
| **DELETE** | `/:id`               | authMiddleware(admin)         | Hapus item         |

---

### **👨‍🔧 G. Petugas Endpoints** (`/api/petugas`)

| Method     | Endpoint | Middleware                    | Fungsi              |
| ---------- | -------- | ----------------------------- | ------------------- |
| **GET**    | `/`      | authMiddleware(admin)         | Get semua petugas   |
| **GET**    | `/:id`   | authMiddleware(admin/petugas) | Get detail petugas  |
| **PUT**    | `/:id`   | authMiddleware(admin)         | Update data petugas |
| **DELETE** | `/:id`   | authMiddleware(admin)         | Hapus petugas       |

---

## 5. SISTEM KEAMANAN

### **🔐 A. JWT Authentication (JSON Web Token)**

**Cara Kerja:**

```
1. User login → Backend generate JWT token
2. Token berisi payload: { id, role, exp }
3. Token dikirim ke frontend
4. Frontend simpan di localStorage
5. Setiap request, frontend kirim token di header:
   Authorization: Bearer <token>
6. Backend verify token di authMiddleware
7. Jika valid → lanjut ke controller
   Jika invalid → return 403 Forbidden
```

**File: `helpers/jwtHelper.js`**

```javascript
import jwt from "jsonwebtoken";

export const generateToken = (payload) => {
  // Normalize role jadi lowercase
  const normalizedPayload = {
    ...payload,
    role: payload.role ? payload.role.trim().toLowerCase() : "",
  };

  return jwt.sign(normalizedPayload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d", // Token expired 7 hari
  });
};
```

**File: `middleware/authMiddleware.js`**

```javascript
import jwt from "jsonwebtoken";

const authMiddleware = (roles = []) => {
  return (req, res, next) => {
    // 1. Ambil token dari header
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1]; // "Bearer <token>"

    if (!token) {
      return res.status(401).json({ message: "Token tidak ada" });
    }

    // 2. Verify token
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(403).json({ message: "Token tidak valid" });
      }

      // 3. Cek role user
      const userRole = decoded.role ? decoded.role.trim().toLowerCase() : "";
      const normalizedRoles = roles.map((role) => role.toLowerCase());

      if (roles.length && !normalizedRoles.includes(userRole)) {
        return res.status(403).json({
          message: "Akses ditolak",
          detail: `Role "${decoded.role}" tidak memiliki akses`,
        });
      }

      // 4. Simpan data user di req.user
      req.user = decoded;
      next(); // Lanjut ke controller
    });
  };
};

export default authMiddleware;
```

**Contoh Penggunaan:**

```javascript
// routes/pengaduanRoute.js
router.post("/", authMiddleware(["pengguna"]), createPengaduan);
// Hanya pengguna yang bisa create pengaduan

router.get("/", authMiddleware(["petugas", "admin"]), getAllPengaduan);
// Petugas atau admin yang bisa lihat semua pengaduan

router.put("/:id", authMiddleware(), updateProfile);
// Semua user yang login bisa akses (tidak cek role)
```

---

### **🔒 B. Password Hashing (Bcrypt)**

**❌ JANGAN simpan password plain text:**

```javascript
// BAHAYA! Password bisa dibaca siapa saja
INSERT INTO users (username, password) VALUES ('admin', 'password123');
```

**✅ Gunakan bcrypt untuk hash password:**

```javascript
import bcrypt from "bcryptjs";

// Register: Hash password sebelum simpan
export const createUser = async (username, password, nama_pengguna, role) => {
  const hashedPassword = await bcrypt.hash(password, 10); // Salt rounds = 10

  await pool.query(
    "INSERT INTO pengaduan_sarpras_user (username, password, ...) VALUES (?,?,?)",
    [username, hashedPassword, nama_pengguna]
  );
};

// Login: Bandingkan password input dengan hash di database
export const login = async (req, res) => {
  const user = await findUserByUsername(username);
  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    return res.status(400).json({ message: "Password salah" });
  }

  // Password cocok, generate token
  const token = generateToken({ id: user.id_user, role: user.role });
  res.json({ token });
};
```

**Hasil Hash Bcrypt:**

```
Input: password123
Hash : $2a$10$eImiTXuWVxfM37uY4JANjQ.L.Rz0cK0Y2J1M.N9Y.1
       ^^^^    ^^^^^^^^^^^^^^^^^^^^^^^^    ^^^^^^^^^^^^^^
       Alg     Salt (random)               Hashed password
```

**Keuntungan Bcrypt:**

- ✅ Tidak bisa di-decrypt (one-way hash)
- ✅ Salt otomatis (tiap hash beda meski password sama)
- ✅ Lambat = sulit di-brute force

---

### **🛡️ C. Input Validation**

**File: `middleware/validateInputMiddleware.js`**

```javascript
export const validateRegister = (req, res, next) => {
  const { username, password, nama_pengguna } = req.body;

  // Validasi panjang username
  if (!username || username.length < 3) {
    return res.status(400).json({ message: "Username minimal 3 karakter" });
  }

  // Validasi kekuatan password
  if (!password || password.length < 8) {
    return res.status(400).json({ message: "Password minimal 8 karakter" });
  }

  // Validasi nama tidak boleh kosong
  if (!nama_pengguna || nama_pengguna.trim() === "") {
    return res.status(400).json({ message: "Nama pengguna wajib diisi" });
  }

  next(); // Lanjut ke controller
};

export const validateLogin = (req, res, next) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      message: "Username dan password wajib diisi",
    });
  }

  next();
};
```

**Kenapa penting?**

- ✅ Mencegah SQL Injection (query parameter sudah safe)
- ✅ Mencegah user input data kosong
- ✅ Validasi format sebelum masuk database

---

### **📁 D. File Upload Security**

**File: `middleware/uploadImageMiddleware.js`**

```javascript
import multer from "multer";

const storage = multer.memoryStorage(); // Simpan di RAM dulu
const MAX_SIZE = 2 * 1024 * 1024; // 2MB

const fileFilter = (req, file, cb) => {
  // Hanya terima JPG dan PNG
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true); // File diterima
  } else {
    cb(new Error("Format file harus JPG atau PNG"), false); // Ditolak
  }
};

const upload = multer({
  storage,
  limits: { fileSize: MAX_SIZE },
  fileFilter,
});

const uploadImage = (fieldName) => {
  return (req, res, next) => {
    upload.single(fieldName)(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return res.status(400).json({ message: "Ukuran file maksimal 2MB" });
        }
        return res.status(400).json({ message: err.message });
      } else if (err) {
        return res.status(400).json({ message: err.message });
      }
      next();
    });
  };
};

export default uploadImage;
```

**Keamanan Upload:**

- ✅ Batasi ukuran file (2MB)
- ✅ Validasi mimetype (JPG/PNG only)
- ✅ Tidak simpan di server (pakai CDN ImageKit)
- ✅ Tidak eksekusi file (memoryStorage, bukan disk)

---

### **🚦 E. Rate Limiting (Anti Spam)**

**File: `middleware/rateLimitMiddleware.js`**

```javascript
import rateLimit from "express-rate-limit";

// Limit login/register: max 5 requests per 10 menit
export const authRateLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 menit
  max: 5, // Maksimal 5 request
  message: {
    message: "Terlalu banyak percobaan, silakan coba lagi nanti.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
```

**Cara pakai:**

```javascript
// routes/authRoute.js
import { authRateLimiter } from "../middleware/rateLimitMiddleware.js";

router.post("/login", authRateLimiter, validateLogin, login);
```

**Kenapa penting?**

- ✅ Mencegah brute force attack (coba password berkali-kali)
- ✅ Mencegah DDoS attack
- ✅ Menghemat resource server

---

### **🔐 F. CORS Configuration**

**File: `server.js`**

```javascript
app.use(
  cors({
    origin: [
      "http://localhost:5173", // Web dev
      "https://farelhry.my.id", // Production
      /^http:\/\/192\.168\.\d+\.\d+:\d+$/, // Mobile local network
    ],
    credentials: true, // Allow cookies
  })
);
```

**Kenapa penting?**

- ✅ Hanya domain tertentu yang bisa akses API
- ✅ Mencegah serangan dari website lain

---

### **📊 G. SQL Injection Prevention**

**❌ JANGAN pakai string concatenation:**

```javascript
// BAHAYA! Bisa di-SQL injection
const username = req.body.username;
const query = "SELECT * FROM users WHERE username = '" + username + "'";
```

**Contoh serangan:**

```
Input: admin' OR '1'='1
Query jadi: SELECT * FROM users WHERE username = 'admin' OR '1'='1'
Hasil: Login berhasil tanpa password!
```

**✅ Gunakan parameterized query:**

```javascript
// AMAN! MySQL2 auto-escape parameter
const [rows] = await pool.query("SELECT * FROM users WHERE username = ?", [
  username,
]);
```

---

## 6. OPTIMASI & SARAN PERBAIKAN

### **⚡ A. Database Optimization**

#### **1. Indexing**

**Masalah:** Query lambat ketika data banyak

**Solusi:** Tambahkan index di kolom yang sering di-search/join

```sql
-- Index untuk kolom yang sering di-WHERE/JOIN
CREATE INDEX idx_user_username ON pengaduan_sarpras_user(username);
CREATE INDEX idx_pengaduan_user ON pengaduan_sarpras_pengaduan(id_user);
CREATE INDEX idx_pengaduan_status ON pengaduan_sarpras_pengaduan(status);
CREATE INDEX idx_notif_user_read ON notification_history(user_id, is_read);
CREATE INDEX idx_notif_sent_at ON notification_history(sent_at);

-- Composite index untuk query gabungan
CREATE INDEX idx_pengaduan_user_status ON pengaduan_sarpras_pengaduan(id_user, status);
```

**Impact:**

- ✅ Query 10-100x lebih cepat
- ✅ Mengurangi beban server

---

#### **2. Connection Pooling (Sudah diterapkan)**

```javascript
const pool = mysql.createPool({
  connectionLimit: 10, // Maksimal 10 koneksi
  waitForConnections: true,
});
```

**✅ Sudah optimal!** Tapi bisa dinaikkan jika traffic tinggi:

```javascript
connectionLimit: 20, // Untuk server dengan RAM besar
```

---

#### **3. Stored Procedures (Sudah diterapkan)**

**File: `database/stored_procedures.sql`**

```sql
CREATE PROCEDURE sp_create_pengaduan(
  IN p_nama_pengaduan VARCHAR(255),
  IN p_deskripsi TEXT,
  IN p_foto VARCHAR(255),
  IN p_file_id VARCHAR(100),
  IN p_id_user INT,
  IN p_id_item INT,
  IN p_id_lokasi INT,
  IN p_id_temporary INT,
  OUT new_id INT,
  OUT status_code INT,
  OUT message VARCHAR(255)
)
BEGIN
  -- Multiple queries dalam 1 transaction
  START TRANSACTION;

  INSERT INTO pengaduan_sarpras_pengaduan (...) VALUES (...);
  SET new_id = LAST_INSERT_ID();

  IF p_id_temporary IS NOT NULL THEN
    CALL sp_approve_temporary_item(p_id_temporary);
  END IF;

  COMMIT;
END;
```

**Keuntungan:**

- ✅ Lebih cepat (1 round-trip vs multiple queries)
- ✅ Transaction safety (atomicity)
- ✅ Reusable logic

---

### **🔒 B. Security Improvements**

#### **1. Environment Variable Security**

**✅ Sudah diterapkan:** File `.env` di `.gitignore`

**Tambahan:** Gunakan dotenv-expand untuk variabel kompleks

```bash
npm install dotenv-expand
```

```javascript
import dotenv from "dotenv";
import dotenvExpand from "dotenv-expand";

const myEnv = dotenv.config();
dotenvExpand.expand(myEnv);
```

---

#### **2. Helmet.js (Tambahan keamanan header)**

```bash
npm install helmet
```

```javascript
import helmet from "helmet";

app.use(helmet()); // Auto set security headers
```

**Security headers yang ditambahkan:**

- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Strict-Transport-Security: max-age=31536000`

---

#### **3. Input Sanitization (Tambahan)**

```bash
npm install express-validator
```

```javascript
import { body, validationResult } from "express-validator";

export const validateRegister = [
  body("username")
    .trim()
    .isLength({ min: 3 })
    .withMessage("Username minimal 3 karakter")
    .isAlphanumeric()
    .withMessage("Username hanya boleh huruf dan angka"),

  body("password")
    .isLength({ min: 8 })
    .withMessage("Password minimal 8 karakter")
    .matches(/[A-Z]/)
    .withMessage("Password harus ada huruf besar"),

  body("nama_pengguna")
    .trim()
    .notEmpty()
    .withMessage("Nama wajib diisi")
    .escape(), // Escape HTML tags

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];
```

---

#### **4. HTTPS & SSL Certificate (Production)**

**Untuk VPS production:**

```bash
# Install Certbot (Let's Encrypt)
sudo apt install certbot

# Generate SSL certificate
sudo certbot certonly --standalone -d api.farelhry.my.id
```

**Update server.js:**

```javascript
import https from "https";
import fs from "fs";

const httpsOptions = {
  key: fs.readFileSync("/etc/letsencrypt/live/api.farelhry.my.id/privkey.pem"),
  cert: fs.readFileSync(
    "/etc/letsencrypt/live/api.farelhry.my.id/fullchain.pem"
  ),
};

https.createServer(httpsOptions, app).listen(443, () => {
  console.log("HTTPS Server running on port 443");
});
```

---

### **🚀 C. Performance Improvements**

#### **1. Caching dengan Redis (Opsional untuk data sering diakses)**

```bash
npm install redis
```

```javascript
import { createClient } from "redis";

const redis = createClient({
  url: "redis://localhost:6379",
});

await redis.connect();

// Cache lokasi (data jarang berubah)
export const getAllLokasi = async () => {
  const cached = await redis.get("lokasi:all");

  if (cached) {
    return JSON.parse(cached); // Return dari cache
  }

  const [rows] = await pool.query("SELECT * FROM pengaduan_sarpras_lokasi");

  // Simpan ke cache selama 1 jam
  await redis.setEx("lokasi:all", 3600, JSON.stringify(rows));

  return rows;
};
```

**Kapan pakai Redis?**

- ✅ Data yang sering diakses (lokasi, kategori, item)
- ✅ Session management
- ✅ Rate limiting counter

---

#### **2. Pagination untuk Query Besar**

**Masalah:** `GET /api/pengaduan` return ribuan data

**Solusi:** Implementasi pagination

```javascript
export const getAllPengaduan = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  const [rows] = await pool.query(
    `SELECT * FROM pengaduan_sarpras_pengaduan 
     ORDER BY tgl_pengajuan DESC 
     LIMIT ? OFFSET ?`,
    [limit, offset]
  );

  const [total] = await pool.query(
    "SELECT COUNT(*) as count FROM pengaduan_sarpras_pengaduan"
  );

  res.json({
    data: rows,
    pagination: {
      page,
      limit,
      total: total[0].count,
      totalPages: Math.ceil(total[0].count / limit),
    },
  });
};
```

**Frontend:**

```javascript
// GET /api/pengaduan?page=2&limit=20
const response = await axios.get(`${API_URL}/api/pengaduan`, {
  params: { page: 2, limit: 20 },
});
```

---

#### **3. Compression Middleware**

```bash
npm install compression
```

```javascript
import compression from "compression";

app.use(compression()); // Compress response (gzip)
```

**Impact:**

- ✅ Response size turun 70-80%
- ✅ Bandwidth lebih hemat

---

#### **4. Logging & Monitoring**

```bash
npm install winston morgan
```

**File: `helpers/logger.js`**

```javascript
import winston from "winston";

const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: "error.log", level: "error" }),
    new winston.transports.File({ filename: "combined.log" }),
  ],
});

if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.simple(),
    })
  );
}

export default logger;
```

**Gunakan di controller:**

```javascript
import logger from "../helpers/logger.js";

export const login = async (req, res) => {
  try {
    // ...
    logger.info(`User ${username} logged in successfully`);
    res.json({ token });
  } catch (error) {
    logger.error(`Login failed for ${username}: ${error.message}`);
    res.status(500).json({ message: "Terjadi kesalahan" });
  }
};
```

---

### **🧹 D. Code Quality**

#### **1. Error Handling yang Konsisten**

**Buat error handler global:**

```javascript
// middleware/errorHandler.js
export const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  const statusCode = err.statusCode || 500;
  const message = err.message || "Terjadi kesalahan server";

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

// server.js
import { errorHandler } from "./middleware/errorHandler.js";

// ... routes ...

app.use(errorHandler); // Harus di paling bawah
```

---

#### **2. Validasi dengan Joi (Alternatif express-validator)**

```bash
npm install joi
```

```javascript
import Joi from "joi";

export const validateRegister = (req, res, next) => {
  const schema = Joi.object({
    username: Joi.string().min(3).alphanum().required(),
    password: Joi.string().min(8).required(),
    nama_pengguna: Joi.string().required(),
  });

  const { error } = schema.validate(req.body);

  if (error) {
    return res.status(400).json({
      message: error.details[0].message,
    });
  }

  next();
};
```

---

#### **3. Environment-based Config**

**File: `config/config.js`**

```javascript
const config = {
  development: {
    port: 5000,
    dbPool: 5,
    jwtExpiry: "7d",
    corsOrigin: ["http://localhost:5173"],
  },
  production: {
    port: process.env.PORT || 5000,
    dbPool: 20,
    jwtExpiry: "1d",
    corsOrigin: ["https://farelhry.my.id"],
  },
};

const env = process.env.NODE_ENV || "development";
export default config[env];
```

---

### **📈 E. Scalability**

#### **1. Microservices Architecture (Future)**

**Saat ini:** Monolithic (1 server untuk semua)

**Scaling:**

```
┌─────────────────────────────────────┐
│       Load Balancer (Nginx)        │
└──────────┬───────────┬──────────────┘
           │           │
    ┌──────▼──────┐ ┌──▼──────────┐
    │ Server 1    │ │ Server 2    │
    │ (Node.js)   │ │ (Node.js)   │
    └──────┬──────┘ └──┬──────────┘
           │           │
    ┌──────▼───────────▼──────────┐
    │   MySQL Database (Master)   │
    └─────────────────────────────┘
```

---

#### **2. Message Queue (RabbitMQ/Bull)**

**Untuk background jobs:**

- ✅ Kirim email
- ✅ Generate report
- ✅ Push notification

```bash
npm install bull redis
```

```javascript
import Bull from "bull";

const notificationQueue = new Bull("notifications", {
  redis: { host: "localhost", port: 6379 },
});

// Producer (controller)
await notificationQueue.add({
  userId: 123,
  title: "Pengaduan Selesai",
  body: "Kursi di Lab RPL sudah diperbaiki",
});

// Consumer (worker)
notificationQueue.process(async (job) => {
  const { userId, title, body } = job.data;
  await sendPushNotification(userId, title, body);
});
```

---

### **📝 F. Documentation**

#### **1. API Documentation dengan Swagger**

```bash
npm install swagger-ui-express swagger-jsdoc
```

```javascript
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Pengaduan Sarpras API",
      version: "1.0.0",
      description: "REST API untuk Sistem Pengaduan Sarana & Prasarana",
    },
    servers: [
      { url: "http://localhost:5000", description: "Development" },
      { url: "https://api.farelhry.my.id", description: "Production" },
    ],
  },
  apis: ["./routes/*.js"],
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));
```

**Tambahkan JSDoc di routes:**

```javascript
/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login berhasil
 *       400:
 *         description: Username atau password salah
 */
router.post("/login", validateLogin, login);
```

**Akses:** `http://localhost:5000/api-docs`

---

## 📊 KESIMPULAN

### **✅ Kelebihan Backend Saat Ini:**

1. **Struktur folder terorganisir** (MVC pattern)
2. **Security sudah baik** (JWT, bcrypt, validation)
3. **Upload gambar ke CDN** (ImageKit, bukan lokal server)
4. **Notification system** (FCM push notification)
5. **Stored procedures** (efisien untuk query kompleks)
6. **Role-based access control** (admin/petugas/pengguna)
7. **Environment variables** (config aman dengan .env)

---

### **🔧 Yang Bisa Ditingkatkan:**

| Prioritas  | Improvement                                        | Effort | Impact |
| ---------- | -------------------------------------------------- | ------ | ------ |
| **HIGH**   | ✅ Tambah indexing database                        | Low    | High   |
| **HIGH**   | ✅ Implementasi rate limiting untuk semua endpoint | Low    | High   |
| **HIGH**   | ✅ Helmet.js untuk security headers                | Low    | High   |
| **MEDIUM** | ⚙️ Pagination untuk API                            | Medium | Medium |
| **MEDIUM** | ⚙️ Redis caching untuk data statis                 | Medium | High   |
| **MEDIUM** | ⚙️ Error logging dengan Winston                    | Low    | Medium |
| **LOW**    | 📚 Swagger documentation                           | Medium | Low    |
| **LOW**    | 🚀 Microservices architecture                      | High   | High   |

---

### **🎯 Rekomendasi untuk UKK:**

**Saat Presentasi, Jelaskan:**

1. **Alur request-response** dengan diagram (buat di whiteboard/PPT)
2. **Sistem keamanan**:
   - JWT authentication
   - Password hashing
   - Input validation
   - File upload security
3. **Struktur MVC** (Model-View-Controller):
   - Routes → Middleware → Controller → Service → Database
4. **Database optimization**: Stored procedures, indexing
5. **Real-time notification**: Push notification dengan Firebase

**Demo Live:**

- ✅ Login sebagai admin/petugas/pengguna
- ✅ Create pengaduan dengan upload foto
- ✅ Update status pengaduan
- ✅ Notifikasi real-time
- ✅ Laporan pengaduan (filter)

**Tunjukkan Code:**

- `authMiddleware.js` (JWT verification)
- `pengaduanController.js` (business logic)
- `stored_procedures.sql` (database optimization)

---

## 📞 DUKUNGAN

**Dokumentasi ini dibuat untuk:**

- ✅ Membantu memahami backend secara menyeluruh
- ✅ Persiapan UKK (presentasi & demo)
- ✅ Maintenance & development lanjutan

**Tips Presentasi UKK:**

1. Jelaskan konsep REST API dengan jelas
2. Tunjukkan keamanan yang sudah diterapkan
3. Demo error handling (coba input salah)
4. Jelaskan perbedaan role (admin vs petugas vs pengguna)
5. Tunjukkan response API (JSON format)

**Semoga Sukses UKK! 🎓🚀**

---

**Catatan Akhir:**

Dokumentasi ini mencakup 90% dari backend yang ada. Untuk detail spesifik seperti:

- Stored procedures lengkap → Lihat `database/stored_procedures.sql`
- API endpoint detail → Lihat file di `routes/`
- Database schema → Lihat `database/README.md`

**Update terakhir:** 16 November 2025
