#!/usr/bin/env bash
# Envía mensaje a Slack Incoming Webhook.
# Requiere: SLACK_WEBHOOK_URL
# Uso: send-slack.sh "Título" "Cuerpo en markdown"
set -euo pipefail

if [ -z "${SLACK_WEBHOOK_URL:-}" ]; then
  echo "SLACK_WEBHOOK_URL no configurado — omitiendo Slack."
  exit 0
fi

TITLE="${1:-Notificación}"
BODY="${2:-}"

export TITLE BODY SLACK_WEBHOOK_URL
python3 <<'PY'
import json
import os
import urllib.request

webhook = os.environ["SLACK_WEBHOOK_URL"]
title = os.environ.get("TITLE", "Notificación")[:150]
body = os.environ.get("BODY", "")[:3500]

payload = {
    "text": title,
    "blocks": [
        {
            "type": "header",
            "text": {"type": "plain_text", "text": title, "emoji": True},
        },
        {
            "type": "section",
            "text": {"type": "mrkdwn", "text": body or "_(sin detalle)_"},
        },
    ],
}

data = json.dumps(payload).encode("utf-8")
req = urllib.request.Request(
    webhook,
    data=data,
    headers={"Content-Type": "application/json"},
    method="POST",
)
with urllib.request.urlopen(req, timeout=30) as resp:
    print(f"Slack HTTP {resp.status}")
PY
