"use client";

import { useState, useEffect } from "react";
import { mockPartidos } from "@/lib/mock-data";
import { supabase } from "@/lib/supabase";
import type { Partido } from "@/lib/types";

type Categoria = "Mayor" | "Reserva" | "Pre-Senior" | "Sub 20" | "Sub 18" | "Femenino";
const categorias: Categoria[] = ["Mayor", "Reserva", "Pre-Senior", "Sub 20", "Sub 18", "Femenino"];

const tableStats = {
  position: 3,
  played: 12,
  won: 7,
  drawn: 2,
  lost: 3,
  points: 23,
  competition: "Primera Rueda 2026",
};

function getEuScore(p: Partido) {
  return p.es_local ? p.resultado_local ?? 0 : p.resultado_visitante ?? 0;
}
function getRivalScore(p: Partido) {
  return p.es_local ? p.resultado_visitante ?? 0 : p.resultado_local ?? 0;
}

function formatFecha(fecha: string, hora?: string | null) {
  const d = new Date(fecha + "T00:00:00");
  const day = d.toLocaleDateString("es-AR", { weekday: "short", day: "numeric", month: "short" }).toUpperCase();
  return hora ? `${day} - ${hora}` : day;
}

export default function MatchStats() {
  const [categoria, setCategoria] = useState<Categoria>("Mayor");
  const [partidos,  setPartidos]  = useState<Partido[]>(mockPartidos);

  useEffect(() => {
    if (!supabase) return;
    supabase.from("partidos").select("*").then(({ data }) => {
      if (data?.length) setPartidos(data as Partido[]);
    });
  }, []);

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
              className={`flex-1 font-display font-black text-[11px] uppercase tracking-[0.15em] py-3.5 transition-all duration-200 border-b-2 -mb-px ${
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
            <p className="font-display font-bold text-[#F5C200] text-[9px] uppercase tracking-[0.22em] mb-4">
              Posición en Tabla
            </p>
            <div className="flex items-center gap-5">
              <span
                className="font-display font-black text-white leading-none"
                style={{ fontSize: "clamp(3rem, 6vw, 4.5rem)" }}
              >
                3°
              </span>
              <div>
                <p className="font-display font-black text-white text-sm uppercase tracking-wide leading-tight mb-2">
                  {tableStats.competition}
                </p>
                <div className="flex gap-3 font-display font-bold text-[10px] uppercase text-white/35">
                  <span><span className="text-white/65">{tableStats.played}</span>PJ</span>
                  <span><span className="text-white/65">{tableStats.won}</span>G</span>
                  <span><span className="text-white/65">{tableStats.drawn}</span>E</span>
                  <span><span className="text-white/65">{tableStats.lost}</span>P</span>
                </div>
                <p className="font-display font-black text-[#F5C200] text-xl mt-1.5 leading-none">
                  {tableStats.points} <span className="text-[10px] font-bold text-white/30 tracking-widest">PTS</span>
                </p>
              </div>
            </div>
          </div>

          {/* Col 2 — Último resultado */}
          <div className="py-6 sm:py-0 sm:px-10">
            <p className="font-display font-bold text-[#F5C200] text-[9px] uppercase tracking-[0.22em] mb-4">
              Último Resultado
            </p>
            {last ? (
              <>
                <div className="flex items-center gap-3 mb-3">
                  <span className="font-display font-black text-white text-lg uppercase tracking-wide flex-1">
                    {last.es_local ? "ELBIO" : last.rival.toUpperCase().split(" ")[0]}
                  </span>
                  <span className="font-display font-black text-[#F5C200] leading-none" style={{ fontSize: "2.8rem" }}>
                    {getEuScore(last)}
                  </span>
                  <span className="font-display font-bold text-white/25 text-xl">-</span>
                  <span className="font-display font-black text-white leading-none" style={{ fontSize: "2.8rem" }}>
                    {getRivalScore(last)}
                  </span>
                  <span className="font-display font-black text-white text-lg uppercase tracking-wide flex-1 text-right">
                    {last.es_local ? last.rival.toUpperCase().split(" ")[0] : "ELBIO"}
                  </span>
                </div>
                <p className="font-display font-bold text-[10px] uppercase tracking-[0.2em] text-white/25">
                  {last.competencia}
                </p>
              </>
            ) : (
              <p className="font-body text-white/30 text-sm">Sin datos</p>
            )}
          </div>

          {/* Col 3 — Próximo partido */}
          <div className="pt-6 sm:pt-0 sm:pl-10">
            <p className="font-display font-bold text-[#F5C200] text-[9px] uppercase tracking-[0.22em] mb-4">
              Próximo Partido
            </p>
            {next ? (
              <>
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-display font-black text-white text-xl uppercase tracking-wide">ELBIO</span>
                  <span className="font-display font-bold text-white/30 text-base mx-1">vs</span>
                  <span className="font-display font-black text-white/60 text-xl uppercase tracking-wide truncate">
                    {next.rival.toUpperCase().split(" ")[0]}
                  </span>
                </div>
                <p className="font-display font-black text-[#F5C200] text-sm tracking-wide mb-1">
                  {formatFecha(next.fecha, next.hora)}
                </p>
                <p className="font-display font-bold text-white/30 text-[10px] uppercase tracking-widest mb-3 truncate">
                  {next.sede}
                </p>
                <span className="inline-block font-display font-black text-[10px] uppercase tracking-[0.15em] bg-[#F5C200] text-[#0D1B2E] px-3 py-1">
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
