/** Premios entregados por año; `fotosUrl` apunta al álbum o publicación con fotos de ganadores. */
export type SorteoHistorialItem = {
  año: number;
  detalle: string;
  fotosUrl: string;
};

export const SORTEOS_HISTORIAL: SorteoHistorialItem[] = [
  {
    año: 2024,
    detalle: "Premios: dos terrenos y un automóvil 0 km.",
    fotosUrl: "https://www.instagram.com/miprimercasaok/",
  },
  {
    año: 2025,
    detalle:
      "Premios: un terreno; tres motos 110 cc; televisores y heladeras.",
    fotosUrl: "https://www.instagram.com/miprimercasaok/",
  },
  {
    año: 2026,
    detalle:
      "Premios: dos motos 110 cc; aires acondicionados; televisores y motos eléctricas.",
    fotosUrl: "https://www.instagram.com/miprimercasaok/",
  },
];
