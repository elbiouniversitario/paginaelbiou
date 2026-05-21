"use client";

import { useEffect, useRef, useState } from "react";
import { motion, type Variants, type Transition } from "framer-motion";
import { ChevronDown, Trophy, Users, Calendar, Star } from "lucide-react";

const stats = [
  { icon: Trophy, value: "12", label: "Campeonatos" },
  { icon: Calendar, value: "1952", label: "Año de Fundación" },
  { icon: Users, value: "3.400+", label: "Socios Activos" },
  { icon: Star, value: "1ra", label: "División" },
];

const marqueeItems = [
  "ELBIO UNIVERSITARIO",
  "⚽",
  "PASIÓN Y GARRA",
  "⚽",
  "CAMPEONES",
  "⚽",
  "DESDE 1952",
  "⚽",
  "FÚTBOL DE VERDAD",
  "⚽",
];

const springTransition: Transition = {
  duration: 0.8,
  ease: "easeOut",
};

const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12, delayChildren: 0.2 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: springTransition,
  },
};

const slideIn: Variants = {
  hidden: { opacity: 0, x: -60 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.9, ease: "easeOut" },
  },
};

const scaleLineVariants: Variants = {
  hidden: { scaleX: 0 },
  visible: {
    scaleX: 1,
    transition: { duration: 0.7, delay: 0.6, ease: "easeOut" },
  },
};

export default function Hero() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <section
      id="inicio"
      className="relative min-h-screen flex flex-col overflow-hidden bg-[#070D1A]"
    >
      {/* Grid pattern background */}
      <div className="absolute inset-0 grid-pattern pointer-events-none" />

      {/* Diagonal blue gradient */}
      <div className="absolute top-0 right-0 w-[60vw] h-[70vh] bg-gradient-to-bl from-[#1D4ED8]/20 via-[#172B5C]/10 to-transparent pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[40vw] h-[40vh] bg-gradient-to-tr from-[#FACC15]/5 to-transparent pointer-events-none" />

      {/* Yellow accent bar — right edge */}
      <div
        className="absolute top-0 right-0 w-2 h-full bg-[#FACC15] opacity-80 pointer-events-none"
        style={{ clipPath: "polygon(0 5%, 100% 0, 100% 100%, 0 95%)" }}
      />

      {/* Main content */}
      <div className="relative z-10 flex-1 flex flex-col justify-center max-w-7xl mx-auto w-full px-6 lg:px-8 pt-24 pb-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={visible ? "visible" : "hidden"}
          className="flex flex-col"
        >
          {/* Eyebrow */}
          <motion.div
            variants={itemVariants}
            className="flex items-center gap-3 mb-6"
          >
            <div className="h-px w-12 bg-[#FACC15]" />
            <span className="font-display font-semibold text-xs uppercase tracking-[0.3em] text-[#FACC15]">
              Club Atlético · Est. 1952
            </span>
          </motion.div>

          {/* Giant title */}
          <div className="overflow-hidden">
            <motion.h1
              variants={slideIn}
              className="font-display font-black uppercase leading-[0.85] text-[clamp(5rem,15vw,14rem)] text-stroke-yellow"
            >
              Elbio
            </motion.h1>
          </div>
          <div className="overflow-hidden">
            <motion.h1
              variants={slideIn}
              className="font-display font-black uppercase leading-[0.85] text-[clamp(2.5rem,7.5vw,7rem)] text-[#F0F4FF]"
            >
              Universitario
            </motion.h1>
          </div>

          {/* Accent line */}
          <motion.div
            variants={scaleLineVariants}
            style={{ transformOrigin: "left" }}
            className="w-48 h-1.5 bg-[#FACC15] mt-6 mb-8"
          />

          {/* Subtitle */}
          <motion.p
            variants={itemVariants}
            className="font-body font-light text-base lg:text-lg text-[#7B8FAD] max-w-xl mb-10 leading-relaxed"
          >
            Más que un club. Una comunidad forjada en la cancha, en las aulas y
            en el corazón de cada socio. Viví el fútbol universitario.
          </motion.p>

          {/* CTAs */}
          <motion.div
            variants={itemVariants}
            className="flex flex-wrap items-center gap-4"
          >
            <a
              href="#historia"
              className="inline-flex items-center gap-2 bg-[#FACC15] hover:bg-[#FDE047] text-[#070D1A] font-display font-black text-sm uppercase tracking-widest px-8 py-4 transition-all duration-200 hover:scale-105 active:scale-95 yellow-glow"
            >
              Conocé el Club
            </a>
            <a
              href="#plantel"
              className="inline-flex items-center gap-2 border border-[#FACC15]/40 hover:border-[#FACC15] text-[#F0F4FF] hover:text-[#FACC15] font-display font-bold text-sm uppercase tracking-widest px-8 py-4 transition-all duration-200"
            >
              Ver Plantel
            </a>
          </motion.div>
        </motion.div>
      </div>

      {/* Stats bar */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 1.0, ease: "easeOut" }}
        className="relative z-10 border-t border-[#1A2A4A] bg-[#0C1729]/80 backdrop-blur-sm"
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-[#1A2A4A]">
            {stats.map(({ icon: Icon, value, label }) => (
              <div
                key={label}
                className="flex items-center gap-4 px-6 py-6 group hover:bg-[#FACC15]/5 transition-colors duration-300"
              >
                <Icon
                  size={20}
                  className="text-[#FACC15] flex-shrink-0 group-hover:scale-110 transition-transform"
                />
                <div>
                  <div className="font-display font-black text-2xl lg:text-3xl text-[#F0F4FF] leading-none">
                    {value}
                  </div>
                  <div className="font-display font-semibold text-xs uppercase tracking-widest text-[#7B8FAD] mt-0.5">
                    {label}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-32 left-6 lg:left-8 flex flex-col items-center gap-2 z-10"
      >
        <span className="font-display font-semibold text-[10px] uppercase tracking-[0.3em] text-[#7B8FAD] [writing-mode:vertical-rl]">
          Scroll
        </span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
        >
          <ChevronDown size={16} className="text-[#FACC15]" />
        </motion.div>
      </motion.div>

      {/* Marquee strip */}
      <div className="relative z-10 overflow-hidden bg-[#FACC15] py-3">
        <div className="flex whitespace-nowrap animate-marquee">
          {[...marqueeItems, ...marqueeItems].map((item, i) => (
            <span
              key={i}
              className="font-display font-black text-sm uppercase tracking-widest text-[#070D1A] mx-6"
            >
              {item}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
