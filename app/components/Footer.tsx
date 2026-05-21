import { AtSign, Share2, Play, Mail, MapPin, Phone } from "lucide-react";
import Image from "next/image";

const navLinks = [
  { label: "Inicio",     href: "#inicio" },
  { label: "Historia",   href: "#historia" },
  { label: "Plantel",    href: "#plantel" },
  { label: "Calendario", href: "#calendario" },
  { label: "Tienda",     href: "#tienda" },
];

const socials = [
  { icon: AtSign,  href: "#", label: "Instagram" },
  { icon: Share2,  href: "#", label: "Twitter / X" },
  { icon: Play,    href: "#", label: "YouTube" },
];

export default function Footer() {
  return (
    <footer className="bg-[#1A2F5E] text-white">
      {/* Yellow top bar */}
      <div className="h-1 bg-[#F5C200]" />

      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-14 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-16">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-5">
              <Image src="/logo.ico" alt="Elbio Fernández Universitario" width={44} height={44} className="rounded-full" />
              <div className="font-display leading-tight">
                <span className="block font-bold text-white/60 text-xs uppercase tracking-wider">Club Atlético</span>
                <span className="block font-black text-white text-base uppercase">Elbio Fernández Universitario</span>
              </div>
            </div>
            <p className="font-body text-sm text-white/60 leading-relaxed mb-6 max-w-xs">
              Más que un club de fútbol. Una comunidad universitaria unida por la pasión, el respeto y los colores azul y amarillo.
            </p>
            <div className="flex items-center gap-2">
              {socials.map(({ icon: Icon, href, label }) => (
                <a key={label} href={href} aria-label={label} className="w-9 h-9 border border-white/20 hover:border-[#F5C200] hover:text-[#F5C200] text-white/60 flex items-center justify-center transition-all duration-200">
                  <Icon size={14} />
                </a>
              ))}
            </div>
          </div>

          {/* Nav */}
          <div>
            <h4 className="font-display font-black text-xs uppercase tracking-widest text-[#F5C200] mb-5">Secciones</h4>
            <ul className="flex flex-col gap-2.5">
              {navLinks.map(l => (
                <li key={l.href}>
                  <a href={l.href} className="font-display font-semibold text-sm uppercase tracking-wider text-white/60 hover:text-white transition-colors flex items-center gap-2 group">
                    <span className="w-3 h-px bg-[#F5C200] group-hover:w-5 transition-all duration-200" />
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display font-black text-xs uppercase tracking-widest text-[#F5C200] mb-5">Contacto</h4>
            <ul className="flex flex-col gap-3.5">
              <li className="flex items-start gap-2.5">
                <MapPin size={14} className="text-[#F5C200] mt-0.5 flex-shrink-0" />
                <span className="font-body text-sm text-white/60">Av. Universitaria 1234, Ciudad</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone size={14} className="text-[#F5C200] flex-shrink-0" />
                <span className="font-body text-sm text-white/60">+54 11 0000-0000</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail size={14} className="text-[#F5C200] flex-shrink-0" />
                <a href="mailto:info@elbiouniversitario.com" className="font-body text-sm text-white/60 hover:text-[#F5C200] transition-colors">
                  info@elbiouniversitario.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col lg:flex-row items-center justify-between gap-3">
          <p className="font-body text-xs text-white/40">© {new Date().getFullYear()} Club Atlético Elbio Fernández Universitario. Todos los derechos reservados.</p>
          <p className="font-display font-semibold text-xs uppercase tracking-widest text-[#F5C200]/40">Azul y Amarillo para siempre</p>
        </div>
      </div>
    </footer>
  );
}
