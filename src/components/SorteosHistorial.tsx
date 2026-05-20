import { useState } from "react";
import { SORTEOS_HISTORIAL } from "../data/sorteosHistorial";
import { TEXTOS } from "../data/branding";

const iconoTrofeo = (
  <svg
    className="sorteos-historial__icono-titulo"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    aria-hidden="true"
  >
    <path d="M8 21h8M12 17v4M7 4h10v3a5 5 0 0 1-10 0V4Z" />
    <path d="M7 7H4a2 2 0 0 0 2 3h1M17 7h3a2 2 0 0 1-2 3h-1" />
  </svg>
);

const iconoCalendario = (
  <svg
    className="sorteos-historial__icono-año"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    aria-hidden="true"
  >
    <rect x="3" y="5" width="18" height="16" rx="2" />
    <path d="M3 10h18M8 3v4M16 3v4" />
  </svg>
);

const iconoCamara = (
  <svg
    className="sorteos-historial__icono-fotos"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    aria-hidden="true"
  >
    <path d="M4 7h4l2-2h4l2 2h4a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2Z" />
    <circle cx="12" cy="13" r="3.5" />
  </svg>
);

const iconoCerrar = (
  <svg
    className="sorteos-historial__icono-fotos"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    aria-hidden="true"
  >
    <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" />
  </svg>
);

function SorteosHistorial() {
  const [fotoAbierta, setFotoAbierta] = useState<number | null>(null);

  return (
    <section
      className="sorteos-historial footer__seccion"
      aria-labelledby="sorteos-historial-titulo"
    >
      <h2 id="sorteos-historial-titulo" className="footer__titulo">
        <span className="footer__titulo-inner">
          <span className="footer__titulo-icono" aria-hidden="true">
            {iconoTrofeo}
          </span>
          <span>{TEXTOS.historialSorteosTitulo}</span>
        </span>
      </h2>

      <ul className="sorteos-historial__lista">
        {SORTEOS_HISTORIAL.map((item) => (
          <li key={item.año} className="sorteos-historial__item">
            <div className="sorteos-historial__cabecera">
              <div className="sorteos-historial__año-wrap">
                {iconoCalendario}
                <span className="sorteos-historial__año">{item.año}</span>
              </div>
              <div className="sorteos-historial__acciones">
                {item.fotoGanador ? (
                  <button
                    type="button"
                    className={`sorteos-historial__btn-fotos${fotoAbierta === item.año ? " sorteos-historial__btn-fotos--activo" : ""}`}
                    onClick={() =>
                      setFotoAbierta(fotoAbierta === item.año ? null : item.año)
                    }
                    aria-expanded={fotoAbierta === item.año}
                  >
                    <span className="sorteos-historial__btn-fotos-icono" aria-hidden="true">
                      {fotoAbierta === item.año ? iconoCerrar : iconoCamara}
                    </span>
                    {fotoAbierta === item.año ? "Cerrar fotos" : TEXTOS.historialSorteosBtnFotos}
                  </button>
                ) : (
                  <span className="sorteos-historial__btn-fotos sorteos-historial__btn-fotos--pronto">
                    <span className="sorteos-historial__btn-fotos-icono" aria-hidden="true">
                      {iconoCamara}
                    </span>
                    Fotos próximamente
                  </span>
                )}
              </div>
            </div>
            <p className="sorteos-historial__detalle">{item.detalle}</p>
            {fotoAbierta === item.año && (
              <div className="sorteos-historial__foto-wrap">
                <img
                  src={item.fotoGanador}
                  alt={`Ganadores del sorteo ${item.año}`}
                  className="sorteos-historial__foto"
                />
              </div>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

export default SorteosHistorial;
