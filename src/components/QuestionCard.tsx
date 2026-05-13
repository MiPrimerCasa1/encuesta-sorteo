import type { ReactNode } from "react";

type Props = {
  icono: ReactNode;
  pregunta: string;
  hint?: ReactNode;
  valorSeleccionado: "si" | "no" | "";
  onChange: (value: "si" | "no") => void;
};

function QuestionCard({ icono, pregunta, hint, valorSeleccionado, onChange }: Props) {
  const claseBoton = (opcion: "si" | "no") =>
    `boton-opcion${valorSeleccionado === opcion ? " boton-opcion--seleccionado" : ""}`;

  return (
    <div className="question-card">
      <div className="question-card__fila">
        <span className="question-card__icono-wrap" aria-hidden="true">
          <span className="question-card__icono">{icono}</span>
        </span>
        <p className="question-card__pregunta">{pregunta}</p>
        <div className="question-card__opciones">
          <button type="button" className={claseBoton("si")} onClick={() => onChange("si")}>
            Si
          </button>
          <button type="button" className={claseBoton("no")} onClick={() => onChange("no")}>
            No
          </button>
        </div>
      </div>
      {hint ? <p className="question-card__hint">{hint}</p> : null}
    </div>
  );
}

export default QuestionCard;
