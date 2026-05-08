import "dotenv/config";
import cors from "cors";
import express from "express";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sql from "mssql";
import { z } from "zod";

const app = express();
const PORT = process.env.PORT || process.env.API_PORT || 3001;
const SP_NAME = process.env.SP_NAME || "dbo.encuestaCargaSorteo01";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.resolve(__dirname, "../dist");

const sqlConfig = {
  server: process.env.DB_HOST || "",
  port: Number(process.env.DB_PORT || 1433),
  user: process.env.DB_USER || "",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "",
  options: {
    encrypt: process.env.DB_ENCRYPT === "true",
    trustServerCertificate: process.env.DB_TRUST_CERT !== "false",
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
};

let poolPromise;
function getPool() {
  if (!poolPromise) {
    poolPromise = sql.connect(sqlConfig);
  }
  return poolPromise;
}

const encuestaSchema = z.object({
  participante: z.object({
    nombreCompleto: z.string().trim().min(3).max(120),
    barrio: z.string().trim().min(2).max(100),
  }),
  respuestas: z
    .array(
      z.object({
        codigoPregunta: z.string().trim().min(3).max(60),
        valor: z.string().trim().min(1).max(120),
      })
    )
    .min(3),
  telefono: z.string().trim().min(8).max(50),
  idSorteo: z.string().trim().min(3).max(50),
  codigoPromotor: z.string().trim().min(2).max(100),
  nombreSorteo: z.string().trim().max(120).optional().default(""),
  codigoQr: z.string().trim().max(80).optional().default(""),
  mensajeWhatsapp: z.string().trim().max(100).optional().default(""),
  origen: z.string().trim().max(80).optional().default("whatsapp-encuesta-directa"),
});

function aMayusculas(valor) {
  return String(valor || "").trim().toUpperCase();
}

function obtenerPrimeraFilaResultado(resultado) {
  const conjuntos = resultado.recordsets?.length
    ? resultado.recordsets
    : resultado.recordset?.length
      ? [resultado.recordset]
      : [];
  return conjuntos.map((grupo) => grupo?.[0]).find(Boolean) ?? null;
}

function extraerMensajeProcedimiento(resultado) {
  const filas = [resultado.recordset ?? [], ...(resultado.recordsets ?? [])].flat();
  for (const fila of filas) {
    if (!fila || typeof fila !== "object") continue;
    const keys = ["mensaje", "message", "msg", "resultado", "detalle", "descripcion"];
    for (const key of keys) {
      const valor = fila[key];
      if (typeof valor === "string" && valor.trim()) return valor.trim();
    }
  }
  return "";
}

app.use(cors());
app.use(express.json());

app.get("/api/health", async (_, res) => {
  try {
    await getPool();
    res.json({ ok: true, service: "survey-api", db: "sqlserver" });
  } catch (error) {
    res.status(500).json({
      ok: false,
      service: "survey-api",
      message: error instanceof Error ? error.message : "Error de conexion SQL Server",
    });
  }
});

app.post("/api/survey", async (req, res) => {
  const parsed = encuestaSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      message: "Datos invalidos en la encuesta.",
      details: parsed.error.flatten(),
    });
  }

  const payload = parsed.data;
  const mapaRespuestas = Object.fromEntries(
    payload.respuestas.map((item) => [item.codigoPregunta, item.valor])
  );

  if (aMayusculas(mapaRespuestas.quiere_mas_info) === "SI" && !mapaRespuestas.horario_llamada) {
    return res.status(400).json({
      message: "Debes indicar un horario para recibir llamadas.",
    });
  }

  try {
    const pool = await getPool();
    const request = pool.request();

    request.input("telefono", sql.NVarChar(50), payload.telefono.trim());
    request.input("encuesta", sql.NVarChar(50), payload.idSorteo.trim());
    request.input("usuario", sql.NVarChar(100), payload.codigoPromotor.trim());

    request.input("campo1Codigo", sql.Int, 1);
    request.input("campo1Valor", sql.NVarChar(100), payload.participante.nombreCompleto.trim());
    request.input("campo2Codigo", sql.Int, 2);
    request.input("campo2Valor", sql.NVarChar(100), payload.participante.barrio.trim());
    request.input("campo3Codigo", sql.Int, 3);
    request.input("campo3Valor", sql.NVarChar(100), aMayusculas(mapaRespuestas.conoce_firma));
    request.input("campo4Codigo", sql.Int, 4);
    request.input(
      "campo4Valor",
      sql.NVarChar(100),
      aMayusculas(mapaRespuestas.conoce_cuota_55000)
    );
    request.input("campo5Codigo", sql.Int, 5);
    request.input("campo5Valor", sql.NVarChar(100), aMayusculas(mapaRespuestas.quiere_mas_info));
    request.input("campo6Codigo", sql.Int, 6);
    request.input(
      "campo6Valor",
      sql.NVarChar(100),
      aMayusculas(mapaRespuestas.horario_llamada || "")
    );

    const resultado = await request.execute(SP_NAME);
    const totalAfectadas = (resultado.rowsAffected || []).reduce((acc, n) => acc + Number(n || 0), 0);
    const primeraFila = obtenerPrimeraFilaResultado(resultado);
    const codigoResultado =
      primeraFila && typeof primeraFila === "object" && "codigo" in primeraFila
        ? Number(primeraFila.codigo)
        : null;
    const mensajeDb = extraerMensajeProcedimiento(resultado);
    const mensajeNormalizado = aMayusculas(mensajeDb);
    const yaRegistradoPorCodigo = codigoResultado === 0;
    const yaRegistradoPorMensaje =
      mensajeNormalizado.includes("YA") &&
      (mensajeNormalizado.includes("REGISTR") ||
        mensajeNormalizado.includes("DUPLIC") ||
        mensajeNormalizado.includes("EXISTE"));
    const yaRegistradoPorSinInsert = resultado.returnValue === 0 && totalAfectadas === 0;

    if (yaRegistradoPorCodigo || yaRegistradoPorMensaje || yaRegistradoPorSinInsert) {
      return res.status(409).json({
        message: mensajeDb || "Este teléfono ya fue registrado en el sorteo.",
        code: "ALREADY_REGISTERED",
        procedure: SP_NAME,
        result: {
          rowsAffected: resultado.rowsAffected,
          returnValue: resultado.returnValue,
        },
      });
    }

    return res.status(201).json({
      message: mensajeDb || "Encuesta registrada correctamente en SQL Server.",
      procedure: SP_NAME,
      result: {
        rowsAffected: resultado.rowsAffected,
        returnValue: resultado.returnValue,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error al ejecutar procedimiento en SQL Server.",
      detail: error instanceof Error ? error.message : "Error desconocido",
    });
  }
});

if (existsSync(distPath)) {
  app.use(express.static(distPath));

  app.get(/^(?!\/api).*/, (_req, res) => {
    return res.sendFile(path.join(distPath, "index.html"));
  });
}

app.listen(PORT, () => {
  console.log(`App de encuestas ejecutandose en http://localhost:${PORT}`);
});
