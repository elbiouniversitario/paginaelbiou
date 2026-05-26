"use client";

import { useState, useRef, useEffect } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { MapPin, Clock, Shield, Trophy, AlertCircle } from "lucide-react";
import type { Partido } from "@/lib/types";
import { mockPartidos } from "@/lib/mock-data";
import { supabase } from "@/lib/supabase";

type Tab = "proximos" | "resultados";
type Categoria = "Mayor" | "Reserva" | "Pre-Senior" | "Sub 20" | "Sub 18" | "Femenino";

const categorias: Categoria[] = ["Mayor", "Reserva", "Pre-Senior", "Sub 20", "Sub 18", "Femenino"];

type GoleadorEntry = { nombre: string; goles: number };

function ProximoCard({ partido, index }: { partido: Partido; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-20px" });
  const fecha = new Date(partido.fecha + "T00:00:00");
  const suspendido = partido.estado === "suspendido";

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 14 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.4, delay: index * 0.07 }}
      className={`border transition-all duration-200 flex flex-col lg:flex-row lg:items-center gap-4 p-4 lg:p-5 ${
        suspendido
          ? "bg-[#FFF8EC] border-orange-200"
          : "bg-white border-[#D8E1EF] hover:border-[#1A2F5E]/30 hover:shadow-sm"
      }`}
    >
      <div className={`flex-shrink-0 text-white text-center px-4 py-2.5 min-w-[68px] ${suspendido ? "bg-orange-400" : "bg-[#1A2F5E]"}`}>
        <div className="font-display font-black text-2xl leading-none">{fecha.getDate()}</div>
        <div className="font-display font-semibold text-xs uppercase tracking-wider mt-0.5 opacity-60">
          {fecha.toLocaleDateString("es-AR", { month: "short" })}
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <span className={`font-display font-bold text-xs uppercase tracking-widest px-2 py-0.5 ${
            suspendido ? "bg-orange-100 text-orange-700" : "bg-[#EEF3FB] text-[#1A2F5E]"
          }`}>
            {suspendido ? "Suspendido" : partido.competencia}
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
        {!suspendido && (
          <div className="flex gap-3 text-[#6B7A99] flex-wrap">
            {partido.hora && (
              <span className="flex items-center gap-1 font-body text-xs">
                <Clock size={10} />{partido.hora} hs
              </span>
            )}
            {partido.sede && (
              <span className="flex items-center gap-1 font-body text-xs truncate max-w-[200px]">
                <MapPin size={10} />{partido.sede}
              </span>
            )}
          </div>
        )}
        {suspendido && (
          <div className="flex items-center gap-1 text-orange-500">
            <AlertCircle size={10} />
            <span className="font-body text-xs">Fecha a confirmar</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function ResultadoCard({ partido, index }: { partido: Partido; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-20px" });
  const fecha = new Date(partido.fecha + "T00:00:00");
  const golesEU    = partido.es_local ? partido.resultado_local ?? 0 : partido.resultado_visitante ?? 0;
  const golesRival = partido.es_local ? partido.resultado_visitante ?? 0 : partido.resultado_local ?? 0;
  const resultado  = golesEU === golesRival ? "Empate" : golesEU > golesRival ? "Victoria" : "Derrota";
  const color      = resultado === "Victoria" ? "#16A34A" : resultado === "Empate" ? "#D97706" : "#DC2626";

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

function GoleadoresPanel({ categoria }: { categoria: Categoria }) {
  const [goleadores, setGoleadores] = useState<GoleadorEntry[]>([]);
  const [loading,    setLoading]    = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/goleadores?categoria=${encodeURIComponent(categoria)}`)
      .then((r) => r.json())
      .then((data) => { setGoleadores(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [categoria]);

  if (loading) {
    return <p className="font-body text-xs text-[#6B7A99] py-6 text-center">Cargando...</p>;
  }

  if (goleadores.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-10 text-[#6B7A99]/40">
        <Trophy size={28} strokeWidth={1.5} />
        <p className="font-display font-bold text-xs uppercase tracking-widest">Sin goles registrados</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1.5">
      {goleadores.map(({ nombre, goles }, i) => (
        <motion.div
          key={nombre}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: i * 0.06 }}
          className="flex items-center gap-3 bg-white border border-[#D8E1EF] px-4 py-3"
        >
          <span className={`font-display font-black text-sm w-5 text-center flex-shrink-0 ${
            i === 0 ? "text-[#F5C200]" : i === 1 ? "text-[#9CA3AF]" : i === 2 ? "text-[#B45309]" : "text-[#D8E1EF]"
          }`}>
            {i + 1}
          </span>
          {i === 0 && <Trophy size={12} className="text-[#F5C200] flex-shrink-0" />}
          <span className="font-display font-black text-xs uppercase text-[#1A2F5E] flex-1 truncate">
            {nombre}
          </span>
          <span className="font-display font-black text-xl text-[#1A2F5E] leading-none">{goles}</span>
        </motion.div>
      ))}
    </div>
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

  const byCategoria  = partidos.filter((p) => p.categoria === categoria);
  const programados  = byCategoria.filter((p) => p.estado === "programado");
  const suspendidos  = byCategoria.filter((p) => p.estado === "suspendido");
  const proximos     = [...programados, ...suspendidos];
  const resultados   = byCategoria.filter((p) => p.estado === "finalizado").reverse();

  return (
    <section id="calendario" className="py-20 lg:py-28 bg-[#F7F9FC]">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">

        {/* Header — inverted: big = TEMPORADA 2026, small = section tags */}
        <div ref={titleRef} className="mb-10">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={titleInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="font-display font-black uppercase text-[clamp(2.5rem,7vw,5.5rem)] leading-none text-[#1A2F5E]"
          >
            Temporada 2026
          </motion.h2>
          <div className="w-16 h-1 bg-[#F5C200] mt-4" />
        </div>

        <div className="flex flex-col lg:flex-row gap-6">

          {/* ── Shared category sidebar ── */}
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

          {/* ── Right area: calendar + goleadores ── */}
          <div className="flex-1 min-w-0 flex flex-col xl:flex-row gap-6">

            {/* Calendar column */}
            <div className="flex-1 min-w-0">
              <div className="section-tag mb-4">Calendario</div>

              {/* Tabs */}
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
                    ? proximos.length > 0
                      ? proximos.map((p, i) => <ProximoCard key={p.id} partido={p} index={i} />)
                      : <p className="font-body text-sm text-[#6B7A99] py-8 text-center">No hay próximos partidos.</p>
                    : resultados.length > 0
                      ? resultados.map((p, i) => <ResultadoCard key={p.id} partido={p} index={i} />)
                      : <p className="font-body text-sm text-[#6B7A99] py-8 text-center">Sin resultados registrados.</p>
                  }
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Goleadores column */}
            <div className="xl:w-64 flex-shrink-0">
              <div className="section-tag mb-4">Goleadores</div>
              <AnimatePresence mode="wait">
                <motion.div
                  key={categoria}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <GoleadoresPanel categoria={categoria} />
                </motion.div>
              </AnimatePresence>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
