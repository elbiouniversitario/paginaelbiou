"use client";

import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import clsx from "clsx";

const links = [
  { label: "Inicio", href: "#inicio" },
  { label: "Historia", href: "#historia" },
  { label: "Plantel", href: "#plantel" },
  { label: "Calendario", href: "#calendario" },
  { label: "Tienda", href: "#tienda" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <header
      className={clsx(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
        scrolled
          ? "bg-[#070D1A]/95 backdrop-blur-md border-b border-[#1A2A4A]"
          : "bg-transparent"
      )}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8 flex items-center justify-between h-16 lg:h-20">
        {/* Logo */}
        <a href="#inicio" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-full bg-[#FACC15] flex items-center justify-center font-display font-black text-[#070D1A] text-sm tracking-tighter transition-transform group-hover:scale-110">
            EU
          </div>
          <div className="font-display font-black uppercase leading-none">
            <span className="block text-[#F0F4FF] text-sm tracking-widest">
              Club Atlético
            </span>
            <span className="block text-[#FACC15] text-base tracking-tight">
              Elbio Universitario
            </span>
          </div>
        </a>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-8">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="font-display font-semibold text-sm uppercase tracking-widest text-[#7B8FAD] hover:text-[#FACC15] transition-colors duration-200"
            >
              {l.label}
            </a>
          ))}
        </nav>

        {/* CTA + Mobile toggle */}
        <div className="flex items-center gap-4">
          <a
            href="#socios"
            className="hidden lg:inline-flex items-center gap-2 bg-[#FACC15] hover:bg-[#FDE047] text-[#070D1A] font-display font-black text-sm uppercase tracking-widest px-5 py-2.5 transition-all duration-200 hover:scale-105 active:scale-95"
          >
            Hacerse Socio
          </a>
          <button
            onClick={() => setOpen(!open)}
            className="lg:hidden text-[#F0F4FF] hover:text-[#FACC15] transition-colors"
            aria-label="Menu"
          >
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={clsx(
          "lg:hidden overflow-hidden transition-all duration-300",
          open ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <nav className="bg-[#070D1A]/98 backdrop-blur-md border-t border-[#1A2A4A] px-6 py-4 flex flex-col gap-1">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="font-display font-semibold text-base uppercase tracking-widest text-[#7B8FAD] hover:text-[#FACC15] py-3 border-b border-[#1A2A4A] last:border-0 transition-colors"
            >
              {l.label}
            </a>
          ))}
          <a
            href="#socios"
            className="mt-4 text-center bg-[#FACC15] text-[#070D1A] font-display font-black text-sm uppercase tracking-widest py-3 transition-colors hover:bg-[#FDE047]"
          >
            Hacerse Socio
          </a>
        </nav>
      </div>
    </header>
  );
}
