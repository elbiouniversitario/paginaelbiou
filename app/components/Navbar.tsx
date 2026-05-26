"use client";

import { useState, useEffect, useRef } from "react";
import { Menu, X, ShoppingBag, User, ChevronDown } from "lucide-react";
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
  const [open,        setOpen]        = useState(false);
  const [scrolled,    setScrolled]    = useState(false);
  const [loginOpen,   setLoginOpen]   = useState(false);
  const loginRef = useRef<HTMLDivElement>(null);
  const { count, toggleOpen } = useCart();

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (loginRef.current && !loginRef.current.contains(e.target as Node)) {
        setLoginOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <header
      className={clsx(
        "fixed top-0 left-0 right-0 z-50 bg-white transition-shadow duration-300",
        scrolled ? "shadow-md" : ""
      )}
    >
      <div className="max-w-7xl mx-auto px-4 lg:px-10 flex items-center justify-between h-16">

        {/* Logo — sin marco, escudo directo */}
        <a href="#inicio" className="flex items-center gap-3 group flex-shrink-0">
          <Image
            src="/logo.ico"
            alt="Elbio Fernández Universitario"
            width={44}
            height={44}
            className="object-contain flex-shrink-0"
            unoptimized
          />
          <div className="font-display leading-tight hidden sm:block">
            <span className="block font-black text-[#1A2F5E] text-base uppercase tracking-tight leading-none">
              Elbio Fernández
            </span>
            <span className="block font-bold text-[#6B7A99] text-xs uppercase tracking-wider leading-none mt-0.5">
              Fútbol Universitario
            </span>
          </div>
        </a>

        {/* Desktop nav — centrado */}
        <nav className="hidden lg:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="font-display font-black text-[12px] uppercase tracking-[0.12em] text-[#1A2F5E] hover:text-[#F5C200] transition-colors duration-200"
            >
              {l.label}
            </a>
          ))}
        </nav>

        {/* Right: Iniciar Sesión + Cart */}
        <div className="flex items-center gap-1">
          {/* Login dropdown — desktop */}
          <div ref={loginRef} className="hidden lg:block relative">
            <button
              onClick={() => setLoginOpen((v) => !v)}
              className="flex items-center gap-1.5 font-display font-bold text-[11px] uppercase tracking-[0.12em] text-[#1A2F5E] hover:text-[#F5C200] transition-colors duration-200 px-3 py-2"
            >
              <User size={13} />
              Iniciar Sesión
              <ChevronDown size={11} className={clsx("transition-transform duration-200", loginOpen && "rotate-180")} />
            </button>
            {loginOpen && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-[#D8E1EF] shadow-lg z-50">
                <a
                  href="/portal"
                  onClick={() => setLoginOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-3 font-display font-bold text-[11px] uppercase tracking-wider text-[#1A2F5E] hover:bg-[#F5C200]/10 hover:text-[#F5C200] transition-colors border-b border-[#D8E1EF]"
                >
                  <User size={12} />
                  Portal Jugadores
                </a>
                <a
                  href="/login"
                  onClick={() => setLoginOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-3 font-display font-bold text-[11px] uppercase tracking-wider text-[#1A2F5E] hover:bg-[#F5C200]/10 hover:text-[#F5C200] transition-colors"
                >
                  <ShoppingBag size={12} />
                  Tienda / Compras
                </a>
              </div>
            )}
          </div>

          <button
            onClick={toggleOpen}
            aria-label="Carrito"
            className="relative w-10 h-10 flex items-center justify-center text-[#1A2F5E] hover:text-[#F5C200] transition-colors duration-200"
          >
            <ShoppingBag size={19} />
            {count > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-[#F5C200] text-[#1A2F5E] font-display font-black text-[11px] flex items-center justify-center leading-none">
                {count}
              </span>
            )}
          </button>

          <button
            onClick={() => setOpen(!open)}
            className="lg:hidden w-10 h-10 flex items-center justify-center text-[#1A2F5E] hover:text-[#F5C200] transition-colors"
            aria-label="Menú"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Yellow bottom line */}
      <div className="h-px bg-[#F5C200]" />

      {/* Mobile menu */}
      <div
        className={clsx(
          "lg:hidden overflow-hidden transition-all duration-300",
          open ? "max-h-80 opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <nav className="bg-white border-t border-[#D8E1EF] px-4 py-3 flex flex-col">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="font-display font-black text-xs uppercase tracking-wider text-[#1A2F5E] py-3 border-b border-[#D8E1EF] last:border-0"
            >
              {l.label}
            </a>
          ))}
          <a
            href="/portal"
            onClick={() => setOpen(false)}
            className="mt-3 flex items-center gap-2 border border-[#1A2F5E] text-[#1A2F5E] font-display font-bold text-xs uppercase tracking-widest py-3 px-4"
          >
            <User size={12} /> Portal Jugadores
          </a>
          <a
            href="/login"
            onClick={() => setOpen(false)}
            className="mt-2 flex items-center gap-2 border border-[#D8E1EF] text-[#6B7A99] font-display font-bold text-xs uppercase tracking-widest py-3 px-4"
          >
            <ShoppingBag size={12} /> Tienda / Compras
          </a>
        </nav>
      </div>
    </header>
  );
}
