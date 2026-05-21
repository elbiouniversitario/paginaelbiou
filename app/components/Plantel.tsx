"use client";

import { useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import type { Jugador, Posicion } from "@/lib/types";
import { mockJugadores } from "@/lib/mock-data";

const posiciones: { label: string; value: Posicion | "Todos" }[] = [
  { label: "Todos",           value: "Todos" },
  { label: "Arqueros",        value: "Arquero" },
  { label: "Defensores",      value: "Defensor" },
  { label: "Mediocampistas",  value: "Mediocampista" },
  { label: "Delanteros",      value: "Delantero" },
];

const posicionColor: Record<Posicion, string> = {
  Arquero:        "#F5C200",
  Defensor:       "#1D4ED8",
  Mediocampista:  "#16A34A",
  Delantero:      "#DC2626",
};

function avatarUrl(nombre: string, apellido: string) {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(nombre[0] + apellido[0])}&background=EEF3FB&color=1A2F5E&size=128&bold=true`;
}

function JugadorCard({ jugador, index }: { jugador: Jugador; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.45, delay: (index % 6) * 0.06 }}
      className="bg-white border border-[#D8E1EF] hover:border-[#1A2F5E]/30 hover:shadow-md transition-all duration-200 group"
    >
      {/* Avatar */}
      <div className="relative h-32 bg-[#EEF3FB] flex items-center justify-center overflow-hidden">
        <span className="absolute top-2 right-3 font-display font-black text-3xl text-[#1A2F5E]/10 leading-none select-none">
          {jugador.numero}
        </span>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={jugador.foto_url || avatarUrl(jugador.nombre, jugador.apellido)}
          alt={`${jugador.nombre} ${jugador.apellido}`}
          className="w-16 h-16 rounded-full border-2 border-white shadow-sm object-cover"
        />
      </div>

      {/* Info */}
      <div className="p-4">
        <div
          className="inline-block font-display font-bold text-[9px] uppercase tracking-widest px-2 py-0.5 mb-2 border-l-2"
          style={{ color: posicionColor[jugador.posicion], borderColor: posicionColor[jugador.posicion], backgroundColor: `${posicionColor[jugador.posicion]}12` }}
        >
          {jugador.posicion}
        </div>
        <p className="font-display font-black text-sm uppercase text-[#1A2F5E] leading-tight">{jugador.nombre}</p>
        <p className="font-display font-black text-sm uppercase text-[#111827] leading-tight">{jugador.apellido}</p>
        <div className="flex justify-between mt-2 pt-2 border-t border-[#D8E1EF]">
          <span className="font-display text-[10px] font-semibold uppercase tracking-wide text-[#6B7A99]">#{jugador.numero}</span>
          <span className="font-display text-[10px] font-semibold uppercase tracking-wide text-[#6B7A99]">{jugador.edad} años</span>
        </div>
      </div>
    </motion.div>
  );
}

export default function Plantel() {
  const [filtro, setFiltro] = useState<Posicion | "Todos">("Todos");
  const titleRef = useRef<HTMLDivElement>(null);
  const titleInView = useInView(titleRef, { once: true });
  const filtered = filtro === "Todos" ? mockJugadores : mockJugadores.filter(j => j.posicion === filtro);

  return (
    <section id="plantel" className="py-20 lg:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        {/* Header */}
        <div ref={titleRef} className="mb-10">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={titleInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5 }} className="section-tag mb-3">
            Temporada 2025
          </motion.div>
          <motion.h2 initial={{ opacity: 0, y: 20 }} animate={titleInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6, delay: 0.1 }} className="font-display font-black uppercase text-[clamp(2.5rem,7vw,5.5rem)] leading-none text-[#1A2F5E]">
            Nuestro Plantel
          </motion.h2>
          <div className="w-16 h-1 bg-[#F5C200] mt-4" />
        </div>

        {/* Filter */}
        <div className="flex flex-wrap gap-2 mb-8">
          {posiciones.map(({ label, value }) => (
            <button
              key={value}
              onClick={() => setFiltro(value)}
              className={`font-display font-bold text-xs uppercase tracking-wider px-4 py-2 border transition-all duration-150 ${
                filtro === value
                  ? "bg-[#1A2F5E] border-[#1A2F5E] text-white"
                  : "border-[#D8E1EF] text-[#6B7A99] hover:border-[#1A2F5E] hover:text-[#1A2F5E]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
          {filtered.map((j, i) => <JugadorCard key={j.id} jugador={j} index={i} />)}
        </div>
        <p className="mt-5 font-display font-semibold text-xs uppercase tracking-widest text-[#6B7A99]">
          {filtered.length} jugador{filtered.length !== 1 ? "es" : ""}
        </p>
      </div>
    </section>
  );
}
