"use client";

import { useState, useEffect } from "react";
import { Lock } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function NuevaContrasenaPage() {
  const [pass,     setPass]     = useState("");
  const [confirm,  setConfirm]  = useState("");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");
  const [done,     setDone]     = useState(false);
  const [ready,    setReady]    = useState(false);

  useEffect(() => {
    // Supabase redirige con el token en el hash — esto lo procesa automáticamente
    supabase?.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setReady(true);
    });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (pass !== confirm) return setError("Las contraseñas no coinciden.");
    if (pass.length < 6)  return setError("Mínimo 6 caracteres.");
    if (!supabase) return;
    setLoading(true);
    setError("");
    const { error: updateErr } = await supabase.auth.updateUser({ password: pass });
    setLoading(false);
    if (updateErr) return setError(updateErr.message);
    setDone(true);
  }

  if (done) {
    return (
      <div className="min-h-screen bg-[#060D16] flex flex-col items-center justify-center px-4 text-center gap-6">
        <p className="font-display font-black text-white text-xl uppercase tracking-wide">Contraseña actualizada</p>
        <a href="/portal" className="font-display font-bold text-[11px] uppercase tracking-widest text-[#F5C200]/60 hover:text-[#F5C200] transition-colors">
          Ir al login →
        </a>
      </div>
    );
  }

  if (!ready) {
    return (
      <div className="min-h-screen bg-[#060D16] flex items-center justify-center">
        <p className="font-display font-bold text-white/30 text-sm uppercase tracking-widest">Verificando link...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#060D16] flex flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm flex flex-col gap-4">
        <h1 className="font-display font-black text-white text-lg uppercase tracking-wide text-center mb-2">
          Nueva contraseña
        </h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex items-center gap-3 border border-white/10 bg-white/4 px-4 py-3 focus-within:border-[#F5C200]/50 transition-colors">
            <Lock size={14} className="text-[#F5C200]/60 flex-shrink-0" />
            <input
              type="password"
              placeholder="Nueva contraseña"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              required
              className="bg-transparent font-body text-sm text-white placeholder:text-white/25 outline-none flex-1 min-w-0"
            />
          </div>
          <div className="flex items-center gap-3 border border-white/10 bg-white/4 px-4 py-3 focus-within:border-[#F5C200]/50 transition-colors">
            <Lock size={14} className="text-[#F5C200]/60 flex-shrink-0" />
            <input
              type="password"
              placeholder="Confirmar contraseña"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              className="bg-transparent font-body text-sm text-white placeholder:text-white/25 outline-none flex-1 min-w-0"
            />
          </div>
          {error && <p className="font-body text-red-400 text-xs text-center">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#F5C200] text-[#060D16] font-display font-black text-[12px] uppercase tracking-widest py-3.5 hover:bg-[#F5C200]/90 transition-colors disabled:opacity-50"
          >
            {loading ? "..." : "Guardar contraseña"}
          </button>
        </form>
      </div>
    </div>
  );
}
