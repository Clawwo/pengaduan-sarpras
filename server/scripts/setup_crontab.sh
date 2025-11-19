#!/bin/bash

# =============================================
# SCRIPT SETUP CRONTAB UNTUK BACKUP OTOMATIS
# =============================================
# Script ini akan menambahkan cron job untuk backup database
# Jadwal: Senin, Rabu, Jumat jam 02:00 AM
# =============================================

# Warna untuk output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}=========================================="
echo "Setup Crontab untuk Backup Database"
echo -e "==========================================${NC}\n"

# Dapatkan path absolut script backup
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKUP_SCRIPT="$SCRIPT_DIR/backup_database.sh"

# Cek apakah script backup ada
if [ ! -f "$BACKUP_SCRIPT" ]; then
    echo -e "${YELLOW}[ERROR] Script backup tidak ditemukan: $BACKUP_SCRIPT${NC}"
    exit 1
fi

# Buat script executable
chmod +x "$BACKUP_SCRIPT"
echo -e "${GREEN}✓ Script backup dibuat executable${NC}"

# Cron job entry (Senin, Rabu, Jumat jam 02:00)
# Format crontab: menit jam hari bulan hari_dalam_minggu perintah
# 0 = Minggu, 1 = Senin, 2 = Selasa, 3 = Rabu, 4 = Kamis, 5 = Jumat, 6 = Sabtu
CRON_JOB="0 2 * * 1,3,5 $BACKUP_SCRIPT >> $SCRIPT_DIR/backup.log 2>&1"

# Cek apakah cron job sudah ada
crontab -l 2>/dev/null | grep -q "$BACKUP_SCRIPT"

if [ $? -eq 0 ]; then
    echo -e "${YELLOW}⚠ Cron job untuk backup sudah ada!${NC}"
    echo -e "\nCron job saat ini:"
    crontab -l | grep "$BACKUP_SCRIPT"
    echo ""
    read -p "Apakah Anda ingin mengupdate cron job? (y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Setup dibatalkan."
        exit 0
    fi
    
    # Hapus cron job lama
    crontab -l | grep -v "$BACKUP_SCRIPT" | crontab -
    echo -e "${GREEN}✓ Cron job lama dihapus${NC}"
fi

# Tambahkan cron job baru
(crontab -l 2>/dev/null; echo "$CRON_JOB") | crontab -

if [ $? -eq 0 ]; then
    echo -e "\n${GREEN}✓ Cron job berhasil ditambahkan!${NC}\n"
    echo -e "${BLUE}Jadwal Backup:${NC}"
    echo "  - Hari: Senin, Rabu, Jumat"
    echo "  - Waktu: 02:00 AM"
    echo "  - Retention: 7 backup terakhir"
    echo ""
    echo -e "${BLUE}Cron job yang aktif:${NC}"
    crontab -l | grep "$BACKUP_SCRIPT"
    echo ""
    echo -e "${YELLOW}Tips:${NC}"
    echo "  • Lihat crontab: crontab -l"
    echo "  • Edit crontab: crontab -e"
    echo "  • Hapus crontab: crontab -r"
    echo "  • Test manual: $BACKUP_SCRIPT"
    echo "  • Lihat log: tail -f $SCRIPT_DIR/backup.log"
else
    echo -e "${YELLOW}[ERROR] Gagal menambahkan cron job!${NC}"
    exit 1
fi

echo -e "\n${GREEN}Setup selesai!${NC}"
echo -e "${BLUE}==========================================${NC}"

exit 0
