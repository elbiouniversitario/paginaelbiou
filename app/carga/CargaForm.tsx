"use client";

import { useState } from "react";
import type { CategoriaEquipo, Partido } from "@/lib/types";

interface Props {
  categoria: CategoriaEquipo;
  token: string;
  ultimoPartido: Partido | null;
}

export default function CargaForm({ categoria, token, ultimoPartido }: Props) {
  return (
    <div className="min-h-screen bg-[#060D16] px-4 py-12">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <p className="font-display font-bold text-[#F5C200] text-[10px] uppercase tracking-[0.3em] mb-1">
            Carga de partidos
          </p>
          <h1 className="font-display font-black text-white text-3xl uppercase tracking-wide">
            {categoria}
          </h1>
        </div>

        <div className="flex flex-col gap-8">
          <ProximoPartidoForm categoria={categoria} token={token} />
          {ultimoPartido && (
            <ResultadoForm partido={ultimoPartido} token={token} />
          )}
        </div>
      </div>
    </div>
  );
}

function ProximoPartidoForm({ categoria, token }: { categoria: CategoriaEquipo; token: string }) {
  const [rival,       setRival]       = useState("");
  const [fecha,       setFecha]       = useState("");
  const [hora,        setHora]        = useState("");
  const [sede,        setSede]        = useState("");
  const [esLocal,     setEsLocal]     = useState(true);
  const [competencia, setCompetencia] = useState("Liga Regional");
  const [loading,     setLoading]     = useState(false);
  const [ok,          setOk]          = useState(false);
  const [err,         setErr]         = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErr("");

    const res = await fetch("/api/partidos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, rival, fecha, hora, sede, es_local: esLocal, competencia, categoria }),
    });

    setLoading(false);

    if (res.ok) {
      setOk(true);
      setRival(""); setFecha(""); setHora(""); setSede("");
    } else {
      const body = await res.json().catch(() => ({}));
      setErr(body.error ?? "Error al guardar.");
    }
  }

  return (
    <Section title="Próximo partido" subtitle="Cargá el siguiente partido del equipo">
      {ok && (
        <div className="bg-green-500/10 border border-green-500/30 px-4 py-3 mb-4">
          <p className="font-body text-green-400 text-sm">Partido guardado correctamente.</p>
        </div>
      )}
      <form onSubmit={submit} className="flex flex-col gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <CargaField label="Rival" value={rival} onChange={setRival} required placeholder="Ej: Atlético Central" />
          <CargaField label="Fecha" type="date" value={fecha} onChange={setFecha} required />
          <CargaField label="Hora" type="time" value={hora} onChange={setHora} />
          <CargaField label="Sede / Estadio" value={sede} onChange={setSede} placeholder="Ej: Estadio Municipal" />
        </div>
        <CargaField label="Competencia" value={competencia} onChange={setCompetencia} placeholder="Liga Regional" />
        <div className="flex items-center gap-4">
          <span className="font-display font-bold text-white/50 text-[11px] uppercase tracking-wider">¿Local o visitante?</span>
          <div className="flex">
            {[true, false].map((v) => (
              <button
                key={String(v)}
                type="button"
                onClick={() => setEsLocal(v)}
                className={`px-5 py-2 font-display font-black text-[11px] uppercase tracking-wider transition-all ${
                  esLocal === v
                    ? "bg-[#F5C200] text-[#060D16]"
                    : "border border-white/15 text-white/40 hover:text-white/70"
                }`}
              >
                {v ? "Local" : "Visitante"}
              </button>
            ))}
          </div>
        </div>
        {err && <p className="font-body text-red-400 text-sm">{err}</p>}
        <button
          type="submit"
          disabled={loading}
          className="bg-[#F5C200] text-[#060D16] font-display font-black text-[12px] uppercase tracking-widest py-3 hover:bg-[#F5C200]/90 transition-colors disabled:opacity-50 mt-2 self-start px-8"
        >
          {loading ? "Guardando..." : "Guardar partido"}
        </button>
      </form>
    </Section>
  );
}

function ResultadoForm({ partido, token }: { partido: Partido; token: string }) {
  const [resLocal,     setResLocal]     = useState("");
  const [resVisitante, setResVisitante] = useState("");
  const [loading,      setLoading]      = useState(false);
  const [ok,           setOk]           = useState(false);
  const [err,          setErr]          = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErr("");

    const res = await fetch("/api/partidos", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token,
        id: partido.id,
        resultado_local:     parseInt(resLocal),
        resultado_visitante: parseInt(resVisitante),
        estado: "finalizado",
      }),
    });

    setLoading(false);
    if (res.ok) { setOk(true); }
    else {
      const body = await res.json().catch(() => ({}));
      setErr(body.error ?? "Error al guardar.");
    }
  }

  const euLabel     = partido.es_local ? "ELBIO" : partido.rival.split(" ")[0].toUpperCase();
  const rivalLabel  = partido.es_local ? partido.rival.split(" ")[0].toUpperCase() : "ELBIO";

  return (
    <Section title="Resultado del último partido" subtitle={`${partido.rival} — ${new Date(partido.fecha + "T00:00:00").toLocaleDateString("es-UY", { weekday: "short", day: "numeric", month: "short" }).toUpperCase()}`}>
      {ok && (
        <div className="bg-green-500/10 border border-green-500/30 px-4 py-3 mb-4">
          <p className="font-body text-green-400 text-sm">Resultado guardado.</p>
        </div>
      )}
      <form onSubmit={submit} className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <label className="block font-display font-bold text-white/40 text-[10px] uppercase tracking-widest mb-2">{euLabel}</label>
            <input
              type="number"
              min={0}
              max={99}
              value={resLocal}
              onChange={(e) => setResLocal(e.target.value)}
              required
              className="w-full bg-white/4 border border-white/10 text-white font-display font-black text-3xl text-center py-3 outline-none focus:border-[#F5C200]/40 transition-colors appearance-none"
            />
          </div>
          <span className="font-display font-black text-white/20 text-2xl pt-5">–</span>
          <div className="flex-1">
            <label className="block font-display font-bold text-white/40 text-[10px] uppercase tracking-widest mb-2">{rivalLabel}</label>
            <input
              type="number"
              min={0}
              max={99}
              value={resVisitante}
              onChange={(e) => setResVisitante(e.target.value)}
              required
              className="w-full bg-white/4 border border-white/10 text-white font-display font-black text-3xl text-center py-3 outline-none focus:border-[#F5C200]/40 transition-colors appearance-none"
            />
          </div>
        </div>
        {err && <p className="font-body text-red-400 text-sm">{err}</p>}
        <button
          type="submit"
          disabled={loading}
          className="bg-white/8 border border-white/10 text-white font-display font-black text-[12px] uppercase tracking-widest py-3 hover:bg-white/12 transition-colors disabled:opacity-50 mt-1 self-start px-8"
        >
          {loading ? "Guardando..." : "Confirmar resultado"}
        </button>
      </form>
    </Section>
  );
}

function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="border border-white/8 bg-white/2 p-6 lg:p-8">
      <div className="mb-6">
        <h2 className="font-display font-black text-white text-lg uppercase tracking-wide leading-none mb-1">{title}</h2>
        {subtitle && <p className="font-body text-white/35 text-sm">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

function CargaField({
  label, value, onChange, type = "text", required, placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block font-display font-bold text-white/40 text-[10px] uppercase tracking-widest mb-2">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        placeholder={placeholder}
        className="w-full bg-white/4 border border-white/10 text-white font-body text-sm px-4 py-2.5 outline-none focus:border-[#F5C200]/40 transition-colors placeholder:text-white/20"
      />
    </div>
  );
}
