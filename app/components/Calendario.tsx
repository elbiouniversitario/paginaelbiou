"use client";

import { useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { MapPin, Clock, Shield } from "lucide-react";
import type { Partido } from "@/lib/types";
import { mockPartidos } from "@/lib/mock-data";

type Tab = "proximos" | "resultados";

function formatFecha(fechaStr: string) {
  const fecha = new Date(fechaStr + "T00:00:00");
  return fecha.toLocaleDateString("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

function ProximoCard({ partido, index }: { partido: Partido; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-30px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -30 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.08, ease: "easeOut" }}
      className="group bg-[#0C1729] border border-[#1A2A4A] hover:border-[#FACC15]/30 p-5 lg:p-6 transition-all duration-300 flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-8"
    >
      {/* Date block */}
      <div className="flex-shrink-0 text-center bg-[#172B5C] px-5 py-3 min-w-[90px]">
        <div className="font-display font-black text-3xl text-[#FACC15] leading-none">
          {new Date(partido.fecha + "T00:00:00").getDate()}
        </div>
        <div className="font-display font-semibold text-xs uppercase tracking-widest text-[#7B8FAD] mt-0.5">
          {new Date(partido.fecha + "T00:00:00").toLocaleDateString("es-AR", { month: "short" })}
        </div>
      </div>

      {/* Match info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-2">
          <span className="font-display font-bold text-[10px] uppercase tracking-widest text-[#FACC15] bg-[#FACC15]/10 px-2 py-0.5">
            {partido.competencia}
          </span>
          <span className="font-display font-semibold text-[10px] uppercase tracking-widest text-[#7B8FAD]">
            {partido.es_local ? "Local" : "Visitante"}
          </span>
        </div>

        {/* Teams */}
        <div className="flex items-center gap-3 mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#FACC15] flex items-center justify-center font-display font-black text-[#070D1A] text-xs flex-shrink-0">
              EU
            </div>
            <span className="font-display font-black text-base uppercase text-[#F0F4FF]">
              Elbio Universitario
            </span>
          </div>
          <span className="font-display font-black text-sm text-[#FACC15]">VS</span>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#1A2A4A] flex items-center justify-center flex-shrink-0">
              <Shield size={14} className="text-[#7B8FAD]" />
            </div>
            <span className="font-display font-black text-base uppercase text-[#F0F4FF] truncate">
              {partido.rival}
            </span>
          </div>
        </div>

        {/* Meta */}
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-1.5 text-[#7B8FAD]">
            <Clock size={12} />
            <span className="font-body text-xs">{partido.hora} hs</span>
          </div>
          <div className="flex items-center gap-1.5 text-[#7B8FAD]">
            <MapPin size={12} />
            <span className="font-body text-xs">{partido.sede}</span>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="flex-shrink-0">
        <button className="font-display font-black text-xs uppercase tracking-widest border border-[#FACC15]/30 hover:border-[#FACC15] hover:bg-[#FACC15] hover:text-[#070D1A] text-[#FACC15] px-4 py-2.5 transition-all duration-200 w-full lg:w-auto">
          Entradas
        </button>
      </div>
    </motion.div>
  );
}

function ResultadoCard({ partido, index }: { partido: Partido; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-30px" });

  const ganamos =
    partido.es_local
      ? (partido.resultado_local ?? 0) > (partido.resultado_visitante ?? 0)
      : (partido.resultado_visitante ?? 0) > (partido.resultado_local ?? 0);

  const empate = partido.resultado_local === partido.resultado_visitante;

  const resultado = empate ? "Empate" : ganamos ? "Victoria" : "Derrota";
  const resultadoColor = empate
    ? "#FACC15"
    : ganamos
    ? "#22C55E"
    : "#EF4444";

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -30 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.08, ease: "easeOut" }}
      className="bg-[#0C1729] border border-[#1A2A4A] p-5 lg:p-6 flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-8"
    >
      {/* Date */}
      <div className="flex-shrink-0 text-center bg-[#172B5C] px-5 py-3 min-w-[90px]">
        <div className="font-display font-black text-3xl text-[#F0F4FF] leading-none opacity-60">
          {new Date(partido.fecha + "T00:00:00").getDate()}
        </div>
        <div className="font-display font-semibold text-xs uppercase tracking-widest text-[#7B8FAD] mt-0.5">
          {new Date(partido.fecha + "T00:00:00").toLocaleDateString("es-AR", { month: "short" })}
        </div>
      </div>

      {/* Teams + score */}
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-3">
          <span className="font-display font-bold text-[10px] uppercase tracking-widest text-[#7B8FAD]">
            {partido.competencia}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-display font-black text-base uppercase text-[#F0F4FF] flex-1 truncate">
            {partido.es_local ? "Elbio Universitario" : partido.rival}
          </span>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="font-display font-black text-2xl text-[#F0F4FF]">
              {partido.es_local ? partido.resultado_local : partido.resultado_visitante}
            </span>
            <span className="font-display text-[#7B8FAD]">-</span>
            <span className="font-display font-black text-2xl text-[#F0F4FF]">
              {partido.es_local ? partido.resultado_visitante : partido.resultado_local}
            </span>
          </div>
          <span className="font-display font-black text-base uppercase text-[#F0F4FF] flex-1 truncate text-right">
            {partido.es_local ? partido.rival : "Elbio Universitario"}
          </span>
        </div>
      </div>

      {/* Result badge */}
      <div
        className="flex-shrink-0 font-display font-black text-xs uppercase tracking-widest px-3 py-1.5 text-center"
        style={{
          backgroundColor: `${resultadoColor}15`,
          color: resultadoColor,
          borderLeft: `2px solid ${resultadoColor}`,
        }}
      >
        {resultado}
      </div>
    </motion.div>
  );
}

export default function Calendario() {
  const [tab, setTab] = useState<Tab>("proximos");
  const titleRef = useRef<HTMLDivElement>(null);
  const titleInView = useInView(titleRef, { once: true });

  const proximos = mockPartidos.filter((p) => p.estado === "programado");
  const resultados = mockPartidos.filter((p) => p.estado === "finalizado");

  return (
    <section id="calendario" className="relative py-24 lg:py-32 bg-[#070D1A] overflow-hidden">
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none select-none z-0 overflow-hidden w-full text-center"
        aria-hidden
      >
        <span className="font-display font-black uppercase text-[clamp(4rem,13vw,12rem)] text-[#0C1729] leading-none whitespace-nowrap">
          FIXTURE
        </span>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 lg:px-8">
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
            Calendario
          </motion.h2>
          <motion.div
            initial={{ scaleX: 0, originX: "left" }}
            animate={titleInView ? { scaleX: 1 } : {}}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="w-32 h-1.5 bg-[#FACC15] mt-6"
          />
        </div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={titleInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex gap-1 mb-8 border-b border-[#1A2A4A]"
        >
          {(["proximos", "resultados"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`font-display font-black text-sm uppercase tracking-widest px-6 py-3 transition-all duration-200 border-b-2 -mb-px ${
                tab === t
                  ? "border-[#FACC15] text-[#FACC15]"
                  : "border-transparent text-[#7B8FAD] hover:text-[#F0F4FF]"
              }`}
            >
              {t === "proximos" ? "Próximos partidos" : "Resultados"}
            </button>
          ))}
        </motion.div>

        {/* Cards */}
        <div className="flex flex-col gap-3">
          {tab === "proximos"
            ? proximos.map((p, i) => <ProximoCard key={p.id} partido={p} index={i} />)
            : resultados.map((p, i) => <ResultadoCard key={p.id} partido={p} index={i} />)}
        </div>
      </div>
    </section>
  );
}
