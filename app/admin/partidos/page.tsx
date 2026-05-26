"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { Save, Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import type { Partido, Goleador, CategoriaEquipo } from "@/lib/types";

const CATEGORIAS: CategoriaEquipo[] = ["Mayor", "Reserva", "Pre-Senior", "Sub 20", "Sub 18", "Femenino"];
const ESTADOS = ["programado", "finalizado", "suspendido"] as const;

async function getToken() {
  const { data } = await supabase!.auth.getSession();
  return data.session?.access_token ?? "";
}

function formatFecha(fecha: string) {
  const d = new Date(fecha + "T00:00:00");
  return d.toLocaleDateString("es-UY", { day: "2-digit", month: "short", year: "numeric" });
}

type GolForm = { jugador_nombre: string; minuto: string; es_penal: boolean };

function PartidoRow({ partido, token, onUpdate }: {
  partido: Partido;
  token: string;
  onUpdate: (updated: Partido) => void;
}) {
  const [expanded,   setExpanded]   = useState(false);
  const [saving,     setSaving]     = useState(false);
  const [estado,     setEstado]     = useState(partido.estado);
  const [resLocal,   setResLocal]   = useState<string>(partido.resultado_local?.toString() ?? "");
  const [resVisit,   setResVisit]   = useState<string>(partido.resultado_visitante?.toString() ?? "");
  const [goles,      setGoles]      = useState<Goleador[]>([]);
  const [golForm,    setGolForm]    = useState<GolForm>({ jugador_nombre: "", minuto: "", es_penal: false });
  const [addingGol,  setAddingGol]  = useState(false);
  const [golesLoaded, setGolesLoaded] = useState(false);

  const loadGoles = useCallback(async () => {
    if (golesLoaded) return;
    const res = await fetch(`/api/admin/goleadores?partido_id=${partido.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json() as Goleador[];
    setGoles(Array.isArray(data) ? data : []);
    setGolesLoaded(true);
  }, [partido.id, token, golesLoaded]);

  const handleExpand = () => {
    setExpanded((v) => !v);
    if (!golesLoaded) loadGoles();
  };

  async function handleSave() {
    setSaving(true);
    const body: Record<string, unknown> = { estado };
    if (estado === "finalizado") {
      body.resultado_local     = resLocal !== "" ? parseInt(resLocal)   : null;
      body.resultado_visitante = resVisit !== "" ? parseInt(resVisit)   : null;
    } else {
      body.resultado_local     = null;
      body.resultado_visitante = null;
    }
    const res = await fetch(`/api/admin/partidos?id=${partido.id}`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const updated = await res.json() as Partido;
    if (updated?.id) onUpdate(updated);
    setSaving(false);
  }

  async function handleAddGol() {
    if (!golForm.jugador_nombre.trim()) return;
    setAddingGol(true);
    const res = await fetch("/api/admin/goleadores", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        partido_id:     partido.id,
        jugador_nombre: golForm.jugador_nombre.trim(),
        minuto:         golForm.minuto ? parseInt(golForm.minuto) : null,
        es_penal:       golForm.es_penal,
        categoria:      partido.categoria,
      }),
    });
    const gol = await res.json() as Goleador;
    if (gol?.id) {
      setGoles((prev) => [...prev, gol]);
      setGolForm({ jugador_nombre: "", minuto: "", es_penal: false });
    }
    setAddingGol(false);
  }

  async function handleDeleteGol(id: string) {
    await fetch(`/api/admin/goleadores?id=${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    setGoles((prev) => prev.filter((g) => g.id !== id));
  }

  const estadoColorMap: Record<string, string> = {
    programado: "text-blue-400 border-blue-400/30 bg-blue-400/8",
    finalizado: "text-green-400 border-green-400/30 bg-green-400/8",
    suspendido: "text-orange-400 border-orange-400/30 bg-orange-400/8",
  };
  const estadoColor = estadoColorMap[estado] ?? "text-white/40";

  const golesEU    = partido.es_local ? (partido.resultado_local ?? 0) : (partido.resultado_visitante ?? 0);
  const golesRival = partido.es_local ? (partido.resultado_visitante ?? 0) : (partido.resultado_local ?? 0);
  const hasResult  = partido.estado === "finalizado" && partido.resultado_local != null;

  return (
    <div className="border border-white/8 bg-white/2">
      <div className="flex items-center gap-3 p-4">
        {/* Date */}
        <div className="flex-shrink-0 w-14 text-center">
          <div className="font-display font-black text-[#F5C200] text-xl leading-none">
            {new Date(partido.fecha + "T00:00:00").getDate()}
          </div>
          <div className="font-display font-semibold text-white/30 text-[9px] uppercase tracking-wider mt-0.5">
            {new Date(partido.fecha + "T00:00:00").toLocaleDateString("es-UY", { month: "short" })}
          </div>
        </div>

        {/* Rival + local badge */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="font-display font-black text-white text-sm uppercase truncate">
              {partido.rival}
            </span>
            {hasResult && (
              <span className="font-display font-bold text-xs text-white/50">
                {partido.es_local ? `${golesEU}–${golesRival}` : `${golesRival}–${golesEU}`}
              </span>
            )}
          </div>
          <span className="font-display font-semibold text-[10px] uppercase tracking-wider text-white/30">
            {partido.es_local ? "Local · Campo Deportivo Elbio Fernández" : "Visitante"}
          </span>
        </div>

        {/* Estado badge */}
        <span className={`font-display font-bold text-[9px] uppercase tracking-widest px-2 py-1 border ${estadoColor}`}>
          {estado}
        </span>

        {/* Expand toggle */}
        <button
          onClick={handleExpand}
          className="flex-shrink-0 w-7 h-7 flex items-center justify-center text-white/30 hover:text-white transition-colors"
        >
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
      </div>

      {expanded && (
        <div className="border-t border-white/6 p-4 flex flex-col gap-5">
          {/* Estado + resultado + guardar */}
          <div className="flex flex-wrap gap-4 items-end">
            <div>
              <label className="block font-display font-bold text-white/30 text-[10px] uppercase tracking-widest mb-1.5">Estado</label>
              <div className="flex gap-1">
                {ESTADOS.map((e) => (
                  <button
                    key={e}
                    onClick={() => setEstado(e)}
                    className={`font-display font-bold text-[10px] uppercase tracking-widest px-3 py-1.5 border transition-all ${
                      estado === e
                        ? "bg-[#F5C200]/15 text-[#F5C200] border-[#F5C200]/30"
                        : "bg-white/4 text-white/30 border-white/10 hover:text-white/60"
                    }`}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-end gap-2">
              <div>
                <label className="block font-display font-bold text-white/30 text-[10px] uppercase tracking-widest mb-1.5">
                  {partido.es_local ? "Goles Elbio" : "Goles rival"}
                </label>
                <input
                  type="number" min={0} max={99}
                  value={partido.es_local ? resLocal : resVisit}
                  onChange={(e) => partido.es_local ? setResLocal(e.target.value) : setResVisit(e.target.value)}
                  className="w-16 bg-white/4 border border-white/10 text-white font-display font-black text-lg text-center px-2 py-1.5 outline-none focus:border-[#F5C200]/40"
                />
              </div>
              <span className="font-display font-black text-white/20 text-xl pb-2">–</span>
              <div>
                <label className="block font-display font-bold text-white/30 text-[10px] uppercase tracking-widest mb-1.5">
                  {partido.es_local ? "Goles rival" : "Goles Elbio"}
                </label>
                <input
                  type="number" min={0} max={99}
                  value={partido.es_local ? resVisit : resLocal}
                  onChange={(e) => partido.es_local ? setResVisit(e.target.value) : setResLocal(e.target.value)}
                  className="w-16 bg-white/4 border border-white/10 text-white font-display font-black text-lg text-center px-2 py-1.5 outline-none focus:border-[#F5C200]/40"
                />
              </div>
            </div>

            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-1.5 bg-[#F5C200] text-[#060D16] font-display font-black text-[10px] uppercase tracking-widest px-4 py-2 hover:bg-[#F5C200]/90 disabled:opacity-50 transition-colors"
            >
              <Save size={11} />
              {saving ? "Guardando..." : "Guardar"}
            </button>
          </div>

          {/* Goles section — always visible when expanded */}
          <div>
              <p className="font-display font-bold text-white/30 text-[10px] uppercase tracking-widest mb-3">
                Goleadores de Elbio
              </p>

              {/* Existing goals */}
              {goles.length > 0 && (
                <div className="flex flex-col gap-1 mb-3">
                  {goles.map((g) => (
                    <div key={g.id} className="flex items-center gap-2 bg-white/4 px-3 py-2">
                      <span className="font-display font-black text-white text-xs uppercase flex-1">{g.jugador_nombre}</span>
                      {g.minuto && <span className="font-body text-white/30 text-xs">{g.minuto}&apos;</span>}
                      {g.es_penal && <span className="font-display font-bold text-[9px] uppercase tracking-widest text-[#F5C200]/60 border border-[#F5C200]/20 px-1.5 py-0.5">Penal</span>}
                      <button
                        onClick={() => handleDeleteGol(g.id)}
                        className="text-white/20 hover:text-red-400 transition-colors"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add goal form */}
              <div className="flex flex-wrap gap-2 items-end">
                <div>
                  <label className="block font-display font-bold text-white/25 text-[9px] uppercase tracking-widest mb-1">Jugador</label>
                  <input
                    type="text"
                    placeholder="Nombre del jugador"
                    value={golForm.jugador_nombre}
                    onChange={(e) => setGolForm((f) => ({ ...f, jugador_nombre: e.target.value }))}
                    onKeyDown={(e) => e.key === "Enter" && handleAddGol()}
                    className="bg-white/4 border border-white/10 text-white font-body text-xs px-3 py-2 outline-none focus:border-[#F5C200]/40 w-44 placeholder:text-white/20"
                  />
                </div>
                <div>
                  <label className="block font-display font-bold text-white/25 text-[9px] uppercase tracking-widest mb-1">Minuto</label>
                  <input
                    type="number" min={1} max={120} placeholder="—"
                    value={golForm.minuto}
                    onChange={(e) => setGolForm((f) => ({ ...f, minuto: e.target.value }))}
                    className="bg-white/4 border border-white/10 text-white font-body text-xs px-3 py-2 outline-none focus:border-[#F5C200]/40 w-16 placeholder:text-white/20"
                  />
                </div>
                <label className="flex items-center gap-1.5 cursor-pointer pb-0.5">
                  <input
                    type="checkbox"
                    checked={golForm.es_penal}
                    onChange={(e) => setGolForm((f) => ({ ...f, es_penal: e.target.checked }))}
                    className="accent-[#F5C200]"
                  />
                  <span className="font-display font-bold text-[10px] uppercase tracking-widest text-white/40">Penal</span>
                </label>
                <button
                  onClick={handleAddGol}
                  disabled={addingGol || !golForm.jugador_nombre.trim()}
                  className="flex items-center gap-1 font-display font-black text-[10px] uppercase tracking-widest px-3 py-2 bg-white/6 border border-white/10 text-white/60 hover:text-white hover:border-white/25 disabled:opacity-40 transition-all"
                >
                  <Plus size={11} />
                  Agregar gol
                </button>
              </div>
            </div>
        </div>
      )}
    </div>
  );
}

export default function PartidosAdmin() {
  const [categoria,  setCategoria]  = useState<CategoriaEquipo>("Mayor");
  const [partidos,   setPartidos]   = useState<Partido[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [token,      setToken]      = useState("");

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => {
      setToken(data.session?.access_token ?? "");
    });
  }, []);

  const loadPartidos = useCallback(async (cat: CategoriaEquipo, tok: string) => {
    if (!tok) return;
    setLoading(true);
    const res = await fetch(`/api/admin/partidos?categoria=${encodeURIComponent(cat)}`, {
      headers: { Authorization: `Bearer ${tok}` },
    });
    const data = await res.json() as Partido[];
    setPartidos(Array.isArray(data) ? data : []);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (token) loadPartidos(categoria, token);
  }, [token, categoria, loadPartidos]);

  const handleUpdate = (updated: Partido) => {
    setPartidos((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  };

  const programados  = partidos.filter((p) => p.estado === "programado");
  const finalizados  = partidos.filter((p) => p.estado === "finalizado");
  const suspendidos  = partidos.filter((p) => p.estado === "suspendido");

  return (
    <div>
      <div className="flex items-end justify-between mb-8">
        <div>
          <p className="font-display font-bold text-[#F5C200] text-xs uppercase tracking-[0.25em] mb-1">Admin</p>
          <h1 className="font-display font-black text-white text-2xl uppercase tracking-wide">Partidos & Goleadores</h1>
        </div>
      </div>

      {/* Category selector */}
      <div className="flex flex-wrap gap-1 mb-8">
        {CATEGORIAS.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoria(cat)}
            className={`font-display font-bold text-[10px] uppercase tracking-widest px-4 py-2 border transition-all ${
              categoria === cat
                ? "bg-[#F5C200]/15 text-[#F5C200] border-[#F5C200]/30"
                : "bg-white/4 text-white/30 border-white/10 hover:text-white/60"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="font-body text-white/30 text-sm">Cargando partidos...</p>
      ) : partidos.length === 0 ? (
        <p className="font-body text-white/30 text-sm">No hay partidos cargados para {categoria}.</p>
      ) : (
        <div className="flex flex-col gap-8">
          {finalizados.length > 0 && (
            <div>
              <p className="font-display font-bold text-white/30 text-[10px] uppercase tracking-widest mb-3">
                Finalizados
              </p>
              <div className="flex flex-col gap-1">
                {finalizados.map((p) => (
                  <PartidoRow key={p.id} partido={p} token={token} onUpdate={handleUpdate} />
                ))}
              </div>
            </div>
          )}

          {programados.length > 0 && (
            <div>
              <p className="font-display font-bold text-white/30 text-[10px] uppercase tracking-widest mb-3">
                Próximos
              </p>
              <div className="flex flex-col gap-1">
                {programados.map((p) => (
                  <PartidoRow key={p.id} partido={p} token={token} onUpdate={handleUpdate} />
                ))}
              </div>
            </div>
          )}

          {suspendidos.length > 0 && (
            <div>
              <p className="font-display font-bold text-orange-400/50 text-[10px] uppercase tracking-widest mb-3">
                Suspendidos
              </p>
              <div className="flex flex-col gap-1">
                {suspendidos.map((p) => (
                  <PartidoRow key={p.id} partido={p} token={token} onUpdate={handleUpdate} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
