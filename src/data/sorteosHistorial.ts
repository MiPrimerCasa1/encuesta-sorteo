import ganador2024 from "../assets/ganador-2024.jpg";
import ganador2025 from "../assets/ganador-2025.jpg";
import ganador2026 from "../assets/ganador-2026.jpg";

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
    fotoGanador: ganador2024,
  },
  {
    año: 2025,
    detalle:
      "Premios: un terreno; tres motos 110 cc; televisores y heladeras.",
    fotoGanador: ganador2025,
  },
  {
    año: 2026,
    detalle:
      "Premios: dos motos 110 cc; aires acondicionados; televisores y motos eléctricas.",
    fotoGanador: ganador2026,
  },
];
