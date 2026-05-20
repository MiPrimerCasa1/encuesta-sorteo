import { useEffect, useState } from "react";
import moto110 from "../assets/moto110.png";
import motoElectrica from "../assets/motoelectrica.png";
import terreno from "../assets/terreno10x30.png";

const SLIDES_TODOS = [
  { img: moto110,       label: "Premio Extra",     title: "Moto 110cc" },
  { img: motoElectrica, label: "Premio Extra",     title: "Moto Eléctrica" },
  { img: terreno,       label: "Premio Principal", title: "Gran Premio · Terreno 10x30" },
];

const SLIDES_MOTOS = [
  { img: moto110,       label: "Premio Extra", title: "Moto 110cc" },
  { img: motoElectrica, label: "Premio Extra", title: "Moto Eléctrica" },
];

const SLIDE_DURATION = 2500;

function PrizeCarousel({ soloMotos = false }: { soloMotos?: boolean }) {
  const slides = soloMotos ? SLIDES_MOTOS : SLIDES_TODOS;
  const [index, setIndex] = useState(0);
  const [prevIndex, setPrevIndex] = useState<number | null>(null);

  useEffect(() => {
    setIndex(0);
    setPrevIndex(null);
  }, [soloMotos]);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => {
        setPrevIndex(i);
        return (i + 1) % slides.length;
      });
    }, SLIDE_DURATION);
    return () => clearInterval(id);
  }, [slides.length]);

  return (
    <div className="pc-wrap" aria-label="Premios del sorteo">
      {slides.map((slide, i) => {
        const state = i === index ? "active" : i === prevIndex ? "exit" : "";
        return (
          <div key={i} className={`pc-slide ${state}`} aria-hidden={i !== index}>
            <img src={slide.img} alt={slide.title} className="pc-img" />
            <p className="pc-label">{slide.label}</p>
            <h3 className="pc-title">{slide.title}</h3>
          </div>
        );
      })}

      <div className="pc-dots" aria-hidden="true">
        {slides.map((_, i) => (
          <span key={i} className={`pc-dot${i === index ? " active" : ""}`} />
        ))}
      </div>
    </div>
  );
}

export default PrizeCarousel;
