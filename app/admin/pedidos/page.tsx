"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

async function getToken() {
  const { data } = await supabase!.auth.getSession();
  return data.session?.access_token ?? "";
}

interface Pedido {
  id: string;
  nombre_cliente: string | null;
  email: string;
  telefono: string | null;
  total: number;
  estado: string;
  dlocal_payment_id: string | null;
  created_at: string;
}

interface PencaStats {
  total: number;
  categorias: { categoria: string; cantidad: number }[];
}

function SendPencaBtn({ pid, nombre }: { pid: string; nombre: string }) {
  const [state, setState] = useState<"idle" | "loading" | "ok" | "err">("idle");
  async function handle() {
    if (!confirm(`¿Enviar código penca a ${nombre}?`)) return;
    setState("loading");
    const token = await getToken();
    const res  = await fetch(`/api/admin/send-penca?pid=${encodeURIComponent(pid)}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json() as { ok?: boolean; error?: string };
    setState(data.ok ? "ok" : "err");
    setTimeout(() => setState("idle"), 3000);
  }
  return (
    <button
      onClick={handle}
      disabled={state === "loading"}
      className={`font-display font-black text-[9px] uppercase tracking-widest px-2 py-1 border transition-all ${
        state === "ok"  ? "border-emerald-400/40 text-emerald-400 bg-emerald-400/10" :
        state === "err" ? "border-red-400/40 text-red-400 bg-red-400/10" :
        "border-[#F5C200]/30 text-[#F5C200]/70 hover:text-[#F5C200] hover:border-[#F5C200]/60"
      }`}
    >
      {state === "loading" ? "..." : state === "ok" ? "✓ Enviado" : state === "err" ? "✗ Error" : "🎯 Penca"}
    </button>
  );
}

const estadoColor: Record<string, string> = {
  pendiente:   "text-amber-400 bg-amber-400/10 border-amber-400/20",
  pagado:      "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  cancelado:   "text-red-400 bg-red-400/10 border-red-400/20",
  reembolsado: "text-sky-400 bg-sky-400/10 border-sky-400/20",
};

const COLORES: Record<string, string> = {
  MAYOR:     "#F5C200",
  RESERVA:   "#60A5FA",
  SUB20:     "#34D399",
  PRESENIOR: "#F97316",
  FEMENINO:  "#F472B6",
  SUB18:     "#A78BFA",
};

export default function PedidosAdmin() {
  const [pedidos,     setPedidos]     = useState<Pedido[]>([]);
  const [pencaStats,  setPencaStats]  = useState<PencaStats | null>(null);
  const [loading,     setLoading]     = useState(true);
  const [filtro,      setFiltro]      = useState<string>("todos");

  useEffect(() => {
    setLoading(true);
    getToken().then((token) => Promise.all([
      fetch("/api/admin/pedidos", { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
      fetch("/api/admin/penca-stats", { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
    ])).then(([pedidosData, statsData]) => {
      setPedidos(Array.isArray(pedidosData) ? pedidosData as Pedido[] : []);
      setPencaStats(statsData as PencaStats);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const filtrados = filtro === "todos" ? pedidos : pedidos.filter((p) => p.estado === filtro);
  const totalPagado = pedidos.filter((p) => p.estado === "pagado").reduce((s, p) => s + p.total, 0);

  return (
    <div>
      <div className="mb-8">
        <p className="font-display font-bold text-[#F5C200] text-[10px] uppercase tracking-[0.25em] mb-1">Admin</p>
        <h1 className="font-display font-black text-white text-2xl uppercase tracking-wide">Pedidos</h1>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 gap-3 mb-8">
        <div className="border border-white/8 bg-white/2 px-4 py-3">
          <p className="font-display font-bold text-[9px] uppercase tracking-widest text-white/40 mb-1">Recaudado</p>
          <p className="font-display font-black text-[#F5C200] text-xl">${totalPagado.toLocaleString("es-UY")}</p>
        </div>
        <div className="border border-white/8 bg-white/2 px-4 py-3">
          <p className="font-display font-bold text-[9px] uppercase tracking-widest text-white/40 mb-1">Pedidos pagados</p>
          <p className="font-display font-black text-white text-xl">
            {pedidos.filter((p) => p.estado === "pagado").length}
          </p>
        </div>
      </div>

      {/* Penca stats */}
      {pencaStats && pencaStats.total > 0 && (
        <div className="border border-[#F5C200]/20 bg-[#F5C200]/5 px-5 py-4 mb-8">
          <div className="flex items-center justify-between mb-3">
            <p className="font-display font-black text-[10px] uppercase tracking-widest text-[#F5C200]">
              🎯 Penca Elbio Ovación
            </p>
            <span className="font-display font-black text-white text-sm">
              {pencaStats.total} vendida{pencaStats.total !== 1 ? "s" : ""}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {pencaStats.categorias.map(({ categoria, cantidad }) => (
              <div
                key={categoria}
                className="flex items-center gap-1.5 px-3 py-1.5 border"
                style={{ borderColor: `${COLORES[categoria] ?? "#fff"}40`, background: `${COLORES[categoria] ?? "#fff"}10` }}
              >
                <span
                  className="font-display font-black text-[10px] uppercase tracking-widest"
                  style={{ color: COLORES[categoria] ?? "#fff" }}
                >
                  {categoria}
                </span>
                <span className="font-display font-black text-white text-sm">{cantidad}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-1 mb-6 flex-wrap">
        {["todos", "pendiente", "pagado", "cancelado"].map((f) => (
          <button
            key={f}
            onClick={() => setFiltro(f)}
            className={`font-display font-black text-[10px] uppercase tracking-wider px-3 py-1.5 border transition-all ${
              filtro === f
                ? "bg-[#F5C200] text-[#060D16] border-[#F5C200]"
                : "border-white/10 text-white/35 hover:text-white/60"
            }`}
          >
            {f}
          </button>
        ))}
        <span className="ml-auto font-body text-white/25 text-xs">{filtrados.length} pedido{filtrados.length !== 1 ? "s" : ""}</span>
      </div>

      {loading
        ? <p className="font-body text-white/30 text-sm">Cargando...</p>
        : filtrados.length === 0
          ? <p className="font-body text-white/30 text-sm">No hay pedidos.</p>
          : (
            <div className="flex flex-col gap-2">
              {filtrados.map((p) => (
                <div key={p.id} className="border border-white/8 bg-white/2 px-4 py-3 flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      <p className="font-display font-black text-white text-sm uppercase tracking-wide truncate">
                        {p.nombre_cliente ?? p.email}
                      </p>
                      <span className={`font-display font-black text-[9px] uppercase tracking-widest px-2 py-0.5 border ${estadoColor[p.estado] ?? "text-white/40 bg-white/5 border-white/10"}`}>
                        {p.estado}
                      </span>
                      {p.estado === "pendiente" && p.dlocal_payment_id && (
                        <SendPencaBtn pid={p.dlocal_payment_id} nombre={p.nombre_cliente ?? p.email} />
                      )}
                    </div>
                    <p className="font-body text-white/35 text-xs">
                      {new Date(p.created_at).toLocaleDateString("es-UY", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                      {p.telefono && ` · ${p.telefono}`}
                    </p>
                  </div>
                  <p className="font-display font-black text-[#F5C200] text-lg flex-shrink-0">
                    ${p.total.toLocaleString("es-UY")}
                  </p>
                </div>
              ))}
            </div>
          )
      }
    </div>
  );
}
