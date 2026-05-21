"use client";

import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import clsx from "clsx";
import Image from "next/image";

const links = [
  { label: "Inicio",     href: "#inicio" },
  { label: "Historia",   href: "#historia" },
  { label: "Plantel",    href: "#plantel" },
  { label: "Calendario", href: "#calendario" },
  { label: "Tienda",     href: "#tienda" },
];

export default function Navbar() {
  const [open, setOpen]       = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <header
      className={clsx(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-[#D8E1EF]"
          : "bg-white border-b border-[#D8E1EF]"
      )}
    >
      {/* Top accent bar */}
      <div className="h-1 bg-[#1A2F5E]" />

      <div className="max-w-7xl mx-auto px-4 lg:px-8 flex items-center justify-between h-16">
        {/* Logo */}
        <a href="#inicio" className="flex items-center gap-3 group">
          <Image
            src="/logo.ico"
            alt="Elbio Universitario"
            width={40}
            height={40}
            className="rounded-full group-hover:opacity-80 transition-opacity"
          />
          <div className="font-display leading-tight hidden sm:block">
            <span className="block font-black text-[#1A2F5E] text-sm uppercase tracking-tight">
              Club Atlético
            </span>
            <span className="block font-black text-[#1A2F5E] text-base uppercase tracking-tight">
              Elbio Universitario
            </span>
          </div>
        </a>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-6">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="font-display font-semibold text-sm uppercase tracking-wider text-[#6B7A99] hover:text-[#1A2F5E] transition-colors duration-200 relative group"
            >
              {l.label}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#F5C200] group-hover:w-full transition-all duration-200" />
            </a>
          ))}
        </nav>

        {/* CTA + mobile toggle */}
        <div className="flex items-center gap-3">
          <a
            href="#socios"
            className="hidden lg:inline-flex items-center bg-[#1A2F5E] hover:bg-[#152549] text-white font-display font-black text-xs uppercase tracking-widest px-5 py-2.5 transition-colors duration-200"
          >
            Hacerse Socio
          </a>
          <button
            onClick={() => setOpen(!open)}
            className="lg:hidden text-[#1A2F5E] hover:text-[#F5C200] transition-colors"
            aria-label="Menu"
          >
            {open ? <X size={22} /> : <Menu size={22} />}
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
        <nav className="bg-white border-t border-[#D8E1EF] px-4 py-3 flex flex-col">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="font-display font-semibold text-sm uppercase tracking-wider text-[#6B7A99] hover:text-[#1A2F5E] py-3 border-b border-[#D8E1EF] last:border-0 transition-colors"
            >
              {l.label}
            </a>
          ))}
          <a
            href="#socios"
            className="mt-3 text-center bg-[#1A2F5E] text-white font-display font-black text-xs uppercase tracking-widest py-3"
          >
            Hacerse Socio
          </a>
        </nav>
      </div>
    </header>
  );
}
