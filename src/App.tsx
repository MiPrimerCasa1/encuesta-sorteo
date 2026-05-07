import { useMemo, useState } from "react";
import type { FormEvent } from "react";

type FormData = {
  nombreCompleto: string;
  barrio: string;
  conoceFirma: "si" | "no" | "";
  conoceCuota55000: "si" | "no" | "";
  quiereMasInfo: "si" | "no" | "";
  horarioLlamada: "manana" | "tarde" | "";
};
type SurveyAnswer = {
  codigoPregunta: string;
  valor: string;
};

const initialForm: FormData = {
  nombreCompleto: "",
  barrio: "",
  conoceFirma: "",
  conoceCuota55000: "",
  quiereMasInfo: "",
  horarioLlamada: "",
};

function obtenerCodigoPromotor(codigoCrudo: string): string {
  const normalizado = codigoCrudo.toLowerCase();
  const coincidencia = normalizado.match(/_v(\d{1,2})$/);
  if (coincidencia) {
    return `v${coincidencia[1]}`;
  }
  return "sin_codigo";
}

function obtenerIdSorteo(codigoCrudo: string): string {
  const normalizado = codigoCrudo.toLowerCase();
  const coincidencia = normalizado.match(/(sorteo\d{1,3})/);
  if (coincidencia) {
    return coincidencia[1];
  }
  return "sorteo_default";
}

function formatearNombreSorteo(idSorteo: string): string {
  const coincidencia = idSorteo.match(/^sorteo(\d{1,3})$/i);
  if (!coincidencia) {
    return "Sorteo vigente";
  }
  return `Sorteo ${coincidencia[1]}`;
}

export default function App() {
  const [formulario, setFormulario] = useState<FormData>(initialForm);
  const [cargando, setCargando] = useState(false);
  const [mensajeOk, setMensajeOk] = useState("");
  const [mensajeError, setMensajeError] = useState("");

  const params = useMemo(() => new URLSearchParams(window.location.search), []);
  const codigoQr =
    params.get("codigo_qr") ??
    params.get("qr_code") ??
    params.get("wa_msg") ??
    params.get("codigo_promotor") ??
    "";
  const codigoPromotor =
    params.get("codigo_promotor") ??
    params.get("promotor") ??
    params.get("v") ??
    obtenerCodigoPromotor(codigoQr);
  const idSorteo =
    params.get("id_sorteo") ??
    params.get("raffle_id") ??
    params.get("sorteo") ??
    obtenerIdSorteo(codigoQr);
  const nombreSorteo =
    params.get("nombre_sorteo") ??
    params.get("raffle_name") ??
    params.get("sorteo_nombre") ??
    formatearNombreSorteo(idSorteo);
  const mensajeWhatsapp = params.get("wa_msg") ?? codigoQr;

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMensajeOk("");
    setMensajeError("");

    if (
      !formulario.conoceFirma ||
      !formulario.conoceCuota55000 ||
      !formulario.quiereMasInfo
    ) {
      setMensajeError("Completa todas las preguntas antes de continuar.");
      return;
    }

    if (formulario.quiereMasInfo === "si" && !formulario.horarioLlamada) {
      setMensajeError("Si queres mas informacion, selecciona un horario de llamado.");
      return;
    }

    setCargando(true);

    try {
      const respuestas: SurveyAnswer[] = [
        { codigoPregunta: "conoce_firma", valor: formulario.conoceFirma },
        { codigoPregunta: "conoce_cuota_55000", valor: formulario.conoceCuota55000 },
        { codigoPregunta: "quiere_mas_info", valor: formulario.quiereMasInfo },
      ];
      if (formulario.quiereMasInfo === "si") {
        respuestas.push({
          codigoPregunta: "horario_llamada",
          valor: formulario.horarioLlamada,
        });
      }

      const payload = {
        participante: {
          nombreCompleto: formulario.nombreCompleto,
          barrio: formulario.barrio,
        },
        respuestas,
        codigoPromotor,
        idSorteo,
        nombreSorteo,
        codigoQr,
        mensajeWhatsapp,
        origen: "whatsapp-encuesta-directa",
      };

      const response = await fetch("/api/survey", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const body = (await response.json().catch(() => ({}))) as { message?: string };
        throw new Error(body.message ?? "No se pudo guardar la encuesta.");
      }

      setMensajeOk("Registro completado. Gracias por participar del sorteo.");
      setFormulario(initialForm);
    } catch (error) {
      setMensajeError(error instanceof Error ? error.message : "Error inesperado al enviar.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <main className="page">
      <section className="card">
        <img
          src="/mi-primera-casa-logo.png"
          alt="Mi Primera Casa"
          className="brand-logo"
        />
        <h1>SORTEO GRATIS</h1>
        <p className="subtitle">{nombreSorteo}: dos motocicletas 110cc y un terreno</p>
        <p className="helper-text">
          Completa esta encuesta breve para participar. Te lleva menos de 1 minuto.
        </p>

        <form className="survey-form" onSubmit={onSubmit}>
          <label>
            Nombre y apellido
            <input
              value={formulario.nombreCompleto}
              onChange={(event) =>
                setFormulario({ ...formulario, nombreCompleto: event.target.value })
              }
              required
              maxLength={120}
            />
          </label>

          <label>
            Barrio
            <input
              value={formulario.barrio}
              onChange={(event) => setFormulario({ ...formulario, barrio: event.target.value })}
              required
              maxLength={80}
            />
          </label>

          <fieldset className="question">
            <legend>Conoce la firma Mi Primera Casa?</legend>
            <label className="option">
              <input
                type="checkbox"
                checked={formulario.conoceFirma === "si"}
                onChange={() => setFormulario({ ...formulario, conoceFirma: "si" })}
              />
              Si
            </label>
            <label className="option">
              <input
                type="checkbox"
                checked={formulario.conoceFirma === "no"}
                onChange={() => setFormulario({ ...formulario, conoceFirma: "no" })}
              />
              No
            </label>
          </fieldset>

          <fieldset className="question">
            <legend>
              Sabias que con $55.000 pesos por mes (cuotas fijas) ya arrancas pagando tu
              terreno?
            </legend>
            <label className="option">
              <input
                type="checkbox"
                checked={formulario.conoceCuota55000 === "si"}
                onChange={() =>
                  setFormulario({ ...formulario, conoceCuota55000: "si" })
                }
              />
              Si
            </label>
            <label className="option">
              <input
                type="checkbox"
                checked={formulario.conoceCuota55000 === "no"}
                onChange={() =>
                  setFormulario({ ...formulario, conoceCuota55000: "no" })
                }
              />
              No
            </label>
          </fieldset>

          <fieldset className="question">
            <legend>Queres mas informacion?</legend>
            <label className="option">
              <input
                type="checkbox"
                checked={formulario.quiereMasInfo === "si"}
                onChange={() => setFormulario({ ...formulario, quiereMasInfo: "si" })}
              />
              Si
            </label>
            <label className="option">
              <input
                type="checkbox"
                checked={formulario.quiereMasInfo === "no"}
                onChange={() =>
                  setFormulario({
                    ...formulario,
                    quiereMasInfo: "no",
                    horarioLlamada: "",
                  })
                }
              />
              No
            </label>
          </fieldset>

          {formulario.quiereMasInfo === "si" ? (
            <fieldset className="question">
              <legend>En que horario puede recibir llamadas?</legend>
              <label className="option">
                <input
                  type="checkbox"
                  checked={formulario.horarioLlamada === "manana"}
                  onChange={() =>
                    setFormulario({ ...formulario, horarioLlamada: "manana" })
                  }
                />
                Manana
              </label>
              <label className="option">
                <input
                  type="checkbox"
                  checked={formulario.horarioLlamada === "tarde"}
                  onChange={() =>
                    setFormulario({ ...formulario, horarioLlamada: "tarde" })
                  }
                />
                Tarde
              </label>
            </fieldset>
          ) : null}

          <button type="submit" disabled={cargando}>
            {cargando ? "Enviando..." : "Participar del sorteo"}
          </button>
        </form>

        {mensajeOk ? <p className="ok-message">{mensajeOk}</p> : null}
        {mensajeError ? <p className="error-message">{mensajeError}</p> : null}
      </section>
    </main>
  );
}
