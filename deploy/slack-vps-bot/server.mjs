/**
 * Slash command de Slack → estado del VPS (solo lectura).
 * Variables: SLACK_SIGNING_SECRET, VPS_STATUS_SCRIPT, PORT
 */
import http from "node:http";
import crypto from "node:crypto";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { readFileSync } from "node:fs";

const execFileAsync = promisify(execFile);
const PORT = Number(process.env.PORT || process.env.SLACK_BOT_PORT || 3099);
const SIGNING_SECRET = process.env.SLACK_SIGNING_SECRET || "";
const VERIFICATION_TOKEN = process.env.SLACK_VERIFICATION_TOKEN || "";
const COLLECT_SCRIPT =
  process.env.VPS_STATUS_SCRIPT || "/opt/encuesta-landingqr/deploy/vps-status-collect.sh";
const ALLOWED_TEAM_ID = process.env.SLACK_TEAM_ID || "";

function readRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

function verifySlackSignature(rawBody, timestamp, signature) {
  if (!SIGNING_SECRET || !timestamp || !signature) return false;
  const ageSec = Math.abs(Date.now() / 1000 - Number(timestamp));
  if (Number.isNaN(ageSec) || ageSec > 60 * 5) return false;
  const base = `v0:${timestamp}:${rawBody.toString("utf8")}`;
  const digest = `v0=${crypto.createHmac("sha256", SIGNING_SECRET).update(base).digest("hex")}`;
  try {
    return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(signature));
  } catch {
    return false;
  }
}

async function postToSlack(responseUrl, text, responseType = "in_channel") {
  const res = await fetch(responseUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      response_type: responseType,
      text: text.slice(0, 3900),
    }),
  });
  if (!res.ok) {
    console.error("Slack response_url error:", res.status, await res.text());
  }
}

async function collectVpsStatus() {
  const { stdout } = await execFileAsync("bash", [COLLECT_SCRIPT], {
    timeout: 25_000,
    maxBuffer: 512 * 1024,
    env: { ...process.env, APP_DIR: process.env.APP_DIR || "/opt/encuesta-landingqr" },
  });
  return stdout.trim();
}

async function handleSlash(body) {
  const params = new URLSearchParams(body.toString("utf8"));
  const command = params.get("command") || "";
  const text = (params.get("text") || "").trim().toLowerCase();
  const responseUrl = params.get("response_url") || "";
  const teamId = params.get("team_id") || "";

  if (ALLOWED_TEAM_ID && teamId !== ALLOWED_TEAM_ID) {
    return { text: "No autorizado para este workspace.", ephemeral: true };
  }

  if (command !== "/vps") {
    return {
      text: "Comando desconocido. Usá `/vps` o `/vps help`.",
      ephemeral: true,
    };
  }

  if (text === "help" || text === "ayuda") {
    return {
      text: [
        "*Comandos*",
        "• `/vps` — estado del servidor (Docker, disco, API, commit)",
        "• `/vps help` — esta ayuda",
        "",
        "También hay reportes automáticos vía GitHub Actions (cron).",
      ].join("\n"),
      ephemeral: true,
    };
  }

  if (!responseUrl) {
    return { text: "Falta response_url de Slack.", ephemeral: true };
  }

  setImmediate(async () => {
    try {
      const report = await collectVpsStatus();
      await postToSlack(responseUrl, report);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      await postToSlack(
        responseUrl,
        `❌ Error al consultar el VPS:\n\`\`\`${msg}\`\`\``,
        "ephemeral"
      );
    }
  });

  return { text: "Consultando VPS…", ephemeral: true, async: true };
}

const server = http.createServer(async (req, res) => {
  if (req.method === "GET" && req.url === "/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ ok: true, service: "slack-vps-bot" }));
    return;
  }

  if (req.method !== "POST" || req.url !== "/slack/vps") {
    res.writeHead(404);
    res.end("Not found");
    return;
  }

  const rawBody = await readRawBody(req);
  const timestamp = req.headers["x-slack-request-timestamp"];
  const signature = req.headers["x-slack-signature"];

  const bodyStr = rawBody.toString("utf8");
  const params = new URLSearchParams(bodyStr);
  const slackToken = params.get("token") || "";

  const firmaOk = verifySlackSignature(rawBody, timestamp, signature);
  const tokenOk =
    Boolean(VERIFICATION_TOKEN) && slackToken === VERIFICATION_TOKEN;

  if (!firmaOk && !tokenOk) {
    res.writeHead(401);
    res.end("Unauthorized");
    return;
  }

  try {
    const result = await handleSlash(rawBody);
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        response_type: result.ephemeral ? "ephemeral" : "in_channel",
        text: result.text,
      })
    );
  } catch (err) {
    console.error(err);
    res.writeHead(500);
    res.end("Internal error");
  }
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`slack-vps-bot listening on :${PORT}`);
  if (!SIGNING_SECRET) {
    console.warn("WARN: SLACK_SIGNING_SECRET vacío — verificar firmas desactivado en prod");
  }
  try {
    readFileSync(COLLECT_SCRIPT);
  } catch {
    console.warn(`WARN: no se encuentra ${COLLECT_SCRIPT}`);
  }
});
