"use client";

import { useState, useRef, useEffect } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { MapPin, Clock, Shield } from "lucide-react";
import type { Partido } from "@/lib/types";
import { mockPartidos } from "@/lib/mock-data";
import { supabase } from "@/lib/supabase";

type Tab = "proximos" | "resultados";
type Categoria = "Mayor" | "Reserva" | "Pre-Senior" | "Sub 20" | "Sub 18" | "Femenino";

const categorias: Categoria[] = ["Mayor", "Reserva", "Pre-Senior", "Sub 20", "Sub 18", "Femenino"];

function ProximoCard({ partido, index }: { partido: Partido; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-20px" });
  const fecha = new Date(partido.fecha + "T00:00:00");

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 14 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.4, delay: index * 0.07 }}
      className="bg-white border border-[#D8E1EF] hover:border-[#1A2F5E]/30 hover:shadow-sm transition-all duration-200 flex flex-col lg:flex-row lg:items-center gap-4 p-4 lg:p-5"
    >
      {/* Date block */}
      <div className="flex-shrink-0 bg-[#1A2F5E] text-white text-center px-4 py-2.5 min-w-[68px]">
        <div className="font-display font-black text-2xl leading-none">{fecha.getDate()}</div>
        <div className="font-display font-semibold text-xs uppercase tracking-wider mt-0.5 opacity-60">
          {fecha.toLocaleDateString("es-AR", { month: "short" })}
        </div>
      </div>

      {/* Match info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <span className="font-display font-bold text-xs uppercase tracking-widest bg-[#EEF3FB] text-[#1A2F5E] px-2 py-0.5">
            {partido.competencia}
          </span>
          <span className="font-display font-semibold text-xs uppercase tracking-widest text-[#6B7A99]">
            {partido.es_local ? "Local" : "Visitante"}
          </span>
        </div>
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-6 rounded-full bg-[#F5C200] flex items-center justify-center font-display font-black text-[#1A2F5E] text-[10px] flex-shrink-0">
              EU
            </div>
            <span className="font-display font-black text-sm uppercase text-[#1A2F5E] whitespace-nowrap">EFU</span>
          </div>
          <span className="font-display font-bold text-xs text-[#6B7A99]">vs</span>
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-6 rounded-full bg-[#EEF3FB] border border-[#D8E1EF] flex items-center justify-center flex-shrink-0">
              <Shield size={10} className="text-[#6B7A99]" />
            </div>
            <span className="font-display font-black text-sm uppercase text-[#111827] truncate max-w-[140px]">
              {partido.rival}
            </span>
          </div>
        </div>
        <div className="flex gap-3 text-[#6B7A99] flex-wrap">
          <span className="flex items-center gap-1 font-body text-xs">
            <Clock size={10} />{partido.hora} hs
          </span>
          <span className="flex items-center gap-1 font-body text-xs truncate max-w-[200px]">
            <MapPin size={10} />{partido.sede}
          </span>
        </div>
      </div>
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
      initial={{ opacity: 0, y: 14 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.4, delay: index * 0.07 }}
      className="bg-white border border-[#D8E1EF] p-4 lg:p-5 flex flex-col lg:flex-row lg:items-center gap-4"
    >
      <div className="flex-shrink-0 bg-[#F7F9FC] border border-[#D8E1EF] text-center px-4 py-2.5 min-w-[68px]">
        <div className="font-display font-black text-2xl leading-none text-[#6B7A99]">{fecha.getDate()}</div>
        <div className="font-display font-semibold text-xs uppercase tracking-wider mt-0.5 text-[#6B7A99]/50">
          {fecha.toLocaleDateString("es-AR", { month: "short" })}
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-display font-semibold text-xs uppercase tracking-widest text-[#6B7A99] mb-2">
          {partido.competencia}
        </div>
        <div className="flex items-center gap-2">
          <span className="font-display font-black text-sm uppercase text-[#1A2F5E] flex-1 truncate">
            {partido.es_local ? "EFU" : partido.rival}
          </span>
          <div className="flex items-center gap-1.5 flex-shrink-0 bg-[#1A2F5E] px-3 py-1">
            <span className="font-display font-black text-lg text-white">{golesEU}</span>
            <span className="font-display text-white/35 text-sm">-</span>
            <span className="font-display font-black text-lg text-white">{golesRival}</span>
          </div>
          <span className="font-display font-black text-sm uppercase text-[#111827] flex-1 truncate text-right">
            {partido.es_local ? partido.rival : "EFU"}
          </span>
        </div>
      </div>
      <div
        className="flex-shrink-0 font-display font-black text-[10px] uppercase tracking-widest px-3 py-1.5 border-l-2"
        style={{ color, borderColor: color, backgroundColor: `${color}12` }}
      >
        {resultado}
      </div>
    </motion.div>
  );
}

export default function Calendario() {
  const [tab,       setTab]       = useState<Tab>("proximos");
  const [categoria, setCategoria] = useState<Categoria>("Mayor");
  const [partidos,  setPartidos]  = useState<Partido[]>(mockPartidos);
  const titleRef                  = useRef<HTMLDivElement>(null);
  const titleInView               = useInView(titleRef, { once: true });

  useEffect(() => {
    if (!supabase) return;
    supabase.from("partidos").select("*").order("fecha", { ascending: true }).then(({ data }) => {
      if (data?.length) setPartidos(data as Partido[]);
    });
  }, []);

  const byCategoria = partidos.filter((p) => p.categoria === categoria);
  const proximos    = byCategoria.filter((p) => p.estado === "programado");
  const resultados  = byCategoria.filter((p) => p.estado === "finalizado").reverse();

  return (
    <section id="calendario" className="py-20 lg:py-28 bg-[#F7F9FC]">
      <div className="max-w-5xl mx-auto px-4 lg:px-8">
        {/* Header */}
        <div ref={titleRef} className="mb-8">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={titleInView ? { opacity: 1, y: 0 } : {}}
            className="section-tag mb-3"
          >
            Temporada 2026
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={titleInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-display font-black uppercase text-[clamp(2.5rem,7vw,5.5rem)] leading-none text-[#1A2F5E]"
          >
            Calendario
          </motion.h2>
          <div className="w-16 h-1 bg-[#F5C200] mt-4" />
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* ── Category sidebar ── */}
          <div className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-x-visible flex-shrink-0 lg:w-40 pb-1 lg:pb-0">
            {categorias.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoria(cat)}
                className={`flex-shrink-0 lg:w-full text-left font-display font-bold text-xs uppercase tracking-wider px-4 py-2.5 transition-all duration-150 whitespace-nowrap border-b-2 lg:border-b-0 lg:border-l-2 ${
                  categoria === cat
                    ? "border-[#F5C200] text-[#1A2F5E] bg-white"
                    : "border-transparent text-[#6B7A99] hover:text-[#1A2F5E] hover:bg-white/60"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* ── Content area ── */}
          <div className="flex-1 min-w-0">
            {/* Próximos / Resultados tabs */}
            <div className="flex gap-0 mb-5 border-b border-[#D8E1EF]">
              {(["proximos", "resultados"] as Tab[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`font-display font-black text-xs uppercase tracking-wider px-5 py-2.5 border-b-2 -mb-px transition-all duration-200 ${
                    tab === t
                      ? "border-[#F5C200] text-[#1A2F5E]"
                      : "border-transparent text-[#6B7A99] hover:text-[#1A2F5E]"
                  }`}
                >
                  {t === "proximos" ? "Próximos" : "Resultados"}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={`${tab}-${categoria}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
                className="flex flex-col gap-2.5"
              >
                {tab === "proximos"
                  ? proximos.map((p, i) => <ProximoCard key={p.id} partido={p} index={i} />)
                  : resultados.map((p, i) => <ResultadoCard key={p.id} partido={p} index={i} />)}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
