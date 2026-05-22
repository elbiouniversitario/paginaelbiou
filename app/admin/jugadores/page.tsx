"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Profile } from "@/lib/types";
import { CheckCircle, XCircle, Clock } from "lucide-react";

async function getToken() {
  const { data } = await supabase!.auth.getSession();
  return data.session?.access_token ?? "";
}

export default function JugadoresAdmin() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading,  setLoading]  = useState(true);

  async function load() {
    if (!supabase) return;
    setLoading(true);
    const token = await getToken();
    const res = await fetch("/api/admin/profiles", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json() as Profile[];
    setProfiles(Array.isArray(data) ? data : []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function toggleHabilitado(id: string, current: boolean) {
    if (!supabase) return;
    const token = await getToken();
    await fetch("/api/admin/profiles", {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ id, habilitado: !current }),
    });
    load();
  }

  const pendientes   = profiles.filter((p) => !p.habilitado && !p.es_admin);
  const habilitados  = profiles.filter((p) =>  p.habilitado && !p.es_admin);

  return (
    <div>
      <div className="mb-8">
        <p className="font-display font-bold text-[#F5C200] text-[10px] uppercase tracking-[0.25em] mb-1">Admin</p>
        <h1 className="font-display font-black text-white text-2xl uppercase tracking-wide">Jugadores</h1>
      </div>

      {loading
        ? <p className="font-body text-white/30 text-sm">Cargando...</p>
        : (
          <div className="flex flex-col gap-8">
            {/* Pendientes */}
            {pendientes.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <Clock size={14} className="text-amber-400" />
                  <h2 className="font-display font-black text-white text-sm uppercase tracking-widest">
                    Pendientes de aprobación ({pendientes.length})
                  </h2>
                </div>
                <div className="flex flex-col gap-2">
                  {pendientes.map((p) => (
                    <ProfileRow key={p.id} profile={p} onToggle={toggleHabilitado} />
                  ))}
                </div>
              </section>
            )}

            {/* Habilitados */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle size={14} className="text-emerald-400" />
                <h2 className="font-display font-black text-white text-sm uppercase tracking-widest">
                  Habilitados ({habilitados.length})
                </h2>
              </div>
              {habilitados.length === 0
                ? <p className="font-body text-white/30 text-sm">Ningún jugador habilitado aún.</p>
                : (
                  <div className="flex flex-col gap-2">
                    {habilitados.map((p) => (
                      <ProfileRow key={p.id} profile={p} onToggle={toggleHabilitado} />
                    ))}
                  </div>
                )
              }
            </section>
          </div>
        )
      }
    </div>
  );
}

function ProfileRow({ profile, onToggle }: { profile: Profile; onToggle: (id: string, current: boolean) => void }) {
  return (
    <div className={`flex items-center gap-4 border px-4 py-3 bg-white/2 transition-all ${
      profile.habilitado ? "border-white/8" : "border-amber-400/20 bg-amber-400/3"
    }`}>
      <div className="w-8 h-8 rounded-full bg-white/8 flex items-center justify-center flex-shrink-0">
        <span className="font-display font-black text-white/60 text-[11px]">
          {(profile.nombre ?? "?")[0].toUpperCase()}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-display font-black text-white text-sm uppercase tracking-wide truncate">
          {profile.nombre ?? "Sin nombre"}
        </p>
        <p className="font-body text-white/35 text-xs">
          {[profile.categoria, profile.posicion, profile.numero ? `#${profile.numero}` : null]
            .filter(Boolean).join(" · ")}
        </p>
      </div>
      <button
        onClick={() => onToggle(profile.id, profile.habilitado)}
        className={`flex items-center gap-1.5 font-display font-black text-[10px] uppercase tracking-wider px-3 py-1.5 transition-all ${
          profile.habilitado
            ? "border border-red-400/30 text-red-400/70 hover:bg-red-400/10"
            : "bg-emerald-500 text-white hover:bg-emerald-400"
        }`}
      >
        {profile.habilitado
          ? <><XCircle size={12} /> Deshabilitar</>
          : <><CheckCircle size={12} /> Habilitar</>
        }
      </button>
    </div>
  );
}
