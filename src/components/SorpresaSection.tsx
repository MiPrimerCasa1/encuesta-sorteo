import { useEffect, useRef, useState, type ReactNode } from "react";
import { TEXTOS } from "../data/branding";
import logoArreglado from "../assets/Logo-Arreglado (1).png";

type Props = {
  telefonoAsesor: string;
  masInfoBloque: ReactNode;
};

function SorpresaSection({ masInfoBloque }: Props) {
  const [visible, setVisible] = useState(false);
  const [descubierto, setDescubierto] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      ref={sectionRef}
      className={`pr-surprise${visible ? " visible" : ""}${descubierto ? " revealed" : ""}`}
      aria-labelledby="pr-sorpresa-heading"
    >
      {!descubierto && (
        <p id="pr-sorpresa-heading" className="pr-surprise-title">
          {TEXTOS.sorpresaTitulo}
        </p>
      )}

      <div className="pr-inner">
        {!descubierto ? (
          <div className="pr-pulse-stage">
            <div className="pr-pulse-btn-wrap">
              <span className="pr-ring" aria-hidden="true" />
              <span className="pr-ring" aria-hidden="true" />
              <span className="pr-ring" aria-hidden="true" />
              <span className="pr-ring" aria-hidden="true" />
              <button
                type="button"
                className="pr-pulse-btn"
                onClick={() => setDescubierto(true)}
                aria-label="Revelar sorpresa"
              >
                <img src={logoArreglado} alt="" className="pr-pulse-logo" aria-hidden="true" />
              </button>
            </div>
            <span className="pr-pulse-label" aria-hidden="true">PULSA</span>
          </div>
        ) : (
          <div className="pr-discount visible">
            <p className="pr-discount-line" aria-label="Hasta un 40% OFF de descuento">
              <span className="prefix">{TEXTOS.sorpresaDescuentoAntesPct}</span>
              <span className="number">
                40<span className="pct">%</span>
              </span>
              <span className="off">OFF</span>
            </p>
            <p className="pr-discount-sub">
              En productos seleccionados,{" "}
              <b>SIN OBLIGACIÓN DE COMPRA.</b>
              <br />
              También participás del sorteo del terreno.
            </p>
          </div>
        )}
      </div>

      {descubierto && masInfoBloque}
    </div>
  );
}

export default SorpresaSection;
