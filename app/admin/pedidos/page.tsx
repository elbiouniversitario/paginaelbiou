"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

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

const estadoColor: Record<string, string> = {
  pendiente:   "text-amber-400 bg-amber-400/10 border-amber-400/20",
  pagado:      "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  cancelado:   "text-red-400 bg-red-400/10 border-red-400/20",
  reembolsado: "text-sky-400 bg-sky-400/10 border-sky-400/20",
};

export default function PedidosAdmin() {
  const [pedidos,  setPedidos]  = useState<Pedido[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [filtro,   setFiltro]   = useState<string>("todos");

  useEffect(() => {
    if (!supabase) return;
    setLoading(true);
    supabase
      .from("pedidos")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setPedidos((data ?? []) as Pedido[]);
        setLoading(false);
      });
  }, []);

  const filtrados = filtro === "todos" ? pedidos : pedidos.filter((p) => p.estado === filtro);

  return (
    <div>
      <div className="mb-8">
        <p className="font-display font-bold text-[#F5C200] text-[10px] uppercase tracking-[0.25em] mb-1">Admin</p>
        <h1 className="font-display font-black text-white text-2xl uppercase tracking-wide">Pedidos</h1>
      </div>

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
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="font-display font-black text-white text-sm uppercase tracking-wide truncate">
                        {p.nombre_cliente ?? p.email}
                      </p>
                      <span className={`font-display font-black text-[9px] uppercase tracking-widest px-2 py-0.5 border ${estadoColor[p.estado] ?? "text-white/40 bg-white/5 border-white/10"}`}>
                        {p.estado}
                      </span>
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
