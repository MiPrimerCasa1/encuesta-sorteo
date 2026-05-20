import { useEffect } from "react";

type Props = {
  onClose: () => void;
};

function BasesModal({ onClose }: Props) {
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  return (
    <div className="bases-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="bases-titulo">
      <div className="bases-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="bases-sheet__header">
          <h2 id="bases-titulo" className="bases-sheet__titulo">Bases y Condiciones</h2>
          <button type="button" className="bases-sheet__cerrar" onClick={onClose} aria-label="Cerrar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="20" height="20">
              <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="bases-sheet__body">
          <p className="bases-sheet__empresa">MI PRIMER CASA S.A. — Sorteo 2026</p>

          <div className="bases-sheet__seccion">
            <h3 className="bases-sheet__subtitulo">1. Organización</h3>
            <p>El sorteo es organizado por <strong>MI PRIMER CASA S.A.</strong>, empresa dedicada a la venta de terrenos y propiedades.</p>
          </div>

          <div className="bases-sheet__seccion">
            <h3 className="bases-sheet__subtitulo">2. Participación gratuita</h3>
            <p>La participación es completamente <strong>gratuita</strong>. Solo debés completar la encuesta con tu número de celular. No es obligatorio realizar ninguna compra para participar ni para ganar los premios extra.</p>
          </div>

          <div className="bases-sheet__seccion">
            <h3 className="bases-sheet__subtitulo">3. Premios</h3>
            <ul className="bases-sheet__lista">
              <li><strong>Premio Principal:</strong> Un terreno 10×30 m sobre avenida. Para recibir este premio, el ganador deberá abonar la suscripción del plan de financiamiento vigente.</li>
              <li><strong>Premio Extra:</strong> 1 (una) moto 110 cc y 2 (dos) motos eléctricas. Se entregan sin cargo adicional.</li>
            </ul>
          </div>

          <div className="bases-sheet__seccion">
            <h3 className="bases-sheet__subtitulo">4. Fecha y lugar del sorteo</h3>
            <p>El sorteo se realizará el <strong>23 de diciembre de 2026 a las 18:00 horas</strong>, de manera presencial, ante <strong>escribano público</strong> que certificará el acto.</p>
          </div>

          <div className="bases-sheet__seccion">
            <h3 className="bases-sheet__subtitulo">5. Mecánica</h3>
            <p>Participan todas las personas que hayan completado la encuesta con un número de celular válido. El ganador será seleccionado al azar entre todos los participantes registrados.</p>
          </div>

          <div className="bases-sheet__seccion">
            <h3 className="bases-sheet__subtitulo">6. Descuento exclusivo</h3>
            <p>Los participantes acceden a un descuento de <strong>hasta el 40%</strong> en productos seleccionados de MI PRIMER CASA S.A., sin obligación de compra.</p>
          </div>

          <div className="bases-sheet__seccion">
            <h3 className="bases-sheet__subtitulo">7. Financiamiento</h3>
            <p>El valor de referencia de la cuota es de <strong>$55.000 mensuales (CUOTAS FIJAS)</strong>, que incluye pilares y alcantarilla. Los valores están sujetos a actualización sin previo aviso.</p>
          </div>

          <div className="bases-sheet__seccion">
            <h3 className="bases-sheet__subtitulo">8. Notificación al ganador</h3>
            <p>El ganador será contactado al número de celular registrado dentro de las <strong>48 horas</strong> posteriores al sorteo.</p>
          </div>

          <div className="bases-sheet__seccion">
            <h3 className="bases-sheet__subtitulo">9. Premio personal</h3>
            <p>El premio es personal e intransferible. No puede canjearse por dinero en efectivo ni por otro bien.</p>
          </div>

          <div className="bases-sheet__seccion">
            <h3 className="bases-sheet__subtitulo">10. Datos personales</h3>
            <p>Los datos recopilados se utilizarán exclusivamente para la gestión del sorteo y comunicaciones de MI PRIMER CASA S.A. No serán compartidos con terceros.</p>
          </div>

          <p className="bases-sheet__pie">La participación en el sorteo implica la aceptación de estas bases y condiciones.</p>
        </div>
      </div>
    </div>
  );
}

export default BasesModal;
