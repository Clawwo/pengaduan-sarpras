// ====================================================================
// SCRIPT GENERATE PASSWORD HASH UNTUK DATA PRESENTASI
// ====================================================================
// Jalankan script ini untuk mendapatkan bcrypt hash yang BENAR
// Karena hash di SQL adalah contoh, kita perlu hash yang real
// ====================================================================

import bcrypt from "bcryptjs";

const password = "password123";

// Generate 8 hash untuk 8 user
async function generateHashes() {
  console.log("🔐 Generating bcrypt hashes for password: 'password123'\n");
  console.log("Copy hash ini ke file SQL:\n");
  console.log("=".repeat(80));

  const users = [
    "admin",
    "petugas1",
    "petugas2",
    "petugas3",
    "siswa1",
    "siswa2",
    "guru1",
    "guru2",
  ];

  for (const username of users) {
    const hash = await bcrypt.hash(password, 10);
    console.log(`-- ${username}`);
    console.log(`'${hash}',\n`);
  }

  console.log("=".repeat(80));
  console.log(
    "\n✅ Selesai! Copy hash di atas ke reset_and_populate_demo_data.sql"
  );
  console.log("📍 Ganti di bagian INSERT INTO pengaduan_sarpras_user");
}

generateHashes();
