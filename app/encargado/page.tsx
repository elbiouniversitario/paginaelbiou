"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Eye, EyeOff, Lock } from "lucide-react";

const CATEGORIAS = [
  { slug: "mayor",     label: "Mayor"      },
  { slug: "reserva",   label: "Reserva"    },
  { slug: "presenior", label: "Pre Senior" },
  { slug: "sub20",     label: "Sub 20"     },
  { slug: "sub18",     label: "Sub 18"     },
  { slug: "femenino",  label: "Femenino"   },
];

export default function EncargadoLogin() {
  const router = useRouter();
  const [category,  setCategory]  = useState("mayor");
  const [password,  setPassword]  = useState("");
  const [showPw,    setShowPw]    = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/encargado/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, password }),
      });
      if (!res.ok) {
        const d = await res.json() as { error: string };
        setError(d.error ?? "Contraseña incorrecta");
        return;
      }
      const { token } = await res.json() as { token: string };
      localStorage.setItem("encargado_token", token);
      localStorage.setItem("encargado_category", category);
      router.push(`/encargado/${category}`);
    } catch {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0D1B2E] flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <Image src="/logo.ico" alt="EFU" width={56} height={56} className="object-contain" unoptimized />
          <p className="font-display font-black text-white text-xs uppercase tracking-[0.22em] mt-3">
            Portal Encargados
          </p>
          <div className="w-8 h-px bg-[#F5C200] mt-2" />
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Category */}
          <div>
            <label className="font-display font-bold text-xs uppercase tracking-widest text-white/40 block mb-1.5">
              Categoría
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-white/5 border border-white/10 text-white font-display font-bold text-sm px-4 py-3 focus:outline-none focus:border-[#F5C200] transition-colors appearance-none"
            >
              {CATEGORIAS.map((c) => (
                <option key={c.slug} value={c.slug} className="bg-[#0D1B2E]">
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          {/* Password */}
          <div>
            <label className="font-display font-bold text-xs uppercase tracking-widest text-white/40 block mb-1.5">
              Contraseña
            </label>
            <div className="relative">
              <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25" />
              <input
                type={showPw ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••"
                autoComplete="current-password"
                name="password"
                className="w-full bg-white/5 border border-white/10 text-white font-display font-bold text-sm pl-9 pr-10 py-3 focus:outline-none focus:border-[#F5C200] transition-colors placeholder:text-white/20"
                required
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
              >
                {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          {error && (
            <p className="font-display font-bold text-xs text-red-400 uppercase tracking-wider">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 bg-[#F5C200] text-[#0D1B2E] font-display font-black text-xs uppercase tracking-[0.18em] py-3.5 hover:bg-[#F5C200]/90 transition-colors disabled:opacity-50"
          >
            {loading ? "Verificando..." : "Ingresar"}
          </button>
        </form>

        <a
          href="/"
          className="block text-center font-display font-bold text-[10px] uppercase tracking-widest text-white/20 hover:text-white/40 transition-colors mt-8"
        >
          ← Volver al inicio
        </a>
      </div>
    </div>
  );
}
