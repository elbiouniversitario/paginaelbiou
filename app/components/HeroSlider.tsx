"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

type Slide = {
  id: number;
  tag: string;
  headline: [string, string];
  sub: string;
  from: string;
  via: string;
  accentColor: string;
  foto: string;
  visible: boolean;
};

const DEFAULT_SLIDES: Slide[] = [
  {
    id: 0,
    tag: "Estadio Municipal",
    headline: ["La Casa", "de la Pasión"],
    sub: "Más de 5.000 hinchas viven cada partido en casa",
    from: "#040D1C",
    via: "#091A30",
    accentColor: "#F5C200",
    foto: "",
    visible: true,
  },
  {
    id: 1,
    tag: "Complejo de Entrenamiento",
    headline: ["Donde se Forja", "el Campeón"],
    sub: "Instalaciones de primer nivel para nuestros jugadores",
    from: "#050F18",
    via: "#081C2A",
    accentColor: "#60A5FA",
    foto: "",
    visible: true,
  },
  {
    id: 2,
    tag: "Cantera Universitaria",
    headline: ["El Futuro", "Azul y Amarillo"],
    sub: "Formando los cracks de mañana desde 1952",
    from: "#08091A",
    via: "#0E1038",
    accentColor: "#F5C200",
    foto: "",
    visible: true,
  },
  {
    id: 3,
    tag: "Campo Auxiliar",
    headline: ["Setenta Años", "de Historia"],
    sub: "Un club universitario con raíces profundas en la comunidad",
    from: "#0A0E16",
    via: "#121E2E",
    accentColor: "#A78BFA",
    foto: "",
    visible: true,
  },
];

const slideVariants = {
  enter: (dir: number) => ({ x: `${dir * 5}%`, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: `${dir * -5}%`, opacity: 0 }),
};

export default function HeroSlider() {
  const [slides, setSlides] = useState<Slide[]>(DEFAULT_SLIDES);
  const [current, setCurrent] = useState(0);
  const [dir, setDir] = useState(1);

  useEffect(() => {
    fetch("/api/site-content")
      .then((r) => r.json())
      .then((rows: { clave: string; valor: string | null }[]) => {
        if (!rows?.length) return;
        const map: Record<string, string> = {};
        for (const row of rows) map[row.clave] = row.valor ?? "";
        setSlides((prev) =>
          prev.map((def, i) => ({
            ...def,
            tag:      map[`slide_${i + 1}_tag`]    || def.tag,
            headline: [
              map[`slide_${i + 1}_linea1`] || def.headline[0],
              map[`slide_${i + 1}_linea2`] || def.headline[1],
            ] as [string, string],
            sub:     map[`slide_${i + 1}_sub`]     || def.sub,
            foto:    map[`slide_${i + 1}_foto`]    || "",
            visible: map[`slide_${i + 1}_visible`] !== "false",
          }))
        );
      })
      .catch(() => {});
  }, []);

  const visibleSlides = slides.filter((s) => s.visible);
  const activeSlides  = visibleSlides.length > 0 ? visibleSlides : slides;

  const go = useCallback(
    (to: number) => {
      const target = (to + activeSlides.length) % activeSlides.length;
      setDir(to > current ? 1 : -1);
      setCurrent(target);
    },
    [current, activeSlides.length]
  );

  const next = useCallback(() => go(current + 1), [current, go]);
  const prev = useCallback(() => go(current - 1), [current, go]);

  useEffect(() => {
    const t = setInterval(next, 5500);
    return () => clearInterval(t);
  }, [next]);

  const s = activeSlides[current] ?? activeSlides[0];

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
          {/* Background photo (if set) */}
          {s.foto && (
            <img
              src={s.foto}
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
              style={{ opacity: 0.72 }}
            />
          )}

          {/* Bottom fade */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/5 to-transparent" />
        </motion.div>
      </AnimatePresence>

      {/* Yellow bottom strip */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#F5C200] z-30" />

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
        {activeSlides.map((_, i) => (
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
