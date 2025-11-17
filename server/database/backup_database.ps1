# ===================================================================
# BACKUP DATABASE SCRIPT - Windows PowerShell
# ===================================================================
# Jalankan script ini SEBELUM reset database
# ===================================================================

# Konfigurasi (sesuaikan dengan .env Anda)
$DB_USER = "root"
$DB_NAME = "pengaduan_sarpras"
$BACKUP_DIR = "backup"
$TIMESTAMP = Get-Date -Format "yyyyMMdd_HHmmss"
$BACKUP_FILE = "$BACKUP_DIR/pengaduan_sarpras_$TIMESTAMP.sql"

# Buat folder backup jika belum ada
if (!(Test-Path $BACKUP_DIR)) {
    New-Item -ItemType Directory -Path $BACKUP_DIR
    Write-Host "✅ Folder backup dibuat: $BACKUP_DIR" -ForegroundColor Green
}

Write-Host "`n🔄 Memulai backup database..." -ForegroundColor Cyan
Write-Host "Database: $DB_NAME" -ForegroundColor Yellow
Write-Host "File output: $BACKUP_FILE" -ForegroundColor Yellow

# Prompt password
Write-Host "`n🔐 Masukkan password MySQL:" -ForegroundColor Cyan
$DB_PASSWORD = Read-Host -AsSecureString
$DB_PASSWORD_PLAIN = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($DB_PASSWORD))

# Jalankan mysqldump
try {
    $process = Start-Process -FilePath "mysqldump" `
        -ArgumentList "-u$DB_USER -p$DB_PASSWORD_PLAIN --databases $DB_NAME --routines --triggers --events" `
        -RedirectStandardOutput $BACKUP_FILE `
        -NoNewWindow `
        -Wait `
        -PassThru

    if ($process.ExitCode -eq 0) {
        $fileSize = (Get-Item $BACKUP_FILE).Length / 1KB
        Write-Host "`n✅ Backup berhasil!" -ForegroundColor Green
        Write-Host "📁 File: $BACKUP_FILE" -ForegroundColor Green
        Write-Host "📊 Size: $([math]::Round($fileSize, 2)) KB" -ForegroundColor Green
        Write-Host "`n💡 Simpan file backup ini dengan aman!" -ForegroundColor Yellow
        Write-Host "💡 Jika ada masalah, restore dengan perintah:" -ForegroundColor Yellow
        Write-Host "   mysql -u$DB_USER -p $DB_NAME < $BACKUP_FILE" -ForegroundColor Cyan
    } else {
        Write-Host "`n❌ Backup gagal! Exit code: $($process.ExitCode)" -ForegroundColor Red
        Write-Host "💡 Periksa:" -ForegroundColor Yellow
        Write-Host "   1. MySQL service running" -ForegroundColor White
        Write-Host "   2. Username & password benar" -ForegroundColor White
        Write-Host "   3. Database '$DB_NAME' ada" -ForegroundColor White
    }
} catch {
    Write-Host "`n❌ Error: $_" -ForegroundColor Red
    Write-Host "💡 Pastikan mysqldump ada di PATH" -ForegroundColor Yellow
    Write-Host "   Atau gunakan MySQL Workbench untuk backup manual" -ForegroundColor Yellow
}

Write-Host "`n" # Empty line
