# ===================================================================
# RESTORE DATABASE SCRIPT - Windows PowerShell
# ===================================================================
# Jalankan script ini untuk restore dari backup
# ===================================================================

# Konfigurasi
$DB_USER = "root"
$DB_NAME = "pengaduan_sarpras"
$BACKUP_DIR = "backup"

Write-Host "`n🔄 RESTORE DATABASE DARI BACKUP" -ForegroundColor Cyan
Write-Host "=" * 50 -ForegroundColor Gray

# List semua backup file
Write-Host "`n📁 Backup files tersedia:" -ForegroundColor Yellow
$backupFiles = Get-ChildItem -Path $BACKUP_DIR -Filter "*.sql" | Sort-Object LastWriteTime -Descending

if ($backupFiles.Count -eq 0) {
    Write-Host "❌ Tidak ada file backup di folder '$BACKUP_DIR'" -ForegroundColor Red
    Write-Host "💡 Jalankan backup_database.ps1 dulu" -ForegroundColor Yellow
    exit
}

$index = 1
foreach ($file in $backupFiles) {
    $size = [math]::Round($file.Length / 1KB, 2)
    $date = $file.LastWriteTime.ToString("yyyy-MM-dd HH:mm:ss")
    Write-Host "$index. $($file.Name) - $size KB - $date" -ForegroundColor White
    $index++
}

# Pilih file
Write-Host "`n🔢 Pilih nomor file untuk restore (atau 0 untuk batal): " -ForegroundColor Cyan -NoNewline
$choice = Read-Host

if ($choice -eq "0") {
    Write-Host "❌ Restore dibatalkan" -ForegroundColor Yellow
    exit
}

$choiceInt = [int]$choice
if ($choiceInt -lt 1 -or $choiceInt -gt $backupFiles.Count) {
    Write-Host "❌ Pilihan tidak valid!" -ForegroundColor Red
    exit
}

$selectedFile = $backupFiles[$choiceInt - 1]
$backupPath = Join-Path $BACKUP_DIR $selectedFile.Name

Write-Host "`n⚠️  PERINGATAN!" -ForegroundColor Red
Write-Host "Restore akan MENIMPA semua data di database '$DB_NAME'" -ForegroundColor Red
Write-Host "File backup: $backupPath" -ForegroundColor Yellow
Write-Host "`n❓ Yakin ingin melanjutkan? (y/n): " -ForegroundColor Cyan -NoNewline
$confirm = Read-Host

if ($confirm -ne "y" -and $confirm -ne "Y") {
    Write-Host "❌ Restore dibatalkan" -ForegroundColor Yellow
    exit
}

# Prompt password
Write-Host "`n🔐 Masukkan password MySQL:" -ForegroundColor Cyan
$DB_PASSWORD = Read-Host -AsSecureString
$DB_PASSWORD_PLAIN = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($DB_PASSWORD))

# Jalankan restore
Write-Host "`n🔄 Memulai restore..." -ForegroundColor Cyan

try {
    $process = Start-Process -FilePath "mysql" `
        -ArgumentList "-u$DB_USER -p$DB_PASSWORD_PLAIN $DB_NAME" `
        -RedirectStandardInput $backupPath `
        -NoNewWindow `
        -Wait `
        -PassThru

    if ($process.ExitCode -eq 0) {
        Write-Host "`n✅ Restore berhasil!" -ForegroundColor Green
        Write-Host "📊 Database '$DB_NAME' sudah dikembalikan ke backup: $($selectedFile.Name)" -ForegroundColor Green
        Write-Host "`n💡 Jangan lupa restart backend:" -ForegroundColor Yellow
        Write-Host "   cd server" -ForegroundColor Cyan
        Write-Host "   pm2 restart pengaduan-backend" -ForegroundColor Cyan
    } else {
        Write-Host "`n❌ Restore gagal! Exit code: $($process.ExitCode)" -ForegroundColor Red
    }
} catch {
    Write-Host "`n❌ Error: $_" -ForegroundColor Red
}

Write-Host "`n" # Empty line
