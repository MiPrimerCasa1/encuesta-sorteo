import { useLayoutEffect, useMemo, useState } from "react";
import BranchFooter from "./components/BranchFooter";
import Header from "./components/Header";
import QuestionCard from "./components/QuestionCard";
import SubmitButton from "./components/SubmitButton";
import SorpresaSection from "./components/SorpresaSection";
import SuccessMessage from "./components/SuccessMessage";
import YaRegistradoMessage from "./components/YaRegistradoMessage";
import TextInput from "./components/TextInput";
import TimeSelector from "./components/TimeSelector";

type FormData = {
  nombreCompleto: string;
  barrio: string;
  conoceFirma: "si" | "no" | "";
  conoceCuota55000: "si" | "no" | "";
  quiereMasInfo: "si" | "no" | "";
  horarioLlamada: "manana" | "tarde" | "";
};

const ESTADO_INICIAL: FormData = {
  nombreCompleto: "",
  barrio: "",
  conoceFirma: "",
  conoceCuota55000: "",
  quiereMasInfo: "",
  horarioLlamada: "",
};

function obtenerCodigoPromotor(codigoCrudo: string): string {
  const coincidencia = codigoCrudo.toLowerCase().match(/_v(\d{1,2})$/);
  return coincidencia ? `v${coincidencia[1]}` : "sin_codigo";
}

function obtenerIdSorteo(codigoCrudo: string): string {
  const coincidencia = codigoCrudo.toLowerCase().match(/(sorteo\d{1,3})/);
  return coincidencia ? coincidencia[1] : "sorteo_default";
}

function normalizarIdSorteo(valor: string | null): string {
  if (!valor) return "";
  const limpio = valor.trim().toLowerCase();
  if (!limpio) return "";
  const coincidencia = limpio.match(/(sorteo\d{1,3})/);
  return coincidencia ? coincidencia[1] : limpio;
}

function formatearNombreSorteo(idSorteo: string): string {
  const coincidencia = idSorteo.match(/^sorteo(\d{1,3})$/i);
  return coincidencia ? `Sorteo ${coincidencia[1]}` : "Sorteo vigente";
}

function obtenerParametro(params: URLSearchParams, claves: string[]): string {
  for (const clave of claves) {
    const valor = params.get(clave);
    if (valor && valor.trim()) return valor.trim();
  }
  return "";
}

/** Solo nombre del promotor (sin "Supervisado por …" u otros sufijos del sistema). */
function nombrePromotorParaMostrar(texto: string): string {
  const limpio = texto.trim();
  if (!limpio) return "";
  const cortado = limpio.split(/\s+[Ss]upervisad[oa]\s+por\b/i)[0];
  return cortado?.trim() || limpio;
}

function App() {
  const params = useMemo(() => new URLSearchParams(window.location.search), []);

  /** Solo en `npm run dev`: ver pantalla post-envío sin llamar a la API. */
  const previewEnviado =
    import.meta.env.DEV &&
    (params.get("preview") === "enviado" || params.get("preview") === "ok");
  const previewYaRegistrado =
    import.meta.env.DEV &&
    params.get("preview") === "registrado" &&
    !previewEnviado;

  const [datos, setDatos] = useState<FormData>(ESTADO_INICIAL);
  const [errores, setErrores] = useState<string[]>([]);
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(previewEnviado);
  const [errorEnvio, setErrorEnvio] = useState("");
  const [mensajeYaRegistrado, setMensajeYaRegistrado] = useState(
    previewYaRegistrado
      ? "Vista previa: participación ya registrada."
      : ""
  );
  const codigoQr =
    obtenerParametro(params, ["codigo_qr", "qr_code", "wa_msg", "codigo", "Codigo"]) || "";
  /** Valor que envía la BD → SP `@usuario` (ej. SORTEO01_V1); no usar `vendedor` aquí. */
  const codigoPromotor =
    obtenerParametro(params, ["codigo", "Codigo", "codigo_promotor", "promotor", "v"]) ||
    obtenerCodigoPromotor(codigoQr);
  /** Texto que muestra la tarjeta PROMOTOR (solo nombre; viene del parámetro `vendedor`). */
  const vendedorCrudo = obtenerParametro(params, ["vendedor", "Vendedor"]);
  const etiquetaPromotor = vendedorCrudo
    ? nombrePromotorParaMostrar(vendedorCrudo) || codigoPromotor
    : codigoPromotor;
  const idSorteo =
    normalizarIdSorteo(obtenerParametro(params, ["id_sorteo", "idSorteo", "sorteo_id", "raffle_id"])) ||
    normalizarIdSorteo(obtenerParametro(params, ["encuesta", "Encuesta", "ENCUESTA"])) ||
    normalizarIdSorteo(obtenerParametro(params, ["sorteo", "Sorteo"])) ||
    obtenerIdSorteo(codigoQr);
  const nombreSorteo =
    params.get("nombre_sorteo") ??
    params.get("raffle_name") ??
    params.get("sorteo_nombre") ??
    formatearNombreSorteo(idSorteo);
  const mensajeWhatsapp = obtenerParametro(params, ["wa_msg", "codigo", "Codigo"]) || codigoQr;
  const telefono =
    obtenerParametro(params, ["telefono", "Telefono", "phone", "tel"]) || "";

  /**
   * Tras enviar: siempre llevar la vista al mensaje principal (éxito o ya registrado),
   * antes del resto del contenido (sorpresa, footer).
   */
  useLayoutEffect(() => {
    if (!enviado && mensajeYaRegistrado.length === 0) return;
    const el = document.getElementById("seccion-resultado-encuesta");
    if (!el) return;
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    const behavior = prefersReduced ? "auto" : "smooth";
    const scroll = () => {
      el.scrollIntoView({ behavior, block: "start", inline: "nearest" });
    };
    requestAnimationFrame(() => {
      requestAnimationFrame(scroll);
    });
  }, [enviado, mensajeYaRegistrado]);

  const actualizarCampo = <K extends keyof FormData>(campo: K, valor: FormData[K]) => {
    setDatos((prev) => {
      const nuevo = { ...prev, [campo]: valor };
      if (campo === "quiereMasInfo" && valor === "no") {
        nuevo.horarioLlamada = "";
      }
      return nuevo;
    });
  };

  const validar = () => {
    const erroresNuevos: string[] = [];
    if (!datos.nombreCompleto.trim()) erroresNuevos.push("Ingresá tu nombre y apellido.");
    if (!datos.barrio.trim()) erroresNuevos.push("Ingresá tu barrio o dirección.");
    if (!datos.conoceFirma || !datos.conoceCuota55000 || !datos.quiereMasInfo) {
      erroresNuevos.push("Respondé todas las preguntas obligatorias.");
    }
    if (!telefono.trim()) {
      erroresNuevos.push("No se recibió el teléfono desde WhatsApp.");
    }
    if (datos.quiereMasInfo === "si" && !datos.horarioLlamada) {
      erroresNuevos.push("Seleccioná un horario de llamado.");
    }
    setErrores(erroresNuevos);
    return erroresNuevos.length === 0;
  };

  const handleSubmit = async () => {
    setErrorEnvio("");
    setMensajeYaRegistrado("");
    if (!validar()) return;

    try {
      setEnviando(true);
      const respuestas: Array<{ codigoPregunta: string; valor: string }> = [
        { codigoPregunta: "conoce_firma", valor: datos.conoceFirma },
        { codigoPregunta: "conoce_cuota_55000", valor: datos.conoceCuota55000 },
        { codigoPregunta: "quiere_mas_info", valor: datos.quiereMasInfo },
      ];
      if (datos.quiereMasInfo === "si") {
        respuestas.push({ codigoPregunta: "horario_llamada", valor: datos.horarioLlamada });
      }

      const payload = {
        participante: {
          nombreCompleto: datos.nombreCompleto,
          barrio: datos.barrio,
        },
        respuestas,
        codigoPromotor,
        idSorteo,
        nombreSorteo,
        codigoQr,
        telefono,
        mensajeWhatsapp,
        origen: "whatsapp-encuesta-directa",
      };

      const response = await fetch("/api/survey", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = (await response.json().catch(() => ({}))) as {
        message?: string;
        code?: string;
      };

      if (response.status === 409 || body.code === "ALREADY_REGISTERED") {
        setMensajeYaRegistrado(
          body.message?.trim() ||
            "Este teléfono ya fue registrado en esta encuesta."
        );
        return;
      }

      if (!response.ok) {
        throw new Error(body.message ?? "No pudimos enviar la encuesta. Intentá nuevamente.");
      }
      setEnviado(true);
    } catch (error) {
      setErrorEnvio(error instanceof Error ? error.message : "Error inesperado al enviar.");
    } finally {
      setEnviando(false);
    }
  };

  const iconoPersona = (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0v1H4Z" />
    </svg>
  );
  const iconoPin = (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2a8 8 0 0 0-8 8c0 5.5 7.1 11.4 7.4 11.7a1 1 0 0 0 1.2 0C12.9 21.4 20 15.5 20 10a8 8 0 0 0-8-8Zm0 11a3 3 0 1 1 0-6 3 3 0 0 1 0 6Z" />
    </svg>
  );
  const iconoInfo = (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm0 5a1.4 1.4 0 1 1 0 2.8A1.4 1.4 0 0 1 12 7Zm1.5 11h-3v-1h.5a.5.5 0 0 0 .5-.5v-4a.5.5 0 0 0-.5-.5h-.5v-1h2.5a.5.5 0 0 1 .5.5v5a.5.5 0 0 0 .5.5h.5v1Z" />
    </svg>
  );
  const iconoDolar = (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 2v20" />
      <path d="M17 6H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  );
  const iconoChat = (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M4 4h12a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H9l-4 3v-3H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z" />
      <path d="M20 9h.5a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H20v3l-3-3h-5v-2h7a1 1 0 0 0 1-1V9Z" />
    </svg>
  );

  return (
    <div className="app-container">
      <Header telefono={telefono} etiquetaPromotor={etiquetaPromotor} />

      {enviado ? (
        <>
          <SuccessMessage />
          <SorpresaSection telefono={telefono} />
        </>
      ) : mensajeYaRegistrado ? (
        <YaRegistradoMessage mensaje={mensajeYaRegistrado} />
      ) : (
        <>
          <main className="card-principal">
            <TextInput
              name="nombreCompleto"
              icono={iconoPersona}
              placeholder="Nombre y apellido"
              value={datos.nombreCompleto}
              onChange={(v) => actualizarCampo("nombreCompleto", v)}
              autoComplete="name"
            />
            <TextInput
              name="barrio"
              icono={iconoPin}
              placeholder="Barrio o dirección"
              value={datos.barrio}
              onChange={(v) => actualizarCampo("barrio", v)}
              autoComplete="street-address"
            />

            <QuestionCard
              icono={iconoInfo}
              pregunta="¿Conocés la inmobiliaria Mi Primer Casa S.A.?"
              valorSeleccionado={datos.conoceFirma}
              onChange={(v) => actualizarCampo("conoceFirma", v)}
            />
            <QuestionCard
              icono={iconoDolar}
              pregunta="¿Sabías que con $55.000 por mes (cuotas fijas) comenzás pagando tu terreno?"
              valorSeleccionado={datos.conoceCuota55000}
              onChange={(v) => actualizarCampo("conoceCuota55000", v)}
            />
            <QuestionCard
              icono={iconoChat}
              pregunta="¿Querés más información?"
              hint="Si elegís Sí, podrás indicar el horario de contacto."
              valorSeleccionado={datos.quiereMasInfo}
              onChange={(v) => actualizarCampo("quiereMasInfo", v)}
            />
            <TimeSelector
              valorSeleccionado={datos.horarioLlamada}
              onChange={(v) => actualizarCampo("horarioLlamada", v)}
              deshabilitado={datos.quiereMasInfo !== "si"}
            />

            {errores.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {errores.map((msg) => (
                  <div className="error-mensaje" key={msg}>
                    {msg}
                  </div>
                ))}
              </div>
            ) : null}

            {errorEnvio ? <div className="error-mensaje">{errorEnvio}</div> : null}
          </main>

          <SubmitButton enviando={enviando} onClick={handleSubmit} />
        </>
      )}

      <BranchFooter desbloqueado={enviado || mensajeYaRegistrado.length > 0} />
    </div>
  );
}

export default App;
