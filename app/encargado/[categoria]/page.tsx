"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, LogOut, Check, X, Star } from "lucide-react";
import { CATEGORIES, type CatSlug } from "@/lib/encargado-auth";
import type { Partido } from "@/lib/types";

// ── Types ──────────────────────────────────────────────────────────────────

interface TablaRow {
  id: string;
  categoria: string;
  competencia: string | null;
  posicion: number;
  equipo: string;
  is_local_team: boolean;
  pj: number; pg: number; pe: number; pp: number;
  gf: number; gc: number; pts: number;
}

type Tab = "partidos" | "tabla";

// ── Partido Form defaults ─────────────────────────────────────────────────

const emptyPartido = {
  rival: "", fecha: "", hora: "", sede: "",
  es_local: true, estado: "programado",
  resultado_local: "", resultado_visitante: "",
  competencia: "",
};

type PartidoForm = typeof emptyPartido;

// ── Tabla row defaults ────────────────────────────────────────────────────

const emptyTablaRow = {
  posicion: 1, equipo: "", is_local_team: false,
  pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0, pts: 0,
};
type TablaForm = typeof emptyTablaRow;

// ── Estado badge ──────────────────────────────────────────────────────────

function EstadoBadge({ estado }: { estado: string }) {
  const map: Record<string, string> = {
    programado: "bg-blue-500/15 text-blue-300",
    finalizado:  "bg-green-500/15 text-green-300",
    suspendido:  "bg-red-500/15 text-red-300",
    en_curso:    "bg-yellow-500/15 text-yellow-300",
  };
  const labels: Record<string, string> = {
    programado: "Programado", finalizado: "Finalizado",
    suspendido: "Suspendido", en_curso: "En curso",
  };
  return (
    <span className={`font-display font-bold text-xs uppercase tracking-widest px-2 py-0.5 ${map[estado] ?? "bg-white/10 text-white/40"}`}>
      {labels[estado] ?? estado}
    </span>
  );
}

// ── Partido Modal ─────────────────────────────────────────────────────────

function PartidoModal({
  initial, onSave, onClose,
}: {
  initial?: PartidoForm & { id?: string };
  onSave: (data: PartidoForm & { id?: string }) => Promise<void>;
  onClose: () => void;
}) {
  const [form, setForm] = useState<PartidoForm>(
    initial
      ? {
          rival: initial.rival, fecha: initial.fecha, hora: initial.hora ?? "",
          sede: initial.sede ?? "", es_local: initial.es_local,
          estado: initial.estado,
          resultado_local: initial.resultado_local?.toString() ?? "",
          resultado_visitante: initial.resultado_visitante?.toString() ?? "",
          competencia: initial.competencia ?? "",
        }
      : emptyPartido
  );
  const [saving, setSaving] = useState(false);

  const set = (k: keyof PartidoForm, v: unknown) =>
    setForm((f) => ({ ...f, [k]: v }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await onSave({ ...form, id: initial?.id });
    setSaving(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 p-0 sm:p-4">
      <div className="bg-[#0D1B2E] border border-white/10 w-full sm:max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <h3 className="font-display font-black text-white text-sm uppercase tracking-widest">
            {initial?.id ? "Editar partido" : "Agregar partido"}
          </h3>
          <button onClick={onClose} className="text-white/40 hover:text-white/80 transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">
          {/* Rival */}
          <Field label="Rival">
            <input
              type="text" value={form.rival} required
              onChange={(e) => set("rival", e.target.value)}
              placeholder="Nombre del equipo rival"
              className={inputCls}
            />
          </Field>

          {/* Fecha + Hora */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Fecha">
              <input type="date" value={form.fecha} required
                onChange={(e) => set("fecha", e.target.value)} className={inputCls} />
            </Field>
            <Field label="Hora">
              <input type="time" value={form.hora}
                onChange={(e) => set("hora", e.target.value)} className={inputCls} />
            </Field>
          </div>

          {/* Sede */}
          <Field label="Sede / Estadio">
            <input type="text" value={form.sede}
              onChange={(e) => set("sede", e.target.value)}
              placeholder="Nombre de la cancha o estadio"
              className={inputCls} />
          </Field>

          {/* Competencia */}
          <Field label="Competencia">
            <input type="text" value={form.competencia}
              onChange={(e) => set("competencia", e.target.value)}
              placeholder="ej: Primera Rueda 2026"
              className={inputCls} />
          </Field>

          {/* Local / Visitante */}
          <div>
            <p className={labelCls}>Local o Visitante</p>
            <div className="flex gap-2">
              {[{ v: true, l: "Local" }, { v: false, l: "Visitante" }].map(({ v, l }) => (
                <button
                  key={l} type="button"
                  onClick={() => set("es_local", v)}
                  className={`flex-1 py-2.5 font-display font-bold text-xs uppercase tracking-wider border transition-colors ${
                    form.es_local === v
                      ? "bg-[#F5C200] text-[#0D1B2E] border-[#F5C200]"
                      : "bg-transparent text-white/50 border-white/15 hover:border-white/30"
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          {/* Estado */}
          <Field label="Estado">
            <select value={form.estado}
              onChange={(e) => set("estado", e.target.value)}
              className={selectCls}>
              <option value="programado">Programado</option>
              <option value="en_curso">En curso</option>
              <option value="finalizado">Finalizado</option>
              <option value="suspendido">Suspendido</option>
            </select>
          </Field>

          {/* Score — only when finalizado */}
          {form.estado === "finalizado" && (
            <div className="grid grid-cols-2 gap-3">
              <Field label="Goles Elbio">
                <input type="number" min={0} value={form.resultado_local}
                  onChange={(e) => set("resultado_local", e.target.value)}
                  className={inputCls} required />
              </Field>
              <Field label="Goles Rival">
                <input type="number" min={0} value={form.resultado_visitante}
                  onChange={(e) => set("resultado_visitante", e.target.value)}
                  className={inputCls} required />
              </Field>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-3 font-display font-bold text-xs uppercase tracking-wider text-white/50 border border-white/15 hover:border-white/30 transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 py-3 font-display font-black text-xs uppercase tracking-wider bg-[#F5C200] text-[#0D1B2E] hover:bg-[#F5C200]/90 transition-colors disabled:opacity-50">
              {saving ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Tabla Row Modal ────────────────────────────────────────────────────────

function TablaModal({
  initial, competenciaDefault, onSave, onClose,
}: {
  initial?: TablaForm & { id?: string; competencia?: string };
  competenciaDefault: string;
  onSave: (data: TablaForm & { id?: string; competencia: string }) => Promise<void>;
  onClose: () => void;
}) {
  const [form, setForm] = useState<TablaForm>(
    initial
      ? { posicion: initial.posicion, equipo: initial.equipo,
          is_local_team: initial.is_local_team,
          pj: initial.pj, pg: initial.pg, pe: initial.pe, pp: initial.pp,
          gf: initial.gf, gc: initial.gc, pts: initial.pts }
      : emptyTablaRow
  );
  const [competencia, setCompetencia] = useState(
    initial?.competencia ?? competenciaDefault
  );
  const [saving, setSaving] = useState(false);

  const num = (k: keyof TablaForm, v: string) =>
    setForm((f) => ({ ...f, [k]: parseInt(v) || 0 }));

  function autoPts() {
    setForm((f) => ({ ...f, pts: f.pg * 3 + f.pe }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await onSave({ ...form, id: initial?.id, competencia });
    setSaving(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 p-0 sm:p-4">
      <div className="bg-[#0D1B2E] border border-white/10 w-full sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <h3 className="font-display font-black text-white text-sm uppercase tracking-widest">
            {initial?.id ? "Editar equipo" : "Agregar equipo"}
          </h3>
          <button onClick={onClose} className="text-white/40 hover:text-white/80 transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">
          {/* Competencia */}
          <Field label="Competencia">
            <input type="text" value={competencia}
              onChange={(e) => setCompetencia(e.target.value)}
              placeholder="ej: Primera Rueda 2026"
              className={inputCls} />
          </Field>

          {/* Posicion + Equipo */}
          <div className="grid grid-cols-[80px_1fr] gap-3">
            <Field label="Pos.">
              <input type="number" min={1} value={form.posicion} required
                onChange={(e) => num("posicion", e.target.value)} className={inputCls} />
            </Field>
            <Field label="Equipo">
              <input type="text" value={form.equipo} required
                onChange={(e) => setForm((f) => ({ ...f, equipo: e.target.value }))}
                placeholder="Nombre del equipo"
                className={inputCls} />
            </Field>
          </div>

          {/* Stats row 1 */}
          <div className="grid grid-cols-4 gap-2">
            {([["pj","PJ"],["pg","G"],["pe","E"],["pp","P"]] as const).map(([k,l]) => (
              <Field key={k} label={l}>
                <input type="number" min={0} value={form[k]}
                  onChange={(e) => num(k, e.target.value)} className={inputCls} />
              </Field>
            ))}
          </div>

          {/* Stats row 2 */}
          <div className="grid grid-cols-3 gap-2">
            {([["gf","GF"],["gc","GC"]] as const).map(([k,l]) => (
              <Field key={k} label={l}>
                <input type="number" min={0} value={form[k]}
                  onChange={(e) => num(k, e.target.value)} className={inputCls} />
              </Field>
            ))}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <p className={labelCls}>PTS</p>
                <button type="button" onClick={autoPts}
                  className="font-display font-bold text-xs uppercase tracking-wider text-[#F5C200]/70 hover:text-[#F5C200] transition-colors">
                  auto
                </button>
              </div>
              <input type="number" min={0} value={form.pts}
                onChange={(e) => num("pts", e.target.value)} className={inputCls} />
            </div>
          </div>

          {/* Es nuestro equipo */}
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={form.is_local_team}
              onChange={(e) => setForm((f) => ({ ...f, is_local_team: e.target.checked }))}
              className="sr-only"
            />
            <div
              className={`w-5 h-5 flex items-center justify-center border transition-colors flex-shrink-0 ${
                form.is_local_team ? "bg-[#F5C200] border-[#F5C200]" : "bg-transparent border-white/20"
              }`}
            >
              {form.is_local_team && <Check size={12} className="text-[#0D1B2E]" />}
            </div>
            <span className="font-display font-bold text-xs uppercase tracking-wider text-white/60">
              Este equipo es Elbio Fernández (posición en tabla principal)
            </span>
          </label>

          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-3 font-display font-bold text-xs uppercase tracking-wider text-white/50 border border-white/15 hover:border-white/30 transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 py-3 font-display font-black text-xs uppercase tracking-wider bg-[#F5C200] text-[#0D1B2E] hover:bg-[#F5C200]/90 transition-colors disabled:opacity-50">
              {saving ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Helpers ────────────────────────────────────────────────────────────────

const inputCls  = "w-full bg-white/5 border border-white/10 text-white font-display text-sm px-3 py-2.5 focus:outline-none focus:border-[#F5C200] transition-colors";
const selectCls = "w-full bg-[#0D1B2E] border border-white/10 text-white font-display text-sm px-3 py-2.5 focus:outline-none focus:border-[#F5C200] transition-colors";
const labelCls  = "font-display font-bold text-xs uppercase tracking-widest text-white/40 block mb-1.5";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className={labelCls}>{label}</p>
      {children}
    </div>
  );
}

function formatFecha(f: string) {
  const d = new Date(f + "T00:00:00");
  return d.toLocaleDateString("es-AR", { day: "numeric", month: "short" }).toUpperCase();
}

// ── Dashboard ──────────────────────────────────────────────────────────────

export default function Dashboard() {
  const params   = useParams();
  const router   = useRouter();
  const slug     = params.categoria as CatSlug;
  const catInfo  = CATEGORIES[slug];

  const [tab,         setTab]         = useState<Tab>("partidos");
  const [token,       setToken]       = useState<string | null>(null);
  const [partidos,    setPartidos]    = useState<Partido[]>([]);
  const [tabla,       setTabla]       = useState<TablaRow[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [partidoModal, setPartidoModal] = useState<{ open: boolean; edit?: Partido }>({ open: false });
  const [tablaModal,   setTablaModal]   = useState<{ open: boolean; edit?: TablaRow }>({ open: false });

  // Auth check
  useEffect(() => {
    if (!catInfo) { router.push("/encargado"); return; }
    const t = localStorage.getItem("encargado_token");
    const c = localStorage.getItem("encargado_category");
    if (!t || c !== slug) { router.push("/encargado"); return; }
    setToken(t);
  }, [slug, catInfo, router]);

  const headers = useCallback(
    () => ({ Authorization: `Bearer ${token}`, "Content-Type": "application/json" }),
    [token]
  );

  // Load data
  const loadPartidos = useCallback(async () => {
    if (!token) return;
    const res = await fetch("/api/encargado/partidos", { headers: headers() });
    if (res.ok) setPartidos(await res.json() as Partido[]);
  }, [token, headers]);

  const loadTabla = useCallback(async () => {
    if (!token) return;
    const res = await fetch("/api/encargado/tabla", { headers: headers() });
    if (res.ok) setTabla(await res.json() as TablaRow[]);
  }, [token, headers]);

  useEffect(() => {
    if (!token) return;
    Promise.all([loadPartidos(), loadTabla()]).finally(() => setLoading(false));
  }, [token, loadPartidos, loadTabla]);

  // Partido operations
  async function savePartido(data: PartidoForm & { id?: string }) {
    const payload = {
      ...data,
      hora: data.hora || null,
      sede: data.sede || null,
      competencia: data.competencia || null,
      resultado_local:    data.estado === "finalizado" ? parseInt(data.resultado_local as string) || 0 : null,
      resultado_visitante: data.estado === "finalizado" ? parseInt(data.resultado_visitante as string) || 0 : null,
    };
    if (data.id) {
      await fetch("/api/encargado/partidos", {
        method: "PATCH", headers: headers(),
        body: JSON.stringify(payload),
      });
    } else {
      const { id: _id, ...rest } = payload;
      void _id;
      await fetch("/api/encargado/partidos", {
        method: "POST", headers: headers(),
        body: JSON.stringify(rest),
      });
    }
    setPartidoModal({ open: false });
    await loadPartidos();
  }

  async function deletePartido(id: string) {
    if (!confirm("¿Eliminar este partido?")) return;
    await fetch("/api/encargado/partidos", {
      method: "DELETE", headers: headers(),
      body: JSON.stringify({ id }),
    });
    await loadPartidos();
  }

  // Tabla operations
  const competenciaActual = tabla[0]?.competencia ?? "";

  async function saveTablaRow(data: TablaForm & { id?: string; competencia: string }) {
    if (data.id) {
      await fetch("/api/encargado/tabla", {
        method: "PATCH", headers: headers(),
        body: JSON.stringify(data),
      });
    } else {
      const { id: _id, ...rest } = data;
      void _id;
      await fetch("/api/encargado/tabla", {
        method: "POST", headers: headers(),
        body: JSON.stringify(rest),
      });
    }
    setTablaModal({ open: false });
    await loadTabla();
  }

  async function deleteTablaRow(id: string) {
    if (!confirm("¿Eliminar este equipo de la tabla?")) return;
    await fetch("/api/encargado/tabla", {
      method: "DELETE", headers: headers(),
      body: JSON.stringify({ id }),
    });
    await loadTabla();
  }

  function logout() {
    localStorage.removeItem("encargado_token");
    localStorage.removeItem("encargado_category");
    router.push("/encargado");
  }

  if (!token || loading) {
    return (
      <div className="min-h-screen bg-[#0D1B2E] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#F5C200] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0D1B2E]">
      {/* Header */}
      <header className="bg-[#0A1525] border-b border-white/8">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <p className="font-display font-bold text-[#F5C200] text-xs uppercase tracking-[0.18em]">
              Portal Encargados
            </p>
            <h1 className="font-display font-black text-white text-lg uppercase tracking-wide leading-none mt-0.5">
              {catInfo.name}
            </h1>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-1.5 font-display font-bold text-xs uppercase tracking-wider text-white/40 hover:text-white/70 transition-colors"
          >
            <LogOut size={13} /> Salir
          </button>
        </div>
      </header>

      {/* Tabs */}
      <div className="max-w-3xl mx-auto px-4">
        <div className="flex border-b border-white/10 mt-0">
          {(["partidos", "tabla"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`font-display font-black text-xs uppercase tracking-widest px-6 py-4 border-b-2 -mb-px transition-all duration-200 ${
                tab === t
                  ? "border-[#F5C200] text-[#F5C200]"
                  : "border-transparent text-white/30 hover:text-white/60"
              }`}
            >
              {t === "partidos" ? "Partidos" : "Tabla"}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 py-6">

        {/* ── PARTIDOS TAB ── */}
        {tab === "partidos" && (
          <div>
            <div className="flex items-center justify-between mb-5">
              <p className="font-display font-bold text-white/40 text-xs uppercase tracking-widest">
                {partidos.length} partido{partidos.length !== 1 ? "s" : ""}
              </p>
              <button
                onClick={() => setPartidoModal({ open: true })}
                className="flex items-center gap-1.5 bg-[#F5C200] text-[#0D1B2E] font-display font-black text-xs uppercase tracking-wider px-4 py-2.5 hover:bg-[#F5C200]/90 transition-colors"
              >
                <Plus size={13} /> Agregar partido
              </button>
            </div>

            {partidos.length === 0 ? (
              <div className="text-center py-16">
                <p className="font-display font-bold text-white/20 text-sm uppercase tracking-widest">
                  No hay partidos cargados
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {partidos.map((p) => {
                  const esLocal = p.es_local;
                  const golesEU    = esLocal ? p.resultado_local    : p.resultado_visitante;
                  const golesRival = esLocal ? p.resultado_visitante : p.resultado_local;
                  return (
                    <div
                      key={p.id}
                      className="bg-white/3 border border-white/8 hover:border-white/15 transition-colors flex items-center gap-3 px-4 py-3"
                    >
                      {/* Date */}
                      <div className="flex-shrink-0 bg-[#F5C200] text-[#0D1B2E] text-center px-2.5 py-1.5 min-w-[44px]">
                        <div className="font-display font-black text-base leading-none">
                          {new Date(p.fecha + "T00:00:00").getDate()}
                        </div>
                        <div className="font-display font-semibold text-[10px] uppercase tracking-wider opacity-60">
                          {new Date(p.fecha + "T00:00:00").toLocaleDateString("es-AR", { month: "short" })}
                        </div>
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="font-display font-black text-white text-sm uppercase truncate">
                            {p.rival}
                          </span>
                          {p.estado === "finalizado" && golesEU !== null && golesRival !== null && (
                            <span className="font-display font-black text-[#F5C200] text-sm">
                              {golesEU} – {golesRival}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <EstadoBadge estado={p.estado} />
                          <span className="font-display font-bold text-xs uppercase tracking-wider text-white/30">
                            {p.es_local ? "Local" : "Visitante"}
                          </span>
                          {p.competencia && (
                            <span className="font-display font-bold text-xs uppercase tracking-wider text-white/25">
                              {p.competencia}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                          onClick={() => setPartidoModal({ open: true, edit: p })}
                          className="w-8 h-8 flex items-center justify-center text-white/30 hover:text-[#F5C200] transition-colors"
                        >
                          <Pencil size={13} />
                        </button>
                        <button
                          onClick={() => deletePartido(p.id)}
                          className="w-8 h-8 flex items-center justify-center text-white/30 hover:text-red-400 transition-colors"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── TABLA TAB ── */}
        {tab === "tabla" && (
          <div>
            <div className="flex items-center justify-between mb-5">
              <div>
                <p className="font-display font-bold text-white/40 text-xs uppercase tracking-widest">
                  {tabla.length} equipo{tabla.length !== 1 ? "s" : ""}
                </p>
                {competenciaActual && (
                  <p className="font-display font-semibold text-[#F5C200]/60 text-xs uppercase tracking-widest mt-0.5">
                    {competenciaActual}
                  </p>
                )}
              </div>
              <button
                onClick={() => setTablaModal({ open: true })}
                className="flex items-center gap-1.5 bg-[#F5C200] text-[#0D1B2E] font-display font-black text-xs uppercase tracking-wider px-4 py-2.5 hover:bg-[#F5C200]/90 transition-colors"
              >
                <Plus size={13} /> Agregar equipo
              </button>
            </div>

            {tabla.length === 0 ? (
              <div className="text-center py-16">
                <p className="font-display font-bold text-white/20 text-sm uppercase tracking-widest">
                  No hay tabla cargada
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-white/10">
                      {["#","Equipo","PJ","G","E","P","GF","GC","PTS",""].map((h) => (
                        <th key={h} className="font-display font-bold text-xs uppercase tracking-widest text-white/30 pb-2 pr-3 whitespace-nowrap">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {tabla.map((row) => (
                      <tr key={row.id} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                        <td className="py-2.5 pr-3 font-display font-black text-[#F5C200]">{row.posicion}</td>
                        <td className="py-2.5 pr-3 font-display font-bold text-white uppercase whitespace-nowrap">
                          <span className="flex items-center gap-1.5">
                            {row.equipo}
                            {row.is_local_team && <Star size={10} className="text-[#F5C200] fill-[#F5C200]" />}
                          </span>
                        </td>
                        {[row.pj,row.pg,row.pe,row.pp,row.gf,row.gc].map((v, i) => (
                          <td key={i} className="py-2.5 pr-3 font-display font-semibold text-white/50">{v}</td>
                        ))}
                        <td className="py-2.5 pr-3 font-display font-black text-white">{row.pts}</td>
                        <td className="py-2.5">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => setTablaModal({ open: true, edit: row })}
                              className="w-7 h-7 flex items-center justify-center text-white/25 hover:text-[#F5C200] transition-colors"
                            >
                              <Pencil size={11} />
                            </button>
                            <button
                              onClick={() => deleteTablaRow(row.id)}
                              className="w-7 h-7 flex items-center justify-center text-white/25 hover:text-red-400 transition-colors"
                            >
                              <Trash2 size={11} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Modals ── */}
      {partidoModal.open && (
        <PartidoModal
          initial={
            partidoModal.edit
              ? {
                  id: partidoModal.edit.id,
                  rival: partidoModal.edit.rival,
                  fecha: partidoModal.edit.fecha,
                  hora: partidoModal.edit.hora ?? "",
                  sede: partidoModal.edit.sede ?? "",
                  es_local: partidoModal.edit.es_local,
                  estado: partidoModal.edit.estado,
                  resultado_local: partidoModal.edit.resultado_local?.toString() ?? "",
                  resultado_visitante: partidoModal.edit.resultado_visitante?.toString() ?? "",
                  competencia: partidoModal.edit.competencia ?? "",
                }
              : undefined
          }
          onSave={savePartido}
          onClose={() => setPartidoModal({ open: false })}
        />
      )}

      {tablaModal.open && (
        <TablaModal
          initial={
            tablaModal.edit
              ? { ...tablaModal.edit, competencia: tablaModal.edit.competencia ?? undefined }
              : undefined
          }
          competenciaDefault={competenciaActual}
          onSave={saveTablaRow}
          onClose={() => setTablaModal({ open: false })}
        />
      )}
    </div>
  );
}
