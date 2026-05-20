import { LOGO_URL, LOGO_URL_FALLBACK, TEXTOS } from "../data/branding";
import PrizeCarousel from "./PrizeCarousel";

interface Props {
  telefono: string;
  /** Nombre o etiqueta del vendedor/promotor (viene del parámetro `vendedor` en la URL). */
  etiquetaPromotor: string;
}

function Header({ telefono, etiquetaPromotor }: Props) {
  return (
    <header className="header">
      <div className="header__logo-wrap">
        <picture>
          <source srcSet={LOGO_URL} type="image/webp" />
          <img
            className="header__logo"
            src={LOGO_URL_FALLBACK}
            alt="Logo Mi Primer Casa S.A."
            width={280}
            height={120}
            decoding="async"
            fetchPriority="high"
          />
        </picture>
      </div>
      <h1 className="header__titulo">{TEXTOS.tituloPrincipal}</h1>
      <span className="header__badge">{TEXTOS.badge}</span>

      <PrizeCarousel />

      <div className="header__info-card">
        <div className="header__info-item">
          <span className="header__info-label header__info-label--celular">CELULAR PARTICIPANTE</span>
          <span className="header__info-valor">{telefono || "_"}</span>
        </div>
        <div className="header__info-divisor" aria-hidden="true" />
        <div className="header__info-item">
          <span className="header__info-label">PROMOTOR</span>
          <span className="header__info-valor">{etiquetaPromotor || "_"}</span>
        </div>
      </div>
    </header>
  );
}

export default Header;
