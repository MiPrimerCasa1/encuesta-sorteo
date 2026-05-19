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
    fotoGanador: "/ganador-2024.jpg",
  },
  {
    año: 2025,
    detalle:
      "Premios: un terreno; tres motos 110 cc; televisores y heladeras.",
    fotoGanador: "/ganador-2025.jpg",
  },
  {
    año: 2026,
    detalle:
      "Premios: dos motos 110 cc; aires acondicionados; televisores y motos eléctricas.",
    fotoGanador: "/ganador-2026.jpg",
  },
];
