import Link from "next/link";
import { ShoppingBag, Users, ClipboardList } from "lucide-react";

const cards = [
  {
    href:     "/admin/productos",
    icon:     <ShoppingBag size={22} />,
    title:    "Productos",
    desc:     "Agregar, editar y subir fotos de productos de la tienda.",
    color:    "text-[#F5C200]",
  },
  {
    href:     "/admin/jugadores",
    icon:     <Users size={22} />,
    title:    "Jugadores",
    desc:     "Habilitar o deshabilitar cuentas del portal de jugadores.",
    color:    "text-sky-400",
  },
  {
    href:     "/admin/pedidos",
    icon:     <ClipboardList size={22} />,
    title:    "Pedidos",
    desc:     "Ver el historial de compras y el estado de cada pedido.",
    color:    "text-emerald-400",
  },
];

export default function AdminDashboard() {
  return (
    <div>
      <div className="mb-8">
        <p className="font-display font-bold text-[#F5C200] text-[10px] uppercase tracking-[0.25em] mb-1">Panel de administración</p>
        <h1 className="font-display font-black text-white text-2xl uppercase tracking-wide">Dashboard</h1>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {cards.map((c) => (
          <Link
            key={c.href}
            href={c.href}
            className="block border border-white/8 bg-white/2 p-6 hover:border-white/15 hover:bg-white/4 transition-all group"
          >
            <span className={`${c.color} mb-4 block`}>{c.icon}</span>
            <h2 className="font-display font-black text-white text-base uppercase tracking-wide mb-1 group-hover:text-[#F5C200] transition-colors">
              {c.title}
            </h2>
            <p className="font-body text-white/35 text-sm leading-relaxed">{c.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
