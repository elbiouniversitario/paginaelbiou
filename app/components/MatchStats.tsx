import { mockPartidos } from "@/lib/mock-data";
import type { Partido } from "@/lib/types";

const tableStats = {
  position: 3,
  played: 12,
  won: 7,
  drawn: 2,
  lost: 3,
  gf: 18,
  ga: 9,
  points: 23,
  competition: "Primera Rueda 2026",
};

function getEuScore(p: Partido) {
  return p.es_local ? p.resultado_local ?? 0 : p.resultado_visitante ?? 0;
}
function getRivalScore(p: Partido) {
  return p.es_local ? p.resultado_visitante ?? 0 : p.resultado_local ?? 0;
}
function getResult(p: Partido): "Victoria" | "Empate" | "Derrota" {
  const eu = getEuScore(p);
  const rv = getRivalScore(p);
  return eu > rv ? "Victoria" : eu < rv ? "Derrota" : "Empate";
}

function formatFecha(fecha: string, hora?: string) {
  const d = new Date(fecha + "T00:00:00");
  const day = d.toLocaleDateString("es-AR", { weekday: "short", day: "numeric", month: "short" });
  return hora ? `${day} · ${hora}` : day;
}

export default function MatchStats() {
  const last = [...mockPartidos]
    .filter((p) => p.estado === "finalizado")
    .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())[0];

  const next = [...mockPartidos]
    .filter((p) => p.estado === "programado")
    .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())[0];

  const result = last ? getResult(last) : null;
  const resultColor =
    result === "Victoria" ? "#4ADE80" : result === "Derrota" ? "#F87171" : "#FCD34D";

  return (
    <div className="bg-[#0D1B2E] text-white">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-white/10">

          {/* ---- Col 1: Table position ---- */}
          <div className="px-6 py-5 lg:px-10 lg:py-6 flex items-center gap-5">
            <div className="flex-shrink-0 text-center">
              <span className="font-display font-black text-[#F5C200] leading-none block" style={{ fontSize: "3rem" }}>
                {tableStats.position}°
              </span>
              <span className="font-display font-bold text-white/30 text-[9px] uppercase tracking-widest">Posición</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-display font-black text-white text-xs uppercase tracking-wider mb-1 truncate">
                {tableStats.competition}
              </p>
              <div className="flex gap-3 font-display font-semibold text-[10px] uppercase text-white/40">
                <span><span className="text-white/70">{tableStats.played}</span> PJ</span>
                <span><span className="text-white/70">{tableStats.won}</span> G</span>
                <span><span className="text-white/70">{tableStats.drawn}</span> E</span>
                <span><span className="text-white/70">{tableStats.lost}</span> P</span>
              </div>
              <div className="mt-1.5 font-display font-black text-white/40 text-[10px] uppercase tracking-wider">
                <span className="text-[#F5C200] text-base font-black">{tableStats.points}</span> pts
              </div>
            </div>
          </div>

          {/* ---- Col 2: Last result ---- */}
          <div className="px-6 py-5 lg:px-10 lg:py-6 flex flex-col justify-center">
            <p className="font-display font-bold text-white/30 text-[9px] uppercase tracking-widest mb-3">
              Último resultado
            </p>
            {last ? (
              <>
                <div className="flex items-center gap-3 mb-2">
                  <span className="font-display font-black text-white text-sm uppercase tracking-wide flex-1 truncate">
                    {last.es_local ? "EFU" : last.rival}
                  </span>
                  <span className="font-display font-black text-[#F5C200] text-2xl leading-none w-6 text-center">
                    {last.resultado_local ?? 0}
                  </span>
                  <span className="font-display text-white/30 text-sm">—</span>
                  <span className="font-display font-black text-[#F5C200] text-2xl leading-none w-6 text-center">
                    {last.resultado_visitante ?? 0}
                  </span>
                  <span className="font-display font-black text-white text-sm uppercase tracking-wide flex-1 truncate text-right">
                    {last.es_local ? last.rival : "EFU"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{ background: resultColor }}
                  />
                  <span className="font-display font-bold text-[10px] uppercase tracking-wider" style={{ color: resultColor }}>
                    {result}
                  </span>
                  <span className="font-body text-white/25 text-[10px] ml-auto">{last.competencia}</span>
                </div>
              </>
            ) : (
              <p className="font-body text-white/30 text-sm">Sin datos</p>
            )}
          </div>

          {/* ---- Col 3: Next match ---- */}
          <div className="px-6 py-5 lg:px-10 lg:py-6 flex flex-col justify-center">
            <p className="font-display font-bold text-white/30 text-[9px] uppercase tracking-widest mb-3">
              Próximo partido
            </p>
            {next ? (
              <>
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-display font-black text-white text-sm uppercase tracking-wide">EFU</span>
                  <span className="font-display text-white/25 text-sm mx-1">vs</span>
                  <span className="font-display font-black text-white text-sm uppercase tracking-wide truncate">{next.rival}</span>
                </div>
                <p className="font-body text-[#F5C200] text-xs mb-1">{formatFecha(next.fecha, next.hora)}</p>
                <p className="font-body text-white/35 text-[10px] truncate">{next.sede}</p>
                <span className="mt-2 inline-block font-display font-bold text-[9px] uppercase tracking-widest text-[#1A2F5E] bg-[#F5C200] px-2 py-0.5 w-fit">
                  {next.es_local ? "Local" : "Visitante"}
                </span>
              </>
            ) : (
              <p className="font-body text-white/30 text-sm">Sin datos</p>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
