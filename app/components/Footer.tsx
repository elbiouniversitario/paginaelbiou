"use client";

import { useState, useEffect } from "react";
import { Mail, MapPin, Phone } from "lucide-react";
import Image from "next/image";

const navLinks = [
  { label: "Inicio",            href: "#inicio" },
  { label: "Historia",          href: "#historia" },
  { label: "Calendario",        href: "#calendario" },
  { label: "Tienda",            href: "#tienda" },
  { label: "Portal Jugadores",  href: "/portal" },
  { label: "Portal Encargados", href: "/encargado" },
];

function SocialBtn({ href, label, symbol }: { href: string; label: string; symbol: string }) {
  return (
    <a
      href={href}
      aria-label={label}
      className="w-9 h-9 border border-white/20 hover:border-[#F5C200] hover:text-[#F5C200] text-white/60 flex items-center justify-center transition-all duration-200 font-display font-bold text-xs"
    >
      {symbol}
    </a>
  );
}

export default function Footer() {
  const [descripcion, setDescripcion] = useState("Más que un club de fútbol. Una comunidad universitaria unida por la pasión, el respeto y los colores azul y oro.");
  const [direccion,   setDireccion]   = useState("Av. Universitaria 1234, Ciudad");
  const [telefono,    setTelefono]    = useState("+54 11 0000-0000");
  const [email,       setEmail]       = useState("elbiouniversitario2023@gmail.com");
  const [instagram,   setInstagram]   = useState("https://instagram.com/elbiouniversitario");
  const [whatsapp,    setWhatsapp]    = useState("https://wa.me/59899019892");

  useEffect(() => {
    fetch("/api/site-content")
      .then((r) => r.json())
      .then((rows: { clave: string; valor: string | null }[]) => {
        if (!rows?.length) return;
        const map: Record<string, string> = {};
        for (const row of rows) map[row.clave] = row.valor ?? "";
        if (map.footer_descripcion) setDescripcion(map.footer_descripcion);
        if (map.footer_direccion)   setDireccion(map.footer_direccion);
        if (map.footer_telefono)    setTelefono(map.footer_telefono);
        if (map.footer_email)       setEmail(map.footer_email);
        if (map.footer_instagram)   setInstagram(map.footer_instagram);
        if (map.footer_whatsapp)    setWhatsapp(map.footer_whatsapp);
      })
      .catch(() => {});
  }, []);

  return (
    <footer className="bg-[#1A2F5E] text-white">
      <div className="h-1 bg-[#F5C200]" />

      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-14 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-16">

          <div>
            <div className="flex items-center gap-3 mb-5">
              <Image
                src="/logo.ico"
                alt="Elbio Fernández Universitario"
                width={48}
                height={48}
                className="object-contain flex-shrink-0"
                unoptimized
              />
              <div className="font-display leading-tight">
                <span className="block font-bold text-white/50 text-[10px] uppercase tracking-wider">Elbio Fernández</span>
                <span className="block font-black text-white text-sm uppercase tracking-tight">Fútbol Universitario</span>
              </div>
            </div>
            <p className="font-body text-sm text-white/55 leading-relaxed mb-6 max-w-xs">
              {descripcion}
            </p>
            <div className="flex items-center gap-2">
              <SocialBtn href={instagram} label="Instagram" symbol="@" />
              <SocialBtn href={whatsapp}  label="WhatsApp"  symbol="W" />
              <SocialBtn href={`mailto:${email}`} label="Email" symbol="✉" />
            </div>
          </div>

          <div>
            <h4 className="font-display font-black text-xs uppercase tracking-widest text-[#F5C200] mb-5">Secciones</h4>
            <ul className="flex flex-col gap-2.5">
              {navLinks.map((l) => (
                <li key={l.href}>
                  <a
                    href={l.href}
                    className="font-display font-semibold text-sm uppercase tracking-wider text-white/55 hover:text-white transition-colors flex items-center gap-2 group"
                  >
                    <span className="w-3 h-px bg-[#F5C200] group-hover:w-5 transition-all duration-200" />
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-display font-black text-xs uppercase tracking-widest text-[#F5C200] mb-5">Contacto</h4>
            <ul className="flex flex-col gap-3.5">
              <li className="flex items-start gap-2.5">
                <MapPin size={14} className="text-[#F5C200] mt-0.5 flex-shrink-0" />
                <span className="font-body text-sm text-white/55">{direccion}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone size={14} className="text-[#F5C200] flex-shrink-0" />
                <span className="font-body text-sm text-white/55">{telefono}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail size={14} className="text-[#F5C200] flex-shrink-0" />
                <a
                  href={`mailto:${email}`}
                  className="font-body text-sm text-white/55 hover:text-[#F5C200] transition-colors"
                >
                  {email}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col lg:flex-row items-center justify-between gap-3">
          <p className="font-body text-xs text-white/35">
            © {new Date().getFullYear()} Club Atlético Elbio Fernández Universitario. Todos los derechos reservados.
          </p>
          <p className="font-display font-semibold text-xs uppercase tracking-widest text-[#F5C200]/40">
            Azul y Oro para siempre
          </p>
        </div>

      </div>
    </footer>
  );
}
