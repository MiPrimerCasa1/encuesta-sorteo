import { useCallback, useState } from "react";
import { LOGO_URL, TEXTOS } from "../data/branding";
import { REDES_SOCIALES } from "../data/socialLinks";

type Props = {
  telefonoAsesor: string;
};

function enlaceContactoAsesor(telefonoAsesor: string): { href: string; externo: boolean } {
  const digits = telefonoAsesor.replace(/\D/g, "");
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

function SorpresaSection({ telefonoAsesor }: Props) {
  const [ofertaVisible, setOfertaVisible] = useState(false);

  const revelar = useCallback(() => {
    setOfertaVisible(true);
  }, []);

  const contacto = enlaceContactoAsesor(telefonoAsesor);
  const telefonoLimpio = telefonoAsesor.trim();
  const tieneTelefonoValido = telefonoLimpio.replace(/\D/g, "").length >= 8;

  return (
    <section className="sorpresa-card" aria-labelledby="sorpresa-heading">
      <h2 id="sorpresa-heading" className="sorpresa-card__titulo">
        {TEXTOS.sorpresaTitulo}
      </h2>

      {!ofertaVisible ? (
        <button
          type="button"
          className="sorpresa-card__tocar"
          onClick={revelar}
          aria-expanded={false}
          aria-controls="sorpresa-oferta-panel"
        >
          <span className="sorpresa-card__tocar-brillo" aria-hidden="true" />
          <img
            src={LOGO_URL}
            alt=""
            className="sorpresa-card__tocar-logo"
            width={80}
            height={80}
            decoding="async"
          />
          <span className="sorpresa-card__tocar-texto">{TEXTOS.sorpresaCta}</span>
        </button>
      ) : null}

      {ofertaVisible ? (
        <div
          id="sorpresa-oferta-panel"
          className="sorpresa-card__oferta"
          role="region"
          aria-labelledby="sorpresa-oferta-titulo"
        >
          <p id="sorpresa-oferta-titulo" className="sorpresa-card__oferta-titulo">
            <span className="sorpresa-card__oferta-titulo-pre">
              {TEXTOS.sorpresaDescuentoAntesPct}
            </span>
            <span className="sorpresa-card__oferta-pct">{TEXTOS.sorpresaDescuentoPct}</span>
            <span className="sorpresa-card__oferta-titulo-post">
              {TEXTOS.sorpresaDescuentoDespuesPct}
            </span>
          </p>
          <p className="sorpresa-card__oferta-texto">
            {TEXTOS.sorpresaDescuentoTexto}
          </p>
          <a
            className="sorpresa-card__btn-asesor"
            href={contacto.href}
            target={contacto.externo ? "_blank" : undefined}
            rel={contacto.externo ? "noopener noreferrer" : undefined}
          >
            <span className="sorpresa-card__btn-asesor-linea">{TEXTOS.sorpresaAsesorCta}</span>
            {tieneTelefonoValido ? (
              <span className="sorpresa-card__btn-asesor-num">{telefonoLimpio}</span>
            ) : null}
          </a>
        </div>
      ) : null}
    </section>
  );
}

export default SorpresaSection;
