"use client";

import { useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { MapPin, Clock, Shield } from "lucide-react";
import type { Partido } from "@/lib/types";
import { mockPartidos } from "@/lib/mock-data";

type Tab = "proximos" | "resultados";

function ProximoCard({ partido, index }: { partido: Partido; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-20px" });
  const fecha = new Date(partido.fecha + "T00:00:00");

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 16 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.45, delay: index * 0.07 }}
      className="bg-white border border-[#D8E1EF] hover:border-[#1A2F5E]/30 hover:shadow-sm transition-all duration-200 flex flex-col lg:flex-row lg:items-center gap-4 p-5"
    >
      {/* Date */}
      <div className="flex-shrink-0 bg-[#1A2F5E] text-white text-center px-5 py-3 min-w-[80px]">
        <div className="font-display font-black text-2xl leading-none">{fecha.getDate()}</div>
        <div className="font-display font-semibold text-xs uppercase tracking-wider mt-0.5 opacity-70">
          {fecha.toLocaleDateString("es-AR", { month: "short" })}
        </div>
      </div>

      {/* Match */}
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-2">
          <span className="font-display font-bold text-[10px] uppercase tracking-widest bg-[#EEF3FB] text-[#1A2F5E] px-2 py-0.5">
            {partido.competencia}
          </span>
          <span className="font-display font-semibold text-[10px] uppercase tracking-widest text-[#6B7A99]">
            {partido.es_local ? "Local" : "Visitante"}
          </span>
        </div>
        <div className="flex items-center gap-3 mb-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-[#F5C200] flex items-center justify-center font-display font-black text-[#1A2F5E] text-[10px]">EU</div>
            <span className="font-display font-black text-sm uppercase text-[#1A2F5E]">Elbio Universitario</span>
          </div>
          <span className="font-display font-bold text-xs text-[#6B7A99]">vs</span>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-[#EEF3FB] border border-[#D8E1EF] flex items-center justify-center">
              <Shield size={12} className="text-[#6B7A99]" />
            </div>
            <span className="font-display font-black text-sm uppercase text-[#111827]">{partido.rival}</span>
          </div>
        </div>
        <div className="flex gap-4 text-[#6B7A99]">
          <span className="flex items-center gap-1 font-body text-xs"><Clock size={11} />{partido.hora} hs</span>
          <span className="flex items-center gap-1 font-body text-xs"><MapPin size={11} />{partido.sede}</span>
        </div>
      </div>

      <button className="flex-shrink-0 font-display font-black text-xs uppercase tracking-widest border border-[#1A2F5E] text-[#1A2F5E] hover:bg-[#1A2F5E] hover:text-white px-4 py-2.5 transition-colors duration-200">
        Entradas
      </button>
    </motion.div>
  );
}

function ResultadoCard({ partido, index }: { partido: Partido; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-20px" });
  const fecha = new Date(partido.fecha + "T00:00:00");
  const golesEU = partido.es_local ? partido.resultado_local ?? 0 : partido.resultado_visitante ?? 0;
  const golesRival = partido.es_local ? partido.resultado_visitante ?? 0 : partido.resultado_local ?? 0;
  const resultado = golesEU === golesRival ? "Empate" : golesEU > golesRival ? "Victoria" : "Derrota";
  const color = resultado === "Victoria" ? "#16A34A" : resultado === "Empate" ? "#D97706" : "#DC2626";

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 16 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.45, delay: index * 0.07 }}
      className="bg-white border border-[#D8E1EF] p-5 flex flex-col lg:flex-row lg:items-center gap-4"
    >
      <div className="flex-shrink-0 bg-[#F7F9FC] text-center px-5 py-3 min-w-[80px] border border-[#D8E1EF]">
        <div className="font-display font-black text-2xl leading-none text-[#6B7A99]">{fecha.getDate()}</div>
        <div className="font-display font-semibold text-xs uppercase tracking-wider mt-0.5 text-[#6B7A99]/60">
          {fecha.toLocaleDateString("es-AR", { month: "short" })}
        </div>
      </div>
      <div className="flex-1">
        <div className="font-display font-semibold text-[10px] uppercase tracking-widest text-[#6B7A99] mb-2">{partido.competencia}</div>
        <div className="flex items-center gap-3">
          <span className="font-display font-black text-sm uppercase text-[#1A2F5E] flex-1 truncate">
            {partido.es_local ? "Elbio Universitario" : partido.rival}
          </span>
          <div className="flex items-center gap-2 flex-shrink-0 bg-[#1A2F5E] px-4 py-1.5">
            <span className="font-display font-black text-lg text-white">{golesEU}</span>
            <span className="font-display text-white/40 text-sm">-</span>
            <span className="font-display font-black text-lg text-white">{golesRival}</span>
          </div>
          <span className="font-display font-black text-sm uppercase text-[#111827] flex-1 truncate text-right">
            {partido.es_local ? partido.rival : "Elbio Universitario"}
          </span>
        </div>
      </div>
      <div
        className="flex-shrink-0 font-display font-black text-xs uppercase tracking-widest px-3 py-1.5 border-l-2"
        style={{ color, borderColor: color, backgroundColor: `${color}12` }}
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
  const proximos = mockPartidos.filter(p => p.estado === "programado");
  const resultados = mockPartidos.filter(p => p.estado === "finalizado");

  return (
    <section id="calendario" className="py-20 lg:py-28 bg-[#F7F9FC]">
      <div className="max-w-4xl mx-auto px-4 lg:px-8">
        <div ref={titleRef} className="mb-10">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={titleInView ? { opacity: 1, y: 0 } : {}} className="section-tag mb-3">
            Temporada 2025
          </motion.div>
          <motion.h2 initial={{ opacity: 0, y: 20 }} animate={titleInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6, delay: 0.1 }} className="font-display font-black uppercase text-[clamp(2.5rem,7vw,5.5rem)] leading-none text-[#1A2F5E]">
            Calendario
          </motion.h2>
          <div className="w-16 h-1 bg-[#F5C200] mt-4" />
        </div>

        {/* Tabs */}
        <div className="flex gap-0 mb-6 border-b border-[#D8E1EF]">
          {(["proximos", "resultados"] as Tab[]).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`font-display font-black text-sm uppercase tracking-wider px-6 py-3 border-b-2 -mb-px transition-all duration-200 ${
                tab === t ? "border-[#F5C200] text-[#1A2F5E]" : "border-transparent text-[#6B7A99] hover:text-[#1A2F5E]"
              }`}
            >
              {t === "proximos" ? "Próximos partidos" : "Resultados"}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-3">
          {tab === "proximos"
            ? proximos.map((p, i) => <ProximoCard key={p.id} partido={p} index={i} />)
            : resultados.map((p, i) => <ResultadoCard key={p.id} partido={p} index={i} />)}
        </div>
      </div>
    </section>
  );
}
