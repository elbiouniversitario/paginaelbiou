"use client";

import { useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import type { Jugador, Posicion } from "@/lib/types";
import { mockJugadores } from "@/lib/mock-data";

const posiciones: { label: string; value: Posicion | "Todos" }[] = [
  { label: "Todos", value: "Todos" },
  { label: "Arqueros", value: "Arquero" },
  { label: "Defensores", value: "Defensor" },
  { label: "Mediocampistas", value: "Mediocampista" },
  { label: "Delanteros", value: "Delantero" },
];

const posicionColor: Record<Posicion, string> = {
  Arquero: "#FACC15",
  Defensor: "#3B82F6",
  Mediocampista: "#22C55E",
  Delantero: "#EF4444",
};

function avatarUrl(nombre: string, apellido: string) {
  const initials = `${nombre[0]}${apellido[0]}`;
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=172B5C&color=FACC15&size=128&bold=true&font-size=0.4`;
}

function JugadorCard({ jugador, index }: { jugador: Jugador; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: (index % 6) * 0.07, ease: "easeOut" }}
      className="group relative bg-[#0C1729] border border-[#1A2A4A] hover:border-[#FACC15]/40 transition-all duration-300 overflow-hidden"
    >
      {/* Number badge */}
      <div className="absolute top-3 right-3 z-10">
        <span className="font-display font-black text-3xl text-[#FACC15]/20 leading-none">
          {jugador.numero}
        </span>
      </div>

      {/* Avatar */}
      <div className="relative h-36 bg-gradient-to-br from-[#172B5C] to-[#070D1A] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 grid-pattern opacity-50" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={jugador.foto_url || avatarUrl(jugador.nombre, jugador.apellido)}
          alt={`${jugador.nombre} ${jugador.apellido}`}
          className="relative z-10 w-20 h-20 rounded-full ring-2 ring-[#FACC15]/30 group-hover:ring-[#FACC15] transition-all duration-300 object-cover"
        />
      </div>

      {/* Info */}
      <div className="p-4">
        <div
          className="inline-block font-display font-bold text-[10px] uppercase tracking-widest px-2 py-0.5 mb-2"
          style={{
            backgroundColor: `${posicionColor[jugador.posicion]}15`,
            color: posicionColor[jugador.posicion],
            borderLeft: `2px solid ${posicionColor[jugador.posicion]}`,
          }}
        >
          {jugador.posicion}
        </div>
        <h3 className="font-display font-black text-lg uppercase leading-tight text-[#F0F4FF]">
          {jugador.nombre}
        </h3>
        <h3 className="font-display font-black text-lg uppercase leading-tight text-[#FACC15]">
          {jugador.apellido}
        </h3>
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#1A2A4A]">
          <span className="font-display font-semibold text-xs uppercase tracking-widest text-[#7B8FAD]">
            #{jugador.numero}
          </span>
          <span className="font-display font-semibold text-xs uppercase tracking-widest text-[#7B8FAD]">
            {jugador.edad} años
          </span>
        </div>
      </div>
    </motion.div>
  );
}

export default function Plantel() {
  const [filtro, setFiltro] = useState<Posicion | "Todos">("Todos");
  const titleRef = useRef<HTMLDivElement>(null);
  const titleInView = useInView(titleRef, { once: true });

  const jugadoresFiltrados =
    filtro === "Todos"
      ? mockJugadores
      : mockJugadores.filter((j) => j.posicion === filtro);

  return (
    <section id="plantel" className="relative py-24 lg:py-32 bg-[#0C1729] overflow-hidden">
      {/* Decorative background */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none select-none z-0 overflow-hidden w-full text-center"
        aria-hidden
      >
        <span className="font-display font-black uppercase text-[clamp(5rem,16vw,14rem)] text-[#070D1A] leading-none whitespace-nowrap">
          PLANTEL
        </span>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div ref={titleRef} className="mb-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={titleInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="flex items-center gap-3 mb-4"
          >
            <div className="h-px w-10 bg-[#FACC15]" />
            <span className="font-display font-semibold text-xs uppercase tracking-[0.3em] text-[#FACC15]">
              Temporada 2025
            </span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={titleInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
            className="font-display font-black uppercase leading-none text-[clamp(3rem,8vw,7rem)] text-[#F0F4FF]"
          >
            Nuestro{" "}
            <span className="text-stroke-yellow">Plantel</span>
          </motion.h2>
          <motion.div
            initial={{ scaleX: 0, originX: "left" }}
            animate={titleInView ? { scaleX: 1 } : {}}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="w-32 h-1.5 bg-[#FACC15] mt-6"
          />
        </div>

        {/* Position filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={titleInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-wrap gap-2 mb-10"
        >
          {posiciones.map(({ label, value }) => (
            <button
              key={value}
              onClick={() => setFiltro(value)}
              className={`font-display font-bold text-xs uppercase tracking-widest px-4 py-2 transition-all duration-200 ${
                filtro === value
                  ? "bg-[#FACC15] text-[#070D1A]"
                  : "border border-[#1A2A4A] text-[#7B8FAD] hover:border-[#FACC15]/40 hover:text-[#F0F4FF]"
              }`}
            >
              {label}
            </button>
          ))}
        </motion.div>

        {/* Player grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
          {jugadoresFiltrados.map((j, i) => (
            <JugadorCard key={j.id} jugador={j} index={i} />
          ))}
        </div>

        <p className="mt-6 text-center font-display font-semibold text-xs uppercase tracking-widest text-[#7B8FAD]">
          {jugadoresFiltrados.length} jugador{jugadoresFiltrados.length !== 1 ? "es" : ""}
        </p>
      </div>
    </section>
  );
}
