#!/bin/bash

# =============================================
# SCRIPT BACKUP DATABASE OTOMATIS
# =============================================
# Jadwal: 3x seminggu (Senin, Rabu, Jumat - 02:00 AM)
# Retention: 7 backup terakhir
# Format: pengaduan_sarpras_YYYY-MM-DD_HH-MM-SS.sql.gz
# =============================================

# Konfigurasi Database
DB_NAME="pengaduan_sarpras"
DB_USER="root"
DB_PASSWORD=""  # Ganti dengan password MySQL Anda
DB_HOST="localhost"
DB_PORT="3306"

# Konfigurasi Backup
BACKUP_DIR="$(dirname "$0")/backups"
LOG_FILE="$(dirname "$0")/backup.log"
MAX_BACKUPS=7  # Simpan 7 backup terakhir

# Warna untuk output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Fungsi logging
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Fungsi error
error() {
    echo -e "${RED}[ERROR] $1${NC}" | tee -a "$LOG_FILE"
    exit 1
}

# Fungsi sukses
success() {
    echo -e "${GREEN}[SUCCESS] $1${NC}" | tee -a "$LOG_FILE"
}

# Fungsi warning
warning() {
    echo -e "${YELLOW}[WARNING] $1${NC}" | tee -a "$LOG_FILE"
}

# =============================================
# MAIN SCRIPT
# =============================================

log "=========================================="
log "Memulai proses backup database..."

# 1. Cek apakah direktori backup ada, jika tidak buat
if [ ! -d "$BACKUP_DIR" ]; then
    mkdir -p "$BACKUP_DIR"
    log "Direktori backup dibuat: $BACKUP_DIR"
fi

# 2. Generate nama file dengan timestamp
TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")
BACKUP_FILE="${BACKUP_DIR}/${DB_NAME}_${TIMESTAMP}.sql"
BACKUP_FILE_GZ="${BACKUP_FILE}.gz"

# 3. Cek apakah mysqldump tersedia
if ! command -v mysqldump &> /dev/null; then
    error "mysqldump tidak ditemukan. Pastikan MySQL client terinstall."
fi

# 4. Eksekusi mysqldump
log "Membackup database: $DB_NAME"

if [ -z "$DB_PASSWORD" ]; then
    # Tanpa password
    mysqldump --host="$DB_HOST" \
              --port="$DB_PORT" \
              --user="$DB_USER" \
              --single-transaction \
              --routines \
              --triggers \
              --events \
              "$DB_NAME" > "$BACKUP_FILE" 2>> "$LOG_FILE"
else
    # Dengan password
    mysqldump --host="$DB_HOST" \
              --port="$DB_PORT" \
              --user="$DB_USER" \
              --password="$DB_PASSWORD" \
              --single-transaction \
              --routines \
              --triggers \
              --events \
              "$DB_NAME" > "$BACKUP_FILE" 2>> "$LOG_FILE"
fi

# 5. Cek apakah backup berhasil
if [ $? -ne 0 ]; then
    error "Backup database gagal! Cek log untuk detail."
fi

# 6. Kompresi file backup
log "Mengkompresi file backup..."
gzip "$BACKUP_FILE"

if [ $? -ne 0 ]; then
    error "Kompresi backup gagal!"
fi

# 7. Cek ukuran file hasil backup
BACKUP_SIZE=$(du -h "$BACKUP_FILE_GZ" | cut -f1)
success "Backup berhasil dibuat: $(basename "$BACKUP_FILE_GZ") (Size: $BACKUP_SIZE)"

# 8. Hapus backup lama (simpan hanya MAX_BACKUPS terakhir)
log "Membersihkan backup lama..."
BACKUP_COUNT=$(ls -1 "$BACKUP_DIR"/*.sql.gz 2>/dev/null | wc -l)

if [ "$BACKUP_COUNT" -gt "$MAX_BACKUPS" ]; then
    DELETE_COUNT=$((BACKUP_COUNT - MAX_BACKUPS))
    ls -t "$BACKUP_DIR"/*.sql.gz | tail -n "$DELETE_COUNT" | xargs rm -f
    warning "Dihapus $DELETE_COUNT backup lama (keeping last $MAX_BACKUPS backups)"
else
    log "Total backup saat ini: $BACKUP_COUNT (max: $MAX_BACKUPS)"
fi

# 9. Tampilkan daftar backup yang tersimpan
log "Daftar backup yang tersimpan:"
ls -lh "$BACKUP_DIR"/*.sql.gz 2>/dev/null | awk '{print $9, "-", $5}' | tee -a "$LOG_FILE"

log "Proses backup selesai!"
log "=========================================="

exit 0
