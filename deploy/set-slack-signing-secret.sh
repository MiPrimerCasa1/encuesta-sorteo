#!/bin/bash
# En el VPS: guarda el Signing Secret de Slack y reinicia el bot.
set -euo pipefail
ENV_FILE="${ENV_FILE:-/opt/encuesta-landingqr/deploy/slack-vps-bot/.env}"

if [ -z "${1:-}" ]; then
  echo "Uso:"
  echo "  signing   bash deploy/set-slack-signing-secret.sh signing TU_SIGNING_SECRET"
  echo "  token     bash deploy/set-slack-signing-secret.sh token TU_VERIFICATION_TOKEN"
  exit 1
fi

MODE="${1:-}"
VALUE="${2:-}"
if [ -z "$VALUE" ]; then
  echo "Falta el valor del secret/token."
  exit 1
fi

mkdir -p "$(dirname "$ENV_FILE")"
touch "$ENV_FILE"
case "$MODE" in
  signing)
    grep -v '^SLACK_SIGNING_SECRET=' "$ENV_FILE" > "${ENV_FILE}.tmp" || true
    mv "${ENV_FILE}.tmp" "$ENV_FILE"
    echo "SLACK_SIGNING_SECRET=${VALUE}" >> "$ENV_FILE"
    ;;
  token)
    grep -v '^SLACK_VERIFICATION_TOKEN=' "$ENV_FILE" > "${ENV_FILE}.tmp" || true
    mv "${ENV_FILE}.tmp" "$ENV_FILE"
    echo "SLACK_VERIFICATION_TOKEN=${VALUE}" >> "$ENV_FILE"
    ;;
  *)
    echo "Modo inválido. Usá: signing | token"
    exit 1
    ;;
esac
chmod 600 "$ENV_FILE"

cd /root
docker compose -f docker-compose.yml -f /opt/encuesta-landingqr/deploy/docker-compose.slack-vps-bot.yml up -d slack-vps-bot

echo "OK. Probá en Slack: /vps"
