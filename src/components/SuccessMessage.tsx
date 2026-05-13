function SuccessMessage() {
  return (
    <div
      id="seccion-resultado-encuesta"
      className="success-card"
      role="status"
      aria-live="polite"
    >
      <span className="success-card__icono-wrap" aria-hidden="true">
        <span className="success-card__icono">✓</span>
      </span>
      <h2 className="success-card__titulo">Gracias ya estás participando</h2>
    </div>
  );
}

export default SuccessMessage;
