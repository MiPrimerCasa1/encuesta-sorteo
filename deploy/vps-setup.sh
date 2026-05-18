#!/bin/bash
# Configuración inicial del VPS (Ubuntu/Debian). Ejecutar como root:
#   bash deploy/vps-setup.sh
set -euo pipefail

export DEBIAN_FRONTEND=noninteractive

echo "==> Actualizar paquetes"
apt-get update -y
apt-get upgrade -y

echo "==> Dependencias base"
apt-get install -y curl git nginx ufw build-essential

echo "==> Node.js 20 LTS"
if ! command -v node >/dev/null 2>&1; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y nodejs
fi
node -v
npm -v

echo "==> PM2"
npm install -g pm2

echo "==> Firewall (SSH + HTTP + HTTPS)"
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

echo "==> Carpeta de la app"
mkdir -p /var/www/landingqr
chown -R "${SUDO_USER:-root}:root" /var/www/landingqr 2>/dev/null || true

echo ""
echo "Listo. Siguiente:"
echo "  1) Clonar el repo en /var/www/landingqr"
echo "  2) Crear .env con datos de SQL Server"
echo "  3) npm ci && npm run build"
echo "  4) pm2 start deploy/ecosystem.config.cjs && pm2 save && pm2 startup"
echo "  5) Copiar deploy/nginx-encuesta.conf y certbot --nginx"
