#!/bin/bash
# Pegar este script en la consola SSH del VPS (ya logueado como root)
# o ejecutar: bash vps-bootstrap.sh
set -euo pipefail

APP_DIR="/var/www/landingqr"
REPO_URL="${REPO_URL:-https://github.com/MiPrimerCasa/encuesta-sorteo.git}"
BRANCH="${BRANCH:-main}"

echo "==> Paquetes base"
export DEBIAN_FRONTEND=noninteractive
apt-get update -y
apt-get install -y curl git nginx ufw build-essential

if ! command -v node >/dev/null 2>&1; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y nodejs
fi
npm install -g pm2

ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable || true

echo "==> Código"
mkdir -p /var/www
if [ -d "$APP_DIR/.git" ]; then
  cd "$APP_DIR"
  git fetch origin
  git checkout "$BRANCH"
  git pull origin "$BRANCH"
else
  git clone --branch "$BRANCH" "$REPO_URL" "$APP_DIR"
  cd "$APP_DIR"
fi

if [ ! -f .env ]; then
  cp .env.example .env
  echo ""
  echo "IMPORTANTE: editá $APP_DIR/.env con DB_HOST, DB_USER, DB_PASSWORD, etc."
  echo "  nano $APP_DIR/.env"
fi

npm ci
npm run build

pm2 delete encuesta-landingqr 2>/dev/null || true
pm2 start deploy/ecosystem.config.cjs
pm2 save
pm2 startup systemd -u root --hp /root || true

cp deploy/nginx-encuesta.conf /etc/nginx/sites-available/encuesta
ln -sf /etc/nginx/sites-available/encuesta /etc/nginx/sites-enabled/encuesta
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl reload nginx

echo ""
echo "==> Probar (requiere .env con SQL correcto):"
echo "  curl -s http://127.0.0.1:3001/api/health"
echo "  curl -sI http://127.0.0.1/ | head -5"
