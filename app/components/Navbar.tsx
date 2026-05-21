"use client";

import { useState, useEffect } from "react";
import { Menu, X, ShoppingBag, User } from "lucide-react";
import clsx from "clsx";
import Image from "next/image";
import { useCart } from "./CartProvider";

const links = [
  { label: "Inicio",     href: "#inicio" },
  { label: "Historia",   href: "#historia" },
  { label: "Calendario", href: "#calendario" },
  { label: "Tienda",     href: "#tienda" },
];

export default function Navbar() {
  const [open, setOpen]         = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { count, toggleOpen }   = useCart();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <header
      className={clsx(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled ? "bg-[#080F1E]/98 backdrop-blur-md shadow-lg" : "bg-[#080F1E]"
      )}
    >
      {/* Yellow accent bar */}
      <div className="h-0.5 bg-[#F5C200]" />

      <div className="max-w-7xl mx-auto px-4 lg:px-8 flex items-center justify-between h-14">

        {/* Logo */}
        <a href="#inicio" className="flex items-center gap-2.5 group flex-shrink-0">
          <div className="w-8 h-8 rounded-full border border-[#F5C200]/40 group-hover:border-[#F5C200]/80 transition-colors overflow-hidden flex items-center justify-center bg-[#F5C200]/5">
            <Image
              src="/logo.ico"
              alt="EFU"
              width={32}
              height={32}
              className="w-full h-full object-contain"
              unoptimized
            />
          </div>
          <div className="font-display leading-tight hidden sm:block">
            <span className="block font-bold text-white/40 text-[9px] uppercase tracking-[0.18em]">Club Atlético</span>
            <span className="block font-black text-white text-[11px] uppercase tracking-tight leading-none">
              Elbio Fernández <span className="text-[#F5C200]">Universitario</span>
            </span>
          </div>
        </a>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-7">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="font-display font-bold text-[11px] uppercase tracking-[0.14em] text-white/55 hover:text-white transition-colors duration-200 relative group"
            >
              {l.label}
              <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-[#F5C200] group-hover:w-full transition-all duration-200" />
            </a>
          ))}
        </nav>

        {/* Right side: Iniciar Sesión + Cart + mobile toggle */}
        <div className="flex items-center gap-1">
          <a
            href="/login"
            className="hidden lg:flex items-center gap-1.5 font-display font-bold text-[10px] uppercase tracking-[0.15em] text-white/50 hover:text-white transition-colors duration-200 px-3 py-2"
          >
            <User size={12} />
            Iniciar Sesión
          </a>

          <button
            onClick={toggleOpen}
            aria-label="Carrito"
            className="relative w-9 h-9 flex items-center justify-center text-white/55 hover:text-white transition-colors duration-200"
          >
            <ShoppingBag size={17} />
            {count > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#F5C200] text-[#080F1E] font-display font-black text-[9px] flex items-center justify-center leading-none">
                {count}
              </span>
            )}
          </button>

          <button
            onClick={() => setOpen(!open)}
            className="lg:hidden w-9 h-9 flex items-center justify-center text-white/70 hover:text-white transition-colors"
            aria-label="Menú"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={clsx(
          "lg:hidden overflow-hidden transition-all duration-300",
          open ? "max-h-80 opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <nav className="bg-[#080F1E] border-t border-white/8 px-4 py-3 flex flex-col">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="font-display font-bold text-xs uppercase tracking-wider text-white/55 hover:text-white py-3 border-b border-white/8 last:border-0 transition-colors"
            >
              {l.label}
            </a>
          ))}
          <a
            href="/login"
            className="mt-3 text-center flex items-center justify-center gap-2 border border-white/15 text-white/60 font-display font-bold text-xs uppercase tracking-widest py-3"
          >
            <User size={12} /> Iniciar Sesión
          </a>
        </nav>
      </div>
    </header>
  );
}
