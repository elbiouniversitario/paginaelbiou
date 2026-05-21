"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";

const slides = [
  {
    id: 0,
    tag: "Estadio Municipal",
    headline: ["La Casa", "de la Pasión"],
    sub: "Más de 5.000 hinchas viven cada partido en casa",
    from: "#040D1C",
    via: "#091A30",
    accentColor: "#F5C200",
  },
  {
    id: 1,
    tag: "Complejo de Entrenamiento",
    headline: ["Donde se Forja", "el Campeón"],
    sub: "Instalaciones de primer nivel para nuestros jugadores",
    from: "#050F18",
    via: "#081C2A",
    accentColor: "#60A5FA",
  },
  {
    id: 2,
    tag: "Cantera Universitaria",
    headline: ["El Futuro", "Azul y Amarillo"],
    sub: "Formando los cracks de mañana desde 1952",
    from: "#08091A",
    via: "#0E1038",
    accentColor: "#F5C200",
  },
  {
    id: 3,
    tag: "Campo Auxiliar",
    headline: ["Setenta Años", "de Historia"],
    sub: "Un club universitario con raíces profundas en la comunidad",
    from: "#0A0E16",
    via: "#121E2E",
    accentColor: "#A78BFA",
  },
];

const slideVariants = {
  enter: (dir: number) => ({ x: `${dir * 5}%`, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: `${dir * -5}%`, opacity: 0 }),
};

export default function HeroSlider() {
  const [current, setCurrent] = useState(0);
  const [dir, setDir] = useState(1);

  const go = useCallback(
    (to: number) => {
      const target = (to + slides.length) % slides.length;
      setDir(to > current ? 1 : -1);
      setCurrent(target);
    },
    [current]
  );

  const next = useCallback(() => go(current + 1), [current, go]);
  const prev = useCallback(() => go(current - 1), [current, go]);

  useEffect(() => {
    const t = setInterval(next, 5500);
    return () => clearInterval(t);
  }, [next]);

  const s = slides[current];

  return (
    <section
      id="inicio"
      className="relative w-full overflow-hidden"
      style={{ height: "88vh", minHeight: 520 }}
    >
      {/* ---- Background slide ---- */}
      <AnimatePresence mode="wait" custom={dir}>
        <motion.div
          key={current}
          custom={dir}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.65, ease: "easeInOut" }}
          className="absolute inset-0"
          style={{ background: `linear-gradient(135deg, ${s.from} 0%, ${s.via} 60%, ${s.from} 100%)` }}
        >
          {/* Grid texture */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)",
              backgroundSize: "50px 50px",
            }}
          />
          {/* Spotlight glow top-right */}
          <div
            className="absolute -top-24 right-0 w-[500px] h-[500px] rounded-full opacity-[0.07]"
            style={{ background: `radial-gradient(circle, ${s.accentColor} 0%, transparent 70%)` }}
          />
          {/* Bottom fade */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
          {/* Left fade to protect crest readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-transparent" />
        </motion.div>
      </AnimatePresence>

      {/* Yellow bottom strip */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#F5C200] z-30" />

      {/* ---- Club crest — left side ---- */}
      <div className="absolute left-6 sm:left-10 lg:left-16 top-1/2 -translate-y-1/2 z-20 flex flex-col items-center gap-3 select-none">
        <div className="relative flex items-center justify-center">
          {/* Glow behind crest */}
          <div
            className="absolute w-32 h-32 lg:w-48 lg:h-48 rounded-full opacity-20 blur-2xl"
            style={{ background: "#F5C200" }}
          />
          {/* Outer ring */}
          <div className="absolute w-24 h-24 sm:w-32 sm:h-32 lg:w-40 lg:h-40 rounded-full border border-white/10" />
          <div className="absolute w-20 h-20 sm:w-28 sm:h-28 lg:w-36 lg:h-36 rounded-full border border-white/10" />
          {/* Crest circle */}
          <div className="relative w-16 h-16 sm:w-24 sm:h-24 lg:w-32 lg:h-32 rounded-full bg-white/10 backdrop-blur-sm border border-white/25 flex items-center justify-center p-2 overflow-hidden">
            <Image
              src="/logo.ico"
              alt="Elbio Fernández Universitario"
              width={120}
              height={120}
              className="w-full h-full object-contain"
              unoptimized
            />
          </div>
        </div>
        <div className="text-center leading-tight">
          <span className="block font-display font-bold text-white/35 text-[8px] uppercase tracking-[0.25em]">Club Atlético</span>
          <span className="block font-display font-black text-white/50 text-[8px] uppercase tracking-[0.2em] mt-0.5">Est. 1952</span>
        </div>
      </div>

      {/* ---- Slide text — bottom right ---- */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`txt-${current}`}
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.45, delay: 0.18, ease: "easeOut" }}
          className="absolute right-6 sm:right-10 lg:right-16 bottom-16 lg:bottom-20 z-20 text-right max-w-[260px] sm:max-w-sm lg:max-w-md"
        >
          <span
            className="inline-block font-display font-bold text-[9px] uppercase tracking-[0.2em] mb-3 px-2.5 py-1 border"
            style={{ color: s.accentColor, borderColor: `${s.accentColor}35` }}
          >
            {s.tag}
          </span>
          <div
            className="font-display font-black text-white uppercase leading-[0.88] mb-3"
            style={{ fontSize: "clamp(1.75rem, 5.5vw, 4.25rem)" }}
          >
            {s.headline.map((line, i) => (
              <span key={i} className="block">
                {line}
              </span>
            ))}
          </div>
          <p className="font-body text-white/45 text-sm leading-relaxed">{s.sub}</p>
        </motion.div>
      </AnimatePresence>

      {/* Club name watermark — top */}
      <div className="absolute top-5 left-1/2 -translate-x-1/2 z-20 text-center hidden sm:block pointer-events-none">
        <span className="font-display font-black text-white/15 uppercase tracking-[0.15em]" style={{ fontSize: "clamp(0.65rem, 1.8vw, 1rem)" }}>
          Club Atlético Elbio Fernández Universitario
        </span>
      </div>

      {/* ---- Navigation arrows ---- */}
      <button
        onClick={prev}
        aria-label="Anterior"
        className="absolute left-4 top-1/2 -translate-y-1/2 z-30 w-9 h-9 bg-white/8 hover:bg-white/18 border border-white/15 hover:border-[#F5C200]/50 text-white/70 hover:text-white flex items-center justify-center transition-all duration-200 backdrop-blur-sm"
      >
        <ChevronLeft size={16} />
      </button>
      <button
        onClick={next}
        aria-label="Siguiente"
        className="absolute right-4 top-1/2 -translate-y-1/2 z-30 w-9 h-9 bg-white/8 hover:bg-white/18 border border-white/15 hover:border-[#F5C200]/50 text-white/70 hover:text-white flex items-center justify-center transition-all duration-200 backdrop-blur-sm"
      >
        <ChevronRight size={16} />
      </button>

      {/* ---- Slide indicators ---- */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-30 flex gap-2 items-center">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => go(i)}
            aria-label={`Slide ${i + 1}`}
            className="h-px transition-all duration-300"
            style={{
              width: i === current ? 28 : 12,
              background: i === current ? "#F5C200" : "rgba(255,255,255,0.25)",
            }}
          />
        ))}
      </div>
    </section>
  );
}
