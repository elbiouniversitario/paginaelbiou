"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { ShoppingBag, Users, ClipboardList, LayoutDashboard, LogOut, FileText, CalendarDays } from "lucide-react";

const navItems = [
  { href: "/admin",           icon: <LayoutDashboard size={15} />, label: "Dashboard" },
  { href: "/admin/productos", icon: <ShoppingBag size={15} />,     label: "Productos" },
  { href: "/admin/jugadores", icon: <Users size={15} />,           label: "Jugadores" },
  { href: "/admin/partidos",  icon: <CalendarDays size={15} />,    label: "Partidos" },
  { href: "/admin/pedidos",   icon: <ClipboardList size={15} />,   label: "Pedidos" },
  { href: "/admin/contenido", icon: <FileText size={15} />,        label: "Contenido" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [checking, setChecking] = useState(true);
  const [allowed,  setAllowed]  = useState(false);

  useEffect(() => {
    if (!supabase) { setChecking(false); return; }
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { window.location.href = "/portal"; return; }
      const res = await fetch("/api/profile", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (!res.ok) { window.location.href = "/portal"; return; }
      const profile = await res.json() as { habilitado: boolean; es_admin: boolean };
      if (!profile.es_admin) { window.location.href = "/"; return; }
      setAllowed(true);
      setChecking(false);
    });
  }, []);

  if (checking) {
    return (
      <div className="min-h-screen bg-[#060D16] flex items-center justify-center">
        <p className="font-display font-bold text-white/30 text-sm uppercase tracking-widest">Verificando...</p>
      </div>
    );
  }

  if (!allowed) return null;

  return (
    <div className="min-h-screen bg-[#060D16] flex">
      {/* Sidebar */}
      <aside className="w-56 bg-[#0D1B2E] border-r border-white/6 flex flex-col flex-shrink-0">
        <div className="px-5 py-6 border-b border-white/6">
          <p className="font-display font-bold text-white/30 text-[9px] uppercase tracking-[0.25em]">Elbio F.U.</p>
          <p className="font-display font-black text-white text-sm uppercase tracking-wide mt-0.5">Admin</p>
        </div>
        <nav className="flex-1 py-4 flex flex-col gap-0.5 px-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2.5 px-3 py-2.5 font-display font-bold text-[11px] uppercase tracking-wider text-white/40 hover:text-white hover:bg-white/4 transition-all rounded"
            >
              <span className="text-[#F5C200]/60">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="px-4 py-4 border-t border-white/6">
          <button
            onClick={() => { supabase?.auth.signOut(); window.location.href = "/"; }}
            className="flex items-center gap-2 font-display font-bold text-[10px] uppercase tracking-wider text-white/25 hover:text-white/60 transition-colors"
          >
            <LogOut size={13} /> Salir
          </button>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 p-8 overflow-auto">{children}</main>
    </div>
  );
}
