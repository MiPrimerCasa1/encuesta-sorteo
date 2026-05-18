#!/bin/bash
# Actualizar código en el VPS (desde /var/www/landingqr).
# Uso: bash deploy/deploy-app.sh
set -euo pipefail

APP_DIR="${APP_DIR:-/var/www/landingqr}"
cd "$APP_DIR"

echo "==> Git pull"
git pull origin main

echo "==> Dependencias y build"
npm ci
npm run build

echo "==> Reiniciar PM2"
pm2 restart encuesta-landingqr || pm2 start deploy/ecosystem.config.cjs
pm2 save

echo "==> Health"
sleep 2
curl -sf "http://127.0.0.1:3001/api/health" && echo "" || echo "AVISO: /api/health no respondió — revisar .env y SQL Server"

echo "Deploy local terminado."
