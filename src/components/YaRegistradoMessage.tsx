type Props = {
  mensaje: string;
};

function YaRegistradoMessage({ mensaje }: Props) {
  return (
    <div className="ya-registrado-card" role="alert" aria-live="polite">
      <span className="ya-registrado-card__icono-wrap" aria-hidden="true">
        <span className="ya-registrado-card__icono">!</span>
      </span>
      <h2 className="ya-registrado-card__titulo">Participación ya registrada</h2>
      <p className="ya-registrado-card__mensaje">{mensaje}</p>
    </div>
  );
}

export default YaRegistradoMessage;
