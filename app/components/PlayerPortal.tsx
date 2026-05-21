import { ArrowRight, Lock } from "lucide-react";

export default function PlayerPortal() {
  return (
    <section className="bg-[#0A1628] py-14 lg:py-16 border-t border-white/5">
      <div className="max-w-4xl mx-auto px-4 lg:px-8 flex flex-col sm:flex-row items-center gap-8 sm:gap-12">
        {/* Icon */}
        <div className="flex-shrink-0 w-16 h-16 rounded-full bg-[#F5C200]/10 border border-[#F5C200]/20 flex items-center justify-center">
          <Lock size={22} className="text-[#F5C200]" />
        </div>

        {/* Text */}
        <div className="flex-1 text-center sm:text-left">
          <p className="font-display font-bold text-[#F5C200] text-[10px] uppercase tracking-[0.25em] mb-2">
            Acceso Exclusivo
          </p>
          <h2 className="font-display font-black text-white uppercase text-2xl lg:text-3xl leading-tight mb-2">
            Portal de Jugadores
          </h2>
          <p className="font-body text-white/45 text-sm leading-relaxed max-w-md">
            Estadísticas personales, comunicados internos e información del plantel. Exclusivo para jugadores registrados.
          </p>
        </div>

        {/* CTA */}
        <a
          href="/portal"
          className="flex-shrink-0 inline-flex items-center gap-2 bg-[#F5C200] hover:bg-[#E6B400] text-[#0A1628] font-display font-black text-xs uppercase tracking-widest px-7 py-4 transition-colors duration-200"
        >
          Acceder
          <ArrowRight size={13} />
        </a>
      </div>
    </section>
  );
}
