"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { ShoppingBag, LogOut, Package, Clock, CheckCircle, XCircle } from "lucide-react";
import { useStoreAuth } from "@/app/components/StoreAuthProvider";

interface PedidoItem {
  producto: { nombre: string; precio: number };
  cantidad: number;
  talle?: string;
}

interface Pedido {
  id: string;
  items: PedidoItem[];
  total: number;
  estado: "pendiente" | "pagado" | "cancelado";
  created_at: string;
}

function formatPrecio(n: number) {
  return new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(n);
}

function formatFecha(iso: string) {
  return new Date(iso).toLocaleDateString("es-AR", { day: "numeric", month: "long", year: "numeric" });
}

const ESTADO_CONFIG = {
  pagado:    { label: "Pagado",    icon: CheckCircle, color: "#16A34A", bg: "#F0FDF4" },
  pendiente: { label: "Pendiente", icon: Clock,        color: "#D97706", bg: "#FFFBEB" },
  cancelado: { label: "Cancelado", icon: XCircle,      color: "#DC2626", bg: "#FEF2F2" },
};

function EstadoBadge({ estado }: { estado: Pedido["estado"] }) {
  const cfg = ESTADO_CONFIG[estado] ?? ESTADO_CONFIG.pendiente;
  const Icon = cfg.icon;
  return (
    <span
      className="inline-flex items-center gap-1 font-display font-bold text-[10px] uppercase tracking-widest px-2.5 py-1 border"
      style={{ color: cfg.color, borderColor: cfg.color, background: cfg.bg }}
    >
      <Icon size={10} />
      {cfg.label}
    </span>
  );
}

function OrderCard({ pedido }: { pedido: Pedido }) {
  const [expanded, setExpanded] = useState(false);
  const items = Array.isArray(pedido.items) ? pedido.items : [];

  return (
    <div className="border border-[#D8E1EF] bg-white">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-[#F7F9FC] transition-colors"
      >
        <div className="flex flex-col gap-0.5">
          <span className="font-display font-black text-xs uppercase tracking-widest text-[#1A2F5E]">
            {formatFecha(pedido.created_at)}
          </span>
          <span className="font-body text-xs text-[#6B7A99]">
            {items.length} {items.length === 1 ? "producto" : "productos"}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <EstadoBadge estado={pedido.estado} />
          <span className="font-display font-black text-lg text-[#1A2F5E]">{formatPrecio(pedido.total)}</span>
          <span className="font-display text-[#6B7A99] text-xs">{expanded ? "▲" : "▼"}</span>
        </div>
      </button>

      {expanded && (
        <div className="border-t border-[#D8E1EF] px-5 py-3 flex flex-col gap-2 bg-[#F7F9FC]">
          {items.map((item, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package size={12} className="text-[#6B7A99] flex-shrink-0" />
                <span className="font-display font-bold text-xs uppercase text-[#1A2F5E]">
                  {item.producto?.nombre ?? "Producto"}
                  {item.talle && <span className="text-[#6B7A99] font-normal"> · {item.talle}</span>}
                </span>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-body text-xs text-[#6B7A99]">×{item.cantidad}</span>
                <span className="font-display font-bold text-xs text-[#1A2F5E]">
                  {formatPrecio((item.producto?.precio ?? 0) * item.cantidad)}
                </span>
              </div>
            </div>
          ))}
          <div className="border-t border-[#D8E1EF] mt-1 pt-2 flex justify-between">
            <span className="font-display font-bold text-xs uppercase tracking-widest text-[#6B7A99]">Total</span>
            <span className="font-display font-black text-sm text-[#1A2F5E]">{formatPrecio(pedido.total)}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CuentaPage() {
  const { storeUser, setStoreUser, logout } = useStoreAuth();
  const [nombre,   setNombre]   = useState("");
  const [email,    setEmail]    = useState("");
  const [telefono, setTelefono] = useState("");
  const [error,    setError]    = useState("");
  const [pedidos,  setPedidos]  = useState<Pedido[]>([]);
  const [loading,  setLoading]  = useState(false);

  async function fetchPedidos(mail: string) {
    setLoading(true);
    try {
      const res = await fetch(`/api/tienda/pedidos?email=${encodeURIComponent(mail)}`);
      const data = await res.json() as Pedido[];
      setPedidos(Array.isArray(data) ? data : []);
    } catch {
      setPedidos([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (storeUser) fetchPedidos(storeUser.email);
  }, [storeUser]);

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!nombre.trim() || !email.trim() || !telefono.trim()) {
      setError("Completá los tres campos para continuar.");
      return;
    }
    const user = { nombre: nombre.trim(), email: email.trim(), telefono: telefono.trim() };
    setStoreUser(user);
    setError("");
  }

  function handleLogout() {
    logout();
    setPedidos([]);
    setNombre(""); setEmail(""); setTelefono("");
  }

  /* ── Logged in ── */
  if (storeUser) {
    return (
      <div className="min-h-screen bg-[#F7F9FC] py-16 px-4">
        <div className="max-w-2xl mx-auto">

          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Image src="/logo.ico" alt="Elbio Fernández Universitario" width={44} height={44} unoptimized className="object-contain" />
            <div>
              <p className="font-display font-bold text-[10px] uppercase tracking-[0.22em] text-[#6B7A99]">Mi cuenta · Tienda</p>
              <h1 className="font-display font-black text-2xl uppercase text-[#1A2F5E] leading-tight">
                Hola, {storeUser.nombre.split(" ")[0]}
              </h1>
              <p className="font-body text-xs text-[#6B7A99]">{storeUser.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="ml-auto flex items-center gap-1.5 font-display font-bold text-[10px] uppercase tracking-widest text-[#6B7A99] hover:text-red-500 transition-colors border border-[#D8E1EF] px-3 py-2"
            >
              <LogOut size={11} /> Salir
            </button>
          </div>

          <div className="w-12 h-1 bg-[#F5C200] mb-8" />

          {/* Orders */}
          <div className="flex items-center gap-2 mb-4">
            <ShoppingBag size={14} className="text-[#1A2F5E]" />
            <span className="font-display font-black text-xs uppercase tracking-[0.18em] text-[#1A2F5E]">
              Mis Compras
            </span>
          </div>

          {loading ? (
            <p className="font-body text-sm text-[#6B7A99] py-8 text-center">Cargando...</p>
          ) : pedidos.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-16 text-center">
              <ShoppingBag size={36} className="text-[#D8E1EF]" />
              <p className="font-display font-bold text-xs uppercase tracking-widest text-[#6B7A99]">
                Todavía no realizaste compras
              </p>
              <a
                href="/#tienda"
                className="font-display font-black text-xs uppercase tracking-widest text-[#1A2F5E] border border-[#1A2F5E] px-6 py-2.5 hover:bg-[#1A2F5E] hover:text-white transition-colors mt-2"
              >
                Ir a la tienda
              </a>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {pedidos.map((p) => <OrderCard key={p.id} pedido={p} />)}
            </div>
          )}

          <div className="mt-8 text-center">
            <a href="/" className="font-display font-bold text-[10px] uppercase tracking-widest text-[#6B7A99] hover:text-[#1A2F5E] transition-colors">
              ← Volver al inicio
            </a>
          </div>
        </div>
      </div>
    );
  }

  /* ── Logged out ── */
  return (
    <div className="min-h-screen bg-[#F7F9FC] flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-10">
          <Image src="/logo.ico" alt="Elbio Fernández Universitario" width={52} height={52} unoptimized className="object-contain" />
          <p className="font-display font-black text-[#1A2F5E] text-xs uppercase tracking-[0.22em] mt-3">
            Tienda · Mi Cuenta
          </p>
          <div className="w-8 h-px bg-[#F5C200] mt-2" />
        </div>

        <p className="font-body text-sm text-[#6B7A99] text-center mb-6 leading-relaxed">
          Ingresá tus datos para ver el historial de tus compras.
        </p>

        <form onSubmit={handleLogin} className="flex flex-col gap-3">
          {[
            { placeholder: "Nombre completo *", value: nombre,   setter: setNombre,   type: "text"  },
            { placeholder: "Email *",           value: email,    setter: setEmail,    type: "email" },
            { placeholder: "Celular *",         value: telefono, setter: setTelefono, type: "tel"   },
          ].map(({ placeholder, value, setter, type }) => (
            <input
              key={placeholder}
              type={type}
              placeholder={placeholder}
              value={value}
              onChange={(e) => setter(e.target.value)}
              required
              className="w-full border border-[#D8E1EF] bg-white text-[#1A2F5E] font-body text-sm px-4 py-3 outline-none focus:border-[#1A2F5E] transition-colors placeholder:text-[#6B7A99]/60"
            />
          ))}

          {error && (
            <p className="font-display font-bold text-xs text-red-500 uppercase tracking-wider">{error}</p>
          )}

          <button
            type="submit"
            className="mt-2 bg-[#1A2F5E] text-white font-display font-black text-xs uppercase tracking-[0.18em] py-3.5 hover:bg-[#152549] transition-colors"
          >
            Ver mis compras
          </button>
        </form>

        <p className="font-body text-xs text-[#6B7A99] text-center mt-5 leading-relaxed">
          Si es tu primera compra, tu cuenta se crea automáticamente al finalizar tu pedido.
        </p>

        <a
          href="/"
          className="block text-center font-display font-bold text-[10px] uppercase tracking-widest text-[#6B7A99] hover:text-[#1A2F5E] transition-colors mt-8"
        >
          ← Volver al inicio
        </a>
      </div>
    </div>
  );
}
