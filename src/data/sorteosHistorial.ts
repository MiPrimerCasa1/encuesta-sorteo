// Carga automática: cualquier ganador-YYYY.jpg en src/assets/ es detectado por Vite.
// Si el archivo no existe, devuelve '' sin romper la app.
const _ganadoresGlob = import.meta.glob<{ default: string }>(
  "../assets/ganador-*.{jpg,jpeg,svg}",
  { eager: true }
);

function fotoGanador(año: number): string {
  return (
    _ganadoresGlob[`../assets/ganador-${año}.svg`]?.default ??
    _ganadoresGlob[`../assets/ganador-${año}.jpg`]?.default ??
    _ganadoresGlob[`../assets/ganador-${año}.jpeg`]?.default ??
    ""
  );
}

export type SorteoHistorialItem = {
  año: number;
  detalle: string;
  fotoGanador: string;
};

export const SORTEOS_HISTORIAL: SorteoHistorialItem[] = [
  {
    año: 2024,
    detalle:
      "Premios: dos terrenos y un automóvil 0 km y 5 millones de pesos en efectivo.",
    fotoGanador: fotoGanador(2024),
  },
  {
    año: 2025,
    detalle:
      "Premios: un terreno; tres motos 110 cc; televisores y heladeras.",
    fotoGanador: fotoGanador(2025),
  },
  {
    año: 2026,
    detalle:
      "Premios: dos motos 110 cc; aires acondicionados; televisores y motos eléctricas.",
    fotoGanador: fotoGanador(2026),
  },
];
