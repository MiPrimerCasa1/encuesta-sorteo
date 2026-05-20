# Comando Slack `/vps` — consultar el servidor

Dos formas de tener info del VPS en Slack:

| Opción | Cuándo usarla |
|--------|----------------|
| **A. Bot `/vps` en el VPS** | On-demand, respuesta en segundos |
| **B. GitHub Actions (cron)** | Reportes automáticos 3×/día (ya configurado en `.github/workflows/vps-status-slack.yml`) |

---

## A. Slash command `/vps` (recomendado)

### 1. Crear app en Slack

1. https://api.slack.com/apps → **Create New App** → From scratch.
2. **Slash Commands** → Create:
   - Command: `/vps`
   - Request URL: `https://slack-vps.srv955546.hstgr.cloud/slack/vps`
   - Short description: `Estado del VPS encuesta`
3. **Basic Information** → copiar **Signing Secret**.
4. Instalar la app en tu workspace (**Install to Workspace**).
5. (Opcional) Restringir quién usa el comando en **Manage Distribution** / permisos del canal.

### 2. DNS

Registro **A** (o CNAME):

`slack-vps.srv955546.hstgr.cloud` → `72.60.12.48`

### 3. En el VPS

```bash
cd /opt/encuesta-landingqr
git pull origin main

cp deploy/slack-vps-bot/.env.example deploy/slack-vps-bot/.env
nano deploy/slack-vps-bot/.env   # pegar SLACK_SIGNING_SECRET

cd /root
docker compose -f docker-compose.yml -f /opt/encuesta-landingqr/deploy/docker-compose.slack-vps-bot.yml up -d --build
```

### 4. Probar

En Slack: `/vps` → primero “Consultando VPS…”, luego el reporte (contenedores, disco, API, commit).

`/vps help` — ayuda.

### Seguridad

- Slack firma cada request (`SLACK_SIGNING_SECRET` obligatorio).
- Socket Docker **solo lectura** en el contenedor del bot.
- Podés fijar `SLACK_TEAM_ID` para un solo workspace.

---

## B. Solo reportes automáticos (sin comando)

Secret en GitHub **production**: `SLACK_WEBHOOK_URL`.

- Cron: 08:00, 14:00, 20:00 UTC.
- Manual: Actions → **VPS status → Slack** → **Run workflow**.

---

## C. Alternativa sin código: n8n

Si preferís no levantar el bot, en **n8n** (`n8n.srv955546.hstgr.cloud`):

1. Webhook → ejecutar comando en host (requiere acceso SSH o n8n en host).
2. Responder a Slack con el texto.

El bot dedicado es más simple de mantener para `/vps` puro.
