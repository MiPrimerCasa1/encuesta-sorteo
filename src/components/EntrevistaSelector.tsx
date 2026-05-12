import { useState, useEffect, useRef, type ReactNode } from "react";

export type ModalidadEntrevista = "telefonica" | "sucursal" | "domicilio" | "";

type Props = {
  fechaSeleccionada: string;
  horaSeleccionada: string;
  modalidadSeleccionada: ModalidadEntrevista;
  domicilioIngresado: string;
  onFechaChange: (v: string) => void;
  onHoraChange: (v: string) => void;
  onModalidadChange: (v: ModalidadEntrevista) => void;
  onDomicilioChange: (v: string) => void;
  deshabilitado: boolean;
  sucursalSupervisor?: string;
};

const HORARIOS: string[] = [];
for (let h = 8; h <= 20; h++) {
  HORARIOS.push(`${String(h).padStart(2, "0")}:00`);
  if (h < 20) HORARIOS.push(`${String(h).padStart(2, "0")}:30`);
}

const DIAS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

function getProximasFechas(cantidad = 10): Array<{ valor: string; etiqueta: string }> {
  const fechas: Array<{ valor: string; etiqueta: string }> = [];
  const d = new Date();
  d.setDate(d.getDate() + 1);
  while (fechas.length < cantidad) {
    if (d.getDay() !== 0) {
      const valor = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      fechas.push({ valor, etiqueta: `${DIAS[d.getDay()]} ${d.getDate()} ${MESES[d.getMonth()]}` });
    }
    d.setDate(d.getDate() + 1);
  }
  return fechas;
}

function formatearFechaCorta(fechaStr: string): string {
  if (!fechaStr) return "FECHA";
  const [y, m, dia] = fechaStr.split("-").map(Number);
  const d = new Date(y, m - 1, dia);
  return `${DIAS[d.getDay()]} ${d.getDate()} ${MESES[d.getMonth()]}`;
}

function EntrevistaSelector({
  fechaSeleccionada,
  horaSeleccionada,
  modalidadSeleccionada,
  domicilioIngresado,
  onFechaChange,
  onHoraChange,
  onModalidadChange,
  onDomicilioChange,
  deshabilitado,
  sucursalSupervisor,
}: Props) {
  const claseContenedor = `entrevista-selector${deshabilitado ? " entrevista-selector--deshabilitado" : ""}`;
  const [menuFechaAbierto, setMenuFechaAbierto] = useState(false);
  const menuFechaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuFechaAbierto) return;
    const handler = (e: MouseEvent) => {
      if (menuFechaRef.current && !menuFechaRef.current.contains(e.target as Node)) {
        setMenuFechaAbierto(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [menuFechaAbierto]);

  const iconoCalendario = (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 9h18M8 3v4M16 3v4" strokeLinecap="round" />
      <circle cx="16" cy="15" r="3" />
      <path d="M16 13.5V15l1 .8" strokeLinecap="round" />
    </svg>
  );

  const iconoTelefono = (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M6.6 10.8a15.6 15.6 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1.05-.25 11.4 11.4 0 0 0 3.55.6 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1C9.4 21 3 14.6 3 7a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.6 3.55a1 1 0 0 1-.25 1.05L6.6 10.8Z" />
    </svg>
  );

  const iconoSucursal = (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9.5 12 3l9 6.5V21H3V9.5Z" />
      <path d="M9 21v-6h6v6" />
    </svg>
  );

  const iconoDomicilio = (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2a8 8 0 0 0-8 8c0 5.5 7.1 11.4 7.4 11.7a1 1 0 0 0 1.2 0C12.9 21.4 20 15.5 20 10a8 8 0 0 0-8-8Zm0 11a3 3 0 1 1 0-6 3 3 0 0 1 0 6Z" />
    </svg>
  );

  const iconoPin = (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2a8 8 0 0 0-8 8c0 5.5 7.1 11.4 7.4 11.7a1 1 0 0 0 1.2 0C12.9 21.4 20 15.5 20 10a8 8 0 0 0-8-8Zm0 11a3 3 0 1 1 0-6 3 3 0 0 1 0 6Z" />
    </svg>
  );

  const MODALIDADES: { valor: ModalidadEntrevista; etiqueta: string; icono: ReactNode }[] = [
    { valor: "telefonica", etiqueta: "Telefónica", icono: iconoTelefono },
    { valor: "sucursal", etiqueta: "En sucursal", icono: iconoSucursal },
    { valor: "domicilio", etiqueta: "En mi domicilio", icono: iconoDomicilio },
  ];

  return (
    <div className={claseContenedor}>
      <div className="entrevista-selector__fila">
        <span className="entrevista-selector__icono-wrap" aria-hidden="true">
          <span className="entrevista-selector__icono">{iconoCalendario}</span>
        </span>
        <p className="entrevista-selector__titulo">Acordá tu entrevista</p>
      </div>

      <div className="entrevista-selector__fecha-hora">
        <div className="entrevista-selector__campo">
          <label className="entrevista-selector__label">Fecha</label>
          <div className="fecha-picker" ref={menuFechaRef}>
            <button
              type="button"
              className={`fecha-picker__btn${fechaSeleccionada ? " fecha-picker__btn--sel" : ""}${menuFechaAbierto ? " fecha-picker__btn--abierto" : ""}`}
              onClick={() => { if (!deshabilitado) setMenuFechaAbierto((v) => !v); }}
              disabled={deshabilitado}
              aria-expanded={menuFechaAbierto}
              aria-haspopup="listbox"
            >
              <span className="fecha-picker__icono-cal" aria-hidden="true">{iconoCalendario}</span>
              <span className="fecha-picker__texto">
                {fechaSeleccionada ? formatearFechaCorta(fechaSeleccionada) : "FECHA"}
              </span>
              <span className="fecha-picker__chevron" aria-hidden="true">▾</span>
            </button>
            {menuFechaAbierto && !deshabilitado && (
              <div className="fecha-picker__menu" role="listbox" aria-label="Seleccioná una fecha">
                {getProximasFechas(10).map(({ valor, etiqueta }) => (
                  <button
                    key={valor}
                    type="button"
                    role="option"
                    aria-selected={fechaSeleccionada === valor}
                    className={`fecha-picker__opcion${fechaSeleccionada === valor ? " fecha-picker__opcion--sel" : ""}`}
                    onClick={() => { onFechaChange(valor); setMenuFechaAbierto(false); }}
                  >
                    {etiqueta}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="entrevista-selector__campo">
          <label className="entrevista-selector__label" htmlFor="hora-contacto">
            Hora de contacto
          </label>
          <select
            id="hora-contacto"
            className="entrevista-selector__select"
            value={horaSeleccionada}
            onChange={(e) => onHoraChange(e.target.value)}
            disabled={deshabilitado}
          >
            <option value="">--:--</option>
            {HORARIOS.map((h) => (
              <option key={h} value={h}>{h} hs</option>
            ))}
          </select>
        </div>
      </div>

      <p className="entrevista-selector__subtitulo">¿Cómo preferís la entrevista?</p>

      <div className="entrevista-selector__modalidades">
        {MODALIDADES.map(({ valor, etiqueta, icono }) => (
          <button
            key={valor}
            type="button"
            className={`entrevista-selector__mod-btn${
              modalidadSeleccionada === valor && !deshabilitado
                ? " entrevista-selector__mod-btn--sel"
                : ""
            }`}
            onClick={() => onModalidadChange(valor)}
            disabled={deshabilitado}
          >
            <span className="entrevista-selector__mod-icono" aria-hidden="true">
              {icono}
            </span>
            {etiqueta}
          </button>
        ))}
      </div>

      {modalidadSeleccionada === "sucursal" && sucursalSupervisor && !deshabilitado ? (
        <div className="entrevista-selector__info-sucursal">
          <span className="entrevista-selector__info-sucursal-icono" aria-hidden="true">
            {iconoPin}
          </span>
          {sucursalSupervisor}
        </div>
      ) : null}

      {modalidadSeleccionada === "domicilio" && !deshabilitado ? (
        <div className="entrevista-selector__domicilio-wrap">
          <input
            type="text"
            className="entrevista-selector__domicilio-input"
            placeholder="Ingresá tu dirección completa"
            value={domicilioIngresado}
            onChange={(e) => onDomicilioChange(e.target.value)}
            autoComplete="street-address"
            maxLength={150}
          />
        </div>
      ) : null}
    </div>
  );
}

export default EntrevistaSelector;
