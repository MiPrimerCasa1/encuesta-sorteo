import cors from "cors";
import Database from "better-sqlite3";
import express from "express";
import fs from "node:fs";
import { z } from "zod";

const app = express();
const PORT = process.env.API_PORT || 3001;

fs.mkdirSync("data", { recursive: true });
const db = new Database("data/surveys.db");
db.pragma("journal_mode = WAL");
db.exec(`
  CREATE TABLE IF NOT EXISTS sorteos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    codigo_sorteo TEXT NOT NULL UNIQUE,
    nombre_sorteo TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
`);
db.exec(`
  CREATE TABLE IF NOT EXISTS formularios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sorteo_id INTEGER NOT NULL,
    codigo_formulario TEXT NOT NULL,
    nombre_formulario TEXT NOT NULL,
    activo INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(sorteo_id, codigo_formulario),
    FOREIGN KEY (sorteo_id) REFERENCES sorteos(id)
  );
`);
db.exec(`
  CREATE TABLE IF NOT EXISTS preguntas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    formulario_id INTEGER NOT NULL,
    codigo_pregunta TEXT NOT NULL,
    texto_pregunta TEXT NOT NULL,
    tipo_pregunta TEXT NOT NULL,
    obligatoria INTEGER NOT NULL DEFAULT 1,
    orden INTEGER NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(formulario_id, codigo_pregunta),
    FOREIGN KEY (formulario_id) REFERENCES formularios(id)
  );
`);
db.exec(`
  CREATE TABLE IF NOT EXISTS respuestas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    formulario_id INTEGER NOT NULL,
    sorteo_id INTEGER NOT NULL,
    nombre_completo TEXT NOT NULL,
    barrio TEXT NOT NULL,
    codigo_promotor TEXT NOT NULL,
    codigo_qr TEXT,
    mensaje_whatsapp TEXT,
    origen TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (formulario_id) REFERENCES formularios(id),
    FOREIGN KEY (sorteo_id) REFERENCES sorteos(id)
  );
`);
db.exec(`
  CREATE TABLE IF NOT EXISTS respuestas_detalle (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    respuesta_id INTEGER NOT NULL,
    pregunta_id INTEGER NOT NULL,
    valor_texto TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (respuesta_id) REFERENCES respuestas(id),
    FOREIGN KEY (pregunta_id) REFERENCES preguntas(id)
  );
`);

const verificarDuplicado = db.prepare(`
  SELECT id
  FROM respuestas
  WHERE nombre_completo = @nombreCompleto
    AND barrio = @barrio
    AND sorteo_id = @sorteoId
    AND codigo_promotor = @codigoPromotor
    AND date(created_at) = date('now', 'localtime')
  LIMIT 1;
`);
const guardarSorteo = db.prepare(`
  INSERT INTO sorteos (codigo_sorteo, nombre_sorteo)
  VALUES (@idSorteo, @nombreSorteo)
  ON CONFLICT(codigo_sorteo) DO UPDATE SET nombre_sorteo = excluded.nombre_sorteo;
`);
const obtenerSorteo = db.prepare(`
  SELECT id FROM sorteos WHERE codigo_sorteo = @idSorteo LIMIT 1;
`);
const guardarFormulario = db.prepare(`
  INSERT INTO formularios (sorteo_id, codigo_formulario, nombre_formulario, activo)
  VALUES (@sorteoId, 'encuesta_base_v1', 'Encuesta Base', 1)
  ON CONFLICT(sorteo_id, codigo_formulario) DO NOTHING;
`);
const obtenerFormulario = db.prepare(`
  SELECT id FROM formularios
  WHERE sorteo_id = @sorteoId AND codigo_formulario = 'encuesta_base_v1'
  LIMIT 1;
`);
const guardarPregunta = db.prepare(`
  INSERT INTO preguntas (
    formulario_id, codigo_pregunta, texto_pregunta, tipo_pregunta, obligatoria, orden
  ) VALUES (
    @formularioId, @codigoPregunta, @textoPregunta, @tipoPregunta, @obligatoria, @orden
  )
  ON CONFLICT(formulario_id, codigo_pregunta) DO UPDATE SET
    texto_pregunta = excluded.texto_pregunta,
    tipo_pregunta = excluded.tipo_pregunta,
    obligatoria = excluded.obligatoria,
    orden = excluded.orden;
`);
const obtenerIdPregunta = db.prepare(`
  SELECT id FROM preguntas
  WHERE formulario_id = @formularioId AND codigo_pregunta = @codigoPregunta
  LIMIT 1;
`);
const insertRespuesta = db.prepare(`
  INSERT INTO respuestas (
    formulario_id, sorteo_id, nombre_completo, barrio,
    codigo_promotor, codigo_qr, mensaje_whatsapp, origen
  ) VALUES (
    @formularioId, @sorteoId, @nombreCompleto, @barrio,
    @codigoPromotor, @codigoQr, @mensajeWhatsapp, @origen
  );
`);
const insertRespuestaDetalle = db.prepare(`
  INSERT INTO respuestas_detalle (respuesta_id, pregunta_id, valor_texto)
  VALUES (@idRespuesta, @idPregunta, @valor);
`);

const encuestaSchema = z.object({
  participante: z.object({
    nombreCompleto: z.string().trim().min(3).max(120),
    barrio: z.string().trim().min(2).max(80),
  }),
  respuestas: z
    .array(
      z.object({
        codigoPregunta: z.string().trim().min(3).max(60),
        valor: z.string().trim().min(1).max(120),
      })
    )
    .min(3),
  idSorteo: z.string().trim().min(3).max(40),
  nombreSorteo: z.string().trim().min(3).max(120),
  codigoPromotor: z.string().trim().min(2).max(40),
  codigoQr: z.string().trim().max(80).optional().default(""),
  mensajeWhatsapp: z.string().trim().max(80).optional().default(""),
  origen: z.string().trim().min(3).max(80),
});
const preguntasBase = [
  {
    codigoPregunta: "conoce_firma",
    textoPregunta: "Conoce la firma Mi Primera Casa?",
    tipoPregunta: "opcion_unica",
    obligatoria: 1,
    orden: 1,
  },
  {
    codigoPregunta: "conoce_cuota_55000",
    textoPregunta: "Sabias que con $55.000 pesos por mes ya arrancas pagando tu terreno?",
    tipoPregunta: "opcion_unica",
    obligatoria: 1,
    orden: 2,
  },
  {
    codigoPregunta: "quiere_mas_info",
    textoPregunta: "Queres mas informacion?",
    tipoPregunta: "opcion_unica",
    obligatoria: 1,
    orden: 3,
  },
  {
    codigoPregunta: "horario_llamada",
    textoPregunta: "En que horario puede recibir llamadas?",
    tipoPregunta: "opcion_unica_condicional",
    obligatoria: 0,
    orden: 4,
  },
];

function asegurarFormularioDinamico(idSorteo, nombreSorteo) {
  guardarSorteo.run({ idSorteo, nombreSorteo });
  const sorteo = obtenerSorteo.get({ idSorteo });
  guardarFormulario.run({ sorteoId: sorteo.id });
  const formulario = obtenerFormulario.get({ sorteoId: sorteo.id });
  for (const pregunta of preguntasBase) {
    guardarPregunta.run({ ...pregunta, formularioId: formulario.id });
  }
  return { sorteoId: sorteo.id, formularioId: formulario.id };
}

app.use(cors());
app.use(express.json());

app.get("/api/health", (_, res) => {
  res.json({ ok: true, service: "survey-api" });
});

app.post("/api/survey", (req, res) => {
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
  if (mapaRespuestas.quiere_mas_info === "si" && !mapaRespuestas.horario_llamada) {
    return res.status(400).json({
      message: "Debes indicar un horario para recibir llamadas.",
    });
  }
  const setup = asegurarFormularioDinamico(payload.idSorteo, payload.nombreSorteo);

  const duplicate = verificarDuplicado.get({
    nombreCompleto: payload.participante.nombreCompleto,
    barrio: payload.participante.barrio,
    sorteoId: setup.sorteoId,
    codigoPromotor: payload.codigoPromotor,
  });

  if (duplicate) {
    return res.status(409).json({
      message:
        "Ya existe un registro para este participante y codigo en el dia de hoy.",
    });
  }

  const result = insertRespuesta.run({
    formularioId: setup.formularioId,
    sorteoId: setup.sorteoId,
    nombreCompleto: payload.participante.nombreCompleto,
    barrio: payload.participante.barrio,
    codigoPromotor: payload.codigoPromotor,
    codigoQr: payload.codigoQr,
    mensajeWhatsapp: payload.mensajeWhatsapp,
    origen: payload.origen,
  });
  for (const respuesta of payload.respuestas) {
    const question = obtenerIdPregunta.get({
      formularioId: setup.formularioId,
      codigoPregunta: respuesta.codigoPregunta,
    });
    if (!question) continue;
    insertRespuestaDetalle.run({
      idRespuesta: result.lastInsertRowid,
      idPregunta: question.id,
      valor: respuesta.valor,
    });
  }

  return res.status(201).json({
    id: result.lastInsertRowid,
    message: "Encuesta registrada correctamente.",
  });
});

app.listen(PORT, () => {
  console.log(`API de encuestas ejecutandose en http://localhost:${PORT}`);
});
