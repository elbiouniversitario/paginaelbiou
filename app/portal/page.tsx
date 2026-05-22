"use client";

import { useState } from "react";
import Image from "next/image";
import { Lock, User, Mail, Hash, ChevronDown } from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { CategoriaEquipo, Posicion } from "@/lib/types";

type Tab = "login" | "register";
type Step = "form" | "pending" | "approved";

const categorias: CategoriaEquipo[] = ["Mayor", "Reserva", "Pre-Senior", "Sub 20", "Sub 18", "Femenino"];
const posiciones: Posicion[] = ["Arquero", "Defensor", "Mediocampista", "Delantero"];

const CUOTAS_URL = process.env.NEXT_PUBLIC_CUOTAS_URL ?? "#";

export default function PortalPage() {
  const [tab, setTab] = useState<Tab>("login");
  const [step, setStep] = useState<Step>("form");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPass, setLoginPass]   = useState("");

  const [regNombre,    setRegNombre]    = useState("");
  const [regEmail,     setRegEmail]     = useState("");
  const [regPass,      setRegPass]      = useState("");
  const [regCategoria, setRegCategoria] = useState<CategoriaEquipo>("Mayor");
  const [regPosicion,  setRegPosicion]  = useState<Posicion>("Delantero");
  const [regNumero,    setRegNumero]    = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase) return setError("Servicio no disponible en este momento.");
    setLoading(true);
    setError("");

    const { data, error: authErr } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password: loginPass,
    });

    if (authErr || !data.user) {
      setLoading(false);
      setError("Email o contraseña incorrectos.");
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("habilitado")
      .eq("id", data.user.id)
      .single() as { data: { habilitado: boolean } | null };

    setLoading(false);

    if (profile?.habilitado) {
      window.location.href = CUOTAS_URL;
    } else {
      setStep("pending");
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase) return setError("Servicio no disponible en este momento.");
    setLoading(true);
    setError("");

    const { data, error: authErr } = await supabase.auth.signUp({
      email: regEmail,
      password: regPass,
      options: {
        data: { nombre: regNombre },
      },
    });

    if (authErr || !data.user) {
      setLoading(false);
      setError(authErr?.message ?? "Error al crear la cuenta.");
      return;
    }

    await supabase.from("profiles").update({
      nombre:    regNombre,
      categoria: regCategoria,
      posicion:  regPosicion,
      numero:    regNumero ? parseInt(regNumero) : null,
    } as never).eq("id", data.user.id);

    setLoading(false);
    setStep("pending");
  }

  if (step === "pending") return <PendingScreen />;

  return (
    <div className="min-h-screen bg-[#060D16] flex flex-col items-center justify-center px-4 py-16">
      {/* Logo */}
      <a href="/" className="flex flex-col items-center gap-3 mb-10">
        <Image src="/logo.ico" alt="EFU" width={64} height={64} unoptimized className="object-contain" />
        <div className="text-center font-display leading-tight">
          <span className="block font-bold text-white/40 text-[10px] uppercase tracking-widest">Elbio Fernández</span>
          <span className="block font-black text-white text-sm uppercase tracking-tight">Fútbol Universitario</span>
        </div>
      </a>

      <div className="w-full max-w-sm">
        {/* Tabs */}
        <div className="flex border border-white/10 mb-6">
          {(["login", "register"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => { setTab(t); setError(""); }}
              className={`flex-1 font-display font-black text-[11px] uppercase tracking-widest py-3 transition-all duration-200 ${
                tab === t
                  ? "bg-[#F5C200] text-[#060D16]"
                  : "text-white/40 hover:text-white/70"
              }`}
            >
              {t === "login" ? "Iniciar Sesión" : "Crear Cuenta"}
            </button>
          ))}
        </div>

        {/* Login */}
        {tab === "login" && (
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <Field icon={<Mail size={14} />} type="email" placeholder="Email" value={loginEmail} onChange={setLoginEmail} />
            <Field icon={<Lock size={14} />} type="password" placeholder="Contraseña" value={loginPass} onChange={setLoginPass} />
            {error && <p className="font-body text-red-400 text-xs text-center">{error}</p>}
            <SubmitBtn loading={loading} label="Ingresar" />
          </form>
        )}

        {/* Register */}
        {tab === "register" && (
          <form onSubmit={handleRegister} className="flex flex-col gap-3.5">
            <Field icon={<User size={14} />} type="text" placeholder="Nombre completo" value={regNombre} onChange={setRegNombre} required />
            <Field icon={<Mail size={14} />} type="email" placeholder="Email" value={regEmail} onChange={setRegEmail} required />
            <Field icon={<Lock size={14} />} type="password" placeholder="Contraseña (mín. 6 caracteres)" value={regPass} onChange={setRegPass} required />

            <Select
              value={regCategoria}
              onChange={(v) => setRegCategoria(v as CategoriaEquipo)}
              options={categorias}
              label="Categoría"
            />
            <Select
              value={regPosicion}
              onChange={(v) => setRegPosicion(v as Posicion)}
              options={posiciones}
              label="Posición"
            />
            <Field icon={<Hash size={14} />} type="number" placeholder="Número de camiseta" value={regNumero} onChange={setRegNumero} />

            {error && <p className="font-body text-red-400 text-xs text-center">{error}</p>}
            <SubmitBtn loading={loading} label="Crear cuenta" />

            <p className="font-body text-white/30 text-[11px] text-center leading-relaxed mt-1">
              Tu cuenta quedará pendiente de aprobación por el administrador del club.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}

function Field({
  icon, type, placeholder, value, onChange, required,
}: {
  icon: React.ReactNode;
  type: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
}) {
  return (
    <div className="flex items-center gap-3 border border-white/10 bg-white/4 px-4 py-3 focus-within:border-[#F5C200]/50 transition-colors">
      <span className="text-[#F5C200]/60 flex-shrink-0">{icon}</span>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="bg-transparent font-body text-sm text-white placeholder:text-white/25 outline-none flex-1 min-w-0"
      />
    </div>
  );
}

function Select({
  value, onChange, options, label,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  label: string;
}) {
  return (
    <div className="relative flex items-center border border-white/10 bg-white/4 px-4 py-3 focus-within:border-[#F5C200]/50 transition-colors">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-transparent font-body text-sm text-white outline-none flex-1 appearance-none cursor-pointer"
      >
        {options.map((o) => (
          <option key={o} value={o} className="bg-[#0D1B2E] text-white">{o}</option>
        ))}
      </select>
      <ChevronDown size={13} className="text-white/30 pointer-events-none absolute right-4" />
    </div>
  );
}

function SubmitBtn({ loading, label }: { loading: boolean; label: string }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="w-full bg-[#F5C200] text-[#060D16] font-display font-black text-[12px] uppercase tracking-widest py-3.5 hover:bg-[#F5C200]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-1"
    >
      {loading ? "..." : label}
    </button>
  );
}

function PendingScreen() {
  return (
    <div className="min-h-screen bg-[#060D16] flex flex-col items-center justify-center px-4 text-center gap-6">
      <div className="w-14 h-14 rounded-full border-2 border-[#F5C200]/40 flex items-center justify-center">
        <Lock size={22} className="text-[#F5C200]" />
      </div>
      <div>
        <h2 className="font-display font-black text-white text-xl uppercase tracking-wide mb-2">
          Cuenta pendiente
        </h2>
        <p className="font-body text-white/50 text-sm leading-relaxed max-w-xs">
          Tu cuenta fue creada correctamente. El administrador del club debe habilitarla antes de que puedas ingresar.
        </p>
      </div>
      <a href="/" className="font-display font-bold text-[11px] uppercase tracking-widest text-[#F5C200]/60 hover:text-[#F5C200] transition-colors">
        ← Volver al inicio
      </a>
    </div>
  );
}
