import { Check } from "lucide-react";

function SuccessMessage() {
  return (
    <div
      id="seccion-resultado-encuesta"
      className="pr-success"
      role="status"
      aria-live="polite"
    >
      <div className="pr-check" aria-hidden="true">
        <Check size={28} strokeWidth={3} />
      </div>
      <p className="pr-success-text">
        <strong>¡Felicitaciones!</strong>
        Ya estás participando por el sorteo de las motos.
      </p>
    </div>
  );
}

export default SuccessMessage;
