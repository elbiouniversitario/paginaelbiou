"use client";

import { useState, useEffect } from "react";
import { mockPartidos } from "@/lib/mock-data";
import { supabase } from "@/lib/supabase";
import type { Partido } from "@/lib/types";

type Categoria = "Mayor" | "Reserva" | "Pre-Senior" | "Sub 20" | "Sub 18" | "Femenino";
const categorias: Categoria[] = ["Mayor", "Reserva", "Pre-Senior", "Sub 20", "Sub 18", "Femenino"];

interface TablaRow {
  posicion: number; pj: number; pg: number; pe: number; pp: number; pts: number;
  competencia: string | null;
}

function getEuScore(p: Partido)    { return p.resultado_local    ?? 0; }
function getRivalScore(p: Partido) { return p.resultado_visitante ?? 0; }

function formatFecha(fecha: string, hora?: string | null) {
  const d = new Date(fecha + "T00:00:00");
  const day = d.toLocaleDateString("es-AR", { weekday: "short", day: "numeric", month: "short" }).toUpperCase();
  return hora ? `${day} - ${hora}` : day;
}

export default function MatchStats() {
  const [categoria, setCategoria] = useState<Categoria>("Mayor");
  const [partidos,  setPartidos]  = useState<Partido[]>(mockPartidos);
  const [tabla,     setTabla]     = useState<TablaRow | null>(null);

  useEffect(() => {
    if (!supabase) return;
    supabase.from("partidos").select("*").then(({ data }) => {
      if (data?.length) setPartidos(data as Partido[]);
    });
  }, []);

  useEffect(() => {
    if (!supabase) return;
    const dbName =
      categoria === "Pre-Senior" ? "Pre-Senior" : categoria;
    supabase
      .from("tabla_posiciones")
      .select("posicion,pj,pg,pe,pp,pts,competencia")
      .eq("categoria", dbName)
      .eq("is_local_team", true)
      .single()
      .then(({ data }) => { setTabla((data as TablaRow | null) ?? null); });
  }, [categoria]);

  const byCategoria = partidos.filter((p) => p.categoria === categoria);

  const last = [...byCategoria]
    .filter((p) => p.estado === "finalizado")
    .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())[0];

  const next = [...byCategoria]
    .filter((p) => p.estado === "programado")
    .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())[0];

  return (
    <div className="bg-[#0D1B2E]">
      {/* Top yellow line */}
      <div className="h-px bg-[#F5C200]" />

      {/* Category tabs */}
      <div className="max-w-7xl mx-auto px-4 lg:px-10">
        <div className="flex items-center border-b border-white/8">
          {categorias.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoria(cat)}
              className={`flex-1 font-display font-black text-xs uppercase tracking-[0.15em] py-3.5 transition-all duration-200 border-b-2 -mb-px ${
                categoria === cat
                  ? "text-[#F5C200] border-[#F5C200]"
                  : "text-white/35 border-transparent hover:text-white/60"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Stats columns */}
      <div className="max-w-7xl mx-auto px-4 lg:px-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-white/8 py-6 lg:py-8">

          {/* Col 1 — Tabla */}
          <div className="pb-6 sm:pb-0 sm:pr-10">
            <p className="font-display font-bold text-[#F5C200] text-[11px] uppercase tracking-[0.22em] mb-5">
              Posición en Tabla
            </p>
            {tabla ? (
              <div className="flex items-center gap-5">
                <span
                  className="font-display font-black text-white leading-none"
                  style={{ fontSize: "clamp(3rem, 6vw, 4.5rem)" }}
                >
                  {tabla.posicion}°
                </span>
                <div>
                  {tabla.competencia && (
                    <p className="font-display font-black text-white text-base uppercase tracking-[0.08em] leading-tight mb-3">
                      {tabla.competencia}
                    </p>
                  )}
                  <div className="flex gap-4 font-display font-bold text-sm uppercase text-white/35 tabular-nums tracking-wider">
                    <span><span className="text-white/70">{tabla.pj}</span> PJ</span>
                    <span><span className="text-white/70">{tabla.pg}</span> G</span>
                    <span><span className="text-white/70">{tabla.pe}</span> E</span>
                    <span><span className="text-white/70">{tabla.pp}</span> P</span>
                  </div>
                  <p className="font-display font-black text-[#F5C200] text-2xl mt-2 leading-none">
                    {tabla.pts} <span className="text-xs font-bold text-white/30 tracking-widest">PTS</span>
                  </p>
                </div>
              </div>
            ) : (
              <p className="font-body text-white/30 text-sm">Sin datos</p>
            )}
          </div>

          {/* Col 2 — Último resultado */}
          <div className="py-6 sm:py-0 sm:px-10">
            <p className="font-display font-bold text-[#F5C200] text-[11px] uppercase tracking-[0.22em] mb-5">
              Último Resultado
            </p>
            {last ? (
              <>
                <div className="flex items-center gap-3 mb-3">
                  <span className="font-display font-black text-white text-base uppercase tracking-[0.1em] flex-1 min-w-0 truncate">
                    {last.es_local ? "ELBIO" : last.rival.toUpperCase()}
                  </span>
                  <span
                    className={`font-display font-black leading-none flex-shrink-0 ${last.es_local ? "text-[#F5C200]" : "text-white"}`}
                    style={{ fontSize: "3rem" }}
                  >
                    {last.es_local ? getEuScore(last) : getRivalScore(last)}
                  </span>
                  <span className="font-display font-bold text-white/25 text-2xl flex-shrink-0">-</span>
                  <span
                    className={`font-display font-black leading-none flex-shrink-0 ${last.es_local ? "text-white" : "text-[#F5C200]"}`}
                    style={{ fontSize: "3rem" }}
                  >
                    {last.es_local ? getRivalScore(last) : getEuScore(last)}
                  </span>
                  <span className="font-display font-black text-white text-base uppercase tracking-[0.1em] flex-1 min-w-0 truncate text-right">
                    {last.es_local ? last.rival.toUpperCase() : "ELBIO"}
                  </span>
                </div>
                <p className="font-display font-bold text-[11px] uppercase tracking-[0.22em] text-white/30">
                  {last.competencia}
                </p>
              </>
            ) : (
              <p className="font-body text-white/30 text-sm">Sin datos</p>
            )}
          </div>

          {/* Col 3 — Próximo partido */}
          <div className="pt-6 sm:pt-0 sm:pl-10">
            <p className="font-display font-bold text-[#F5C200] text-[11px] uppercase tracking-[0.22em] mb-5">
              Próximo Partido
            </p>
            {next ? (
              <>
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  <span className="font-display font-black text-white text-2xl uppercase tracking-[0.08em]">ELBIO</span>
                  <span className="font-display font-bold text-white/30 text-lg mx-1">vs</span>
                  <span className="font-display font-black text-white/60 text-2xl uppercase tracking-[0.08em] truncate min-w-0">
                    {next.rival.toUpperCase()}
                  </span>
                </div>
                <p className="font-display font-black text-[#F5C200] text-sm tracking-[0.12em] mb-1.5">
                  {formatFecha(next.fecha, next.hora)}
                </p>
                <p className="font-display font-bold text-white/30 text-sm uppercase tracking-wider mb-4 truncate">
                  {next.sede}
                </p>
                <span className="inline-block font-display font-black text-xs uppercase tracking-[0.18em] bg-[#F5C200] text-[#0D1B2E] px-4 py-1.5">
                  {next.es_local ? "Local" : "Visitante"}
                </span>
              </>
            ) : (
              <p className="font-body text-white/30 text-sm">Sin datos</p>
            )}
          </div>

        </div>
      </div>

      {/* Bottom yellow line */}
      <div className="h-px bg-[#F5C200]" />
    </div>
  );
}
