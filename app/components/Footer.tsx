import { AtSign, Share2, Play, Mail, MapPin, Phone } from "lucide-react";

const navLinks = [
  { label: "Inicio", href: "#inicio" },
  { label: "Historia", href: "#historia" },
  { label: "Plantel", href: "#plantel" },
  { label: "Calendario", href: "#calendario" },
  { label: "Tienda", href: "#tienda" },
];

const socials = [
  { icon: AtSign, href: "#", label: "Instagram" },
  { icon: Share2, href: "#", label: "Twitter / X" },
  { icon: Play, href: "#", label: "YouTube" },
];

export default function Footer() {
  return (
    <footer className="bg-[#050B15] border-t border-[#1A2A4A]">
      {/* Top band */}
      <div className="bg-[#FACC15] py-3 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 flex items-center justify-between">
          <span className="font-display font-black text-xs uppercase tracking-[0.3em] text-[#070D1A]">
            Elbio Universitario FC
          </span>
          <span className="font-display font-semibold text-xs uppercase tracking-widest text-[#070D1A]/60">
            Est. 1952
          </span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-16">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-[#FACC15] flex items-center justify-center font-display font-black text-[#070D1A] text-base">
                EU
              </div>
              <div className="font-display font-black uppercase leading-tight">
                <span className="block text-[#7B8FAD] text-xs tracking-widest">
                  Club Atlético
                </span>
                <span className="block text-[#F0F4FF] text-lg tracking-tight">
                  Elbio Universitario
                </span>
              </div>
            </div>
            <p className="font-body text-sm text-[#7B8FAD] leading-relaxed mb-8 max-w-xs">
              Más que un club de fútbol. Una comunidad universitaria unida por
              la pasión, el respeto y los colores azul y amarillo.
            </p>
            <div className="flex items-center gap-3">
              {socials.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-10 h-10 border border-[#1A2A4A] hover:border-[#FACC15] hover:text-[#FACC15] text-[#7B8FAD] flex items-center justify-center transition-all duration-200 hover:bg-[#FACC15]/10"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="font-display font-black text-sm uppercase tracking-widest text-[#FACC15] mb-6">
              Secciones
            </h4>
            <ul className="flex flex-col gap-3">
              {navLinks.map((l) => (
                <li key={l.href}>
                  <a
                    href={l.href}
                    className="font-display font-semibold text-sm uppercase tracking-wider text-[#7B8FAD] hover:text-[#F0F4FF] transition-colors duration-200 flex items-center gap-2 group"
                  >
                    <span className="w-4 h-px bg-[#FACC15] group-hover:w-6 transition-all duration-300" />
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display font-black text-sm uppercase tracking-widest text-[#FACC15] mb-6">
              Contacto
            </h4>
            <ul className="flex flex-col gap-4">
              <li className="flex items-start gap-3">
                <MapPin size={16} className="text-[#FACC15] mt-0.5 flex-shrink-0" />
                <span className="font-body text-sm text-[#7B8FAD]">
                  Av. Universitaria 1234, Ciudad
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={16} className="text-[#FACC15] flex-shrink-0" />
                <span className="font-body text-sm text-[#7B8FAD]">
                  +54 11 0000-0000
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={16} className="text-[#FACC15] flex-shrink-0" />
                <a
                  href="mailto:info@elbiouniversitario.com"
                  className="font-body text-sm text-[#7B8FAD] hover:text-[#FACC15] transition-colors"
                >
                  info@elbiouniversitario.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-16 pt-8 border-t border-[#1A2A4A] flex flex-col lg:flex-row items-center justify-between gap-4">
          <p className="font-body text-xs text-[#7B8FAD]">
            © {new Date().getFullYear()} Club Atlético Elbio Universitario. Todos los derechos reservados.
          </p>
          <p className="font-display font-semibold text-xs uppercase tracking-widest text-[#FACC15]/40">
            Azul y Amarillo para siempre
          </p>
        </div>
      </div>
    </footer>
  );
}
