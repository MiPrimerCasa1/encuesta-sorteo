function YaRegistradoMessage() {
  return (
    <div
      id="seccion-resultado-encuesta"
      className="felicidades-card"
      role="status"
      aria-live="polite"
    >
      <span className="felicidades-card__icono-wrap" aria-hidden="true">
        <span className="felicidades-card__icono">✓</span>
      </span>
      <h2 className="felicidades-card__titulo">
        FELICIDADES YA ESTÁS PARTICIPANDO POR EL SORTEO DE LA MOTO
      </h2>
    </div>
  );
}

export default YaRegistradoMessage;
