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
      <h2 className="success-card__titulo">Ya estás participando</h2>
      <p className="success-card__mensaje">
       ¡Gracias! 
        Un asesor de Mi Primer Casa S.A. se pondrá en contacto en breve.
      </p>
    </div>
  );
}

export default SuccessMessage;
