#!/bin/bash
# Recolecta métricas del VPS (solo lectura). Ejecutar en el servidor o vía SSH.
set -euo pipefail

APP_DIR="${APP_DIR:-/opt/encuesta-landingqr}"
ENCUESTA_HOST="${ENCUESTA_HOST:-www.miprimercasafsa-sorteo.com}"

hostname_fqdn="$(hostname -f 2>/dev/null || hostname)"
uptime_human="$(uptime -p 2>/dev/null || uptime | sed 's/.*up /up /')"
load_avg="$(awk '{printf "load 1/5/15m: %s %s %s", $1,$2,$3}' /proc/loadavg 2>/dev/null || uptime | awk -F'load average:' '{print "load"$2}')"
mem_line="$(free -h | awk '/^Mem:/ {printf "%s usados / %s total (%s libres)", $3, $2, $4}')"
disk_root="$(df -h / | awk 'NR==2 {printf "%s usados / %s (%s)", $3, $2, $5}')"
disk_opt="$(df -h /opt 2>/dev/null | awk 'NR==2 {printf "%s usados / %s (%s)", $3, $2, $5}' || echo "—")"

encuesta_status="$(docker ps --filter name=encuesta-landingqr --format '{{.Status}}' 2>/dev/null | head -1)"
encuesta_stats="$(docker stats encuesta-landingqr --no-stream --format 'CPU {{.CPUPerc}} · RAM {{.MemUsage}}' 2>/dev/null | head -1)"
traefik_status="$(docker ps --filter name=traefik --format '{{.Names}} {{.Status}}' 2>/dev/null | head -1)"

health_body="$(curl -sfk -H "Host: ${ENCUESTA_HOST}" "https://127.0.0.1/api/health" 2>/dev/null || echo '{"ok":false}')"
health_ok="$(echo "$health_body" | grep -q '"ok":true' && echo "OK" || echo "FALLO")"

git_head="$(git -C "$APP_DIR" log -1 --oneline 2>/dev/null || echo "desconocido")"
docker_count="$(docker ps -q 2>/dev/null | wc -l | tr -d ' ')"

cat <<EOF
*Host:* \`${hostname_fqdn}\` · IP pública \`${ENCUESTA_HOST}\`
*Uptime:* ${uptime_human} · ${load_avg}
*Memoria:* ${mem_line}
*Disco /* ${disk_root}
*Disco /opt:* ${disk_opt}
*Contenedores activos:* ${docker_count}
*encuesta-landingqr:* ${encuesta_status:-no encontrado}
*Recursos encuesta:* ${encuesta_stats:-—}
*Traefik:* ${traefik_status:-—}
*API /api/health:* ${health_ok} \`${health_body}\`
*Código desplegado:* \`${git_head}\`
EOF
