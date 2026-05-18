# Ejecutar UNA VEZ en PowerShell (te pedirá la contraseña de root del VPS):
#   powershell -ExecutionPolicy Bypass -File deploy/install-ssh-key.ps1

$KeyPub = "$env:USERPROFILE\.ssh\id_ed25519_landingqr.pub"
$SshHost = "72.60.12.48"
$User = "root"

if (-not (Test-Path $KeyPub)) {
  ssh-keygen -t ed25519 -f "$env:USERPROFILE\.ssh\id_ed25519_landingqr" -N '""' -q
}

$pub = Get-Content $KeyPub -Raw
Write-Host "Instalando llave en ${User}@${SshHost} (ingresá la contraseña cuando la pida)..."
$pub.Trim() | ssh "${User}@${SshHost}" "mkdir -p ~/.ssh && chmod 700 ~/.ssh && cat >> ~/.ssh/authorized_keys && chmod 600 ~/.ssh/authorized_keys && echo Llave instalada OK"
