import { useCallback, useState } from "react";
import { LOGO_URL, TEXTOS } from "../data/branding";
import { REDES_SOCIALES } from "../data/socialLinks";

type Props = {
  telefono: string;
};

const insigniaDescuento = (
  <span className="sorpresa-card__pct-badge" aria-hidden="true">
    %
  </span>
);

function enlaceContactoAsesor(telefono: string): { href: string; externo: boolean } {
  const digits = telefono.replace(/\D/g, "");
  if (digits.length >= 8) {
    const texto = encodeURIComponent(
      "Hola, quiero información sobre el descuento y los productos disponibles."
    );
    return {
      href: `https://wa.me/${digits}?text=${texto}`,
      externo: true,
    };
  }
  const instagram = REDES_SOCIALES.find((r) => r.red === "Instagram");
  return {
    href: instagram?.url ?? "#",
    externo: true,
  };
}

function SorpresaSection({ telefono }: Props) {
  const [ofertaVisible, setOfertaVisible] = useState(false);

  const revelar = useCallback(() => {
    setOfertaVisible(true);
  }, []);

  const contacto = enlaceContactoAsesor(telefono);

  return (
    <section className="sorpresa-card" aria-labelledby="sorpresa-heading">
      <h2 id="sorpresa-heading" className="sorpresa-card__titulo">
        {TEXTOS.sorpresaTitulo}
      </h2>

      <div className="sorpresa-card__zona-interactiva">
        <button
          type="button"
          className="sorpresa-card__logo-btn"
          onClick={revelar}
          aria-expanded={ofertaVisible}
          aria-controls="sorpresa-oferta-panel"
        >
          <img
            src={LOGO_URL}
            alt=""
            className={
              ofertaVisible
                ? "sorpresa-card__logo sorpresa-card__logo--estatico"
                : "sorpresa-card__logo"
            }
            width={160}
            height={160}
            decoding="async"
          />
          {!ofertaVisible ? (
            <span className="sorpresa-card__logo-hint">{TEXTOS.sorpresaCta}</span>
          ) : null}
        </button>
      </div>

      {ofertaVisible ? (
        <div
          id="sorpresa-oferta-panel"
          className="sorpresa-card__oferta"
          role="region"
          aria-labelledby="sorpresa-oferta-titulo"
        >
          <div className="sorpresa-card__oferta-cabecera">
            {insigniaDescuento}
            <p id="sorpresa-oferta-titulo" className="sorpresa-card__oferta-titulo">
              {TEXTOS.sorpresaDescuentoEncabezado}
            </p>
          </div>
          <p className="sorpresa-card__oferta-texto">
            {TEXTOS.sorpresaDescuentoTexto}
          </p>
          <a
            className="sorpresa-card__btn-asesor"
            href={contacto.href}
            target={contacto.externo ? "_blank" : undefined}
            rel={contacto.externo ? "noopener noreferrer" : undefined}
          >
            {TEXTOS.sorpresaAsesorCta}
          </a>
        </div>
      ) : null}
    </section>
  );
}

export default SorpresaSection;
