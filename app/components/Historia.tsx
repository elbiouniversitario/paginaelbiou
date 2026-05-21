"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

const hitos = [
  {
    year: "1952",
    title: "Fundación del Club",
    description:
      "Un grupo de estudiantes y docentes de la Universidad fundaron el club con la convicción de que el deporte y la educación van de la mano. Con pocos recursos pero mucha pasión, se jugó el primer partido oficial.",
    side: "left",
  },
  {
    year: "1961",
    title: "Primer Campeonato Regional",
    description:
      "Nueve años después de su fundación, el equipo conquistó su primer título regional, consolidando al club como una potencia emergente del fútbol universitario de la zona.",
    side: "right",
  },
  {
    year: "1978",
    title: "Estadio Propio",
    description:
      "Gracias al esfuerzo colectivo de socios y dirigentes, se inauguró el estadio del club. Más de 2.000 personas presenciaron el primer partido oficial en casa propia.",
    side: "left",
  },
  {
    year: "1995",
    title: "Ascenso a Primera División",
    description:
      "El momento más esperado: Elbio Universitario ascendió a la primera división regional tras una campaña histórica. El festejo duró días enteros en la ciudad.",
    side: "right",
  },
  {
    year: "2008",
    title: "Copa del Cincuentenario",
    description:
      "En el marco del 56° aniversario del club, se organizó la Copa del Cincuentenario. Elbio Universitario se coronó campeón ante los ojos de más de 5.000 hinchas.",
    side: "left",
  },
  {
    year: "2024",
    title: "Nueva Era Digital",
    description:
      "El club da el salto al futuro: nuevo estadio renovado, plataforma digital, tienda oficial online y una base de socios que supera los 3.400 miembros activos.",
    side: "right",
  },
];

function HitoCard({
  year,
  title,
  description,
  side,
  index,
}: (typeof hitos)[0] & { index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <div
      ref={ref}
      className={`flex items-start gap-6 lg:gap-12 ${
        side === "right" ? "lg:flex-row-reverse" : "lg:flex-row"
      } flex-row`}
    >
      {/* Year */}
      <motion.div
        initial={{ opacity: 0, x: side === "left" ? -40 : 40 }}
        animate={inView ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        className={`flex-shrink-0 w-24 lg:w-36 ${
          side === "right" ? "lg:text-left" : "lg:text-right"
        } text-left`}
      >
        <span className="font-display font-black text-[clamp(2.5rem,5vw,4.5rem)] text-[#FACC15] leading-none animate-glow">
          {year}
        </span>
      </motion.div>

      {/* Line + dot */}
      <div className="flex flex-col items-center flex-shrink-0">
        <motion.div
          initial={{ scale: 0 }}
          animate={inView ? { scale: 1 } : {}}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="w-4 h-4 rounded-full bg-[#FACC15] ring-4 ring-[#FACC15]/20 flex-shrink-0 mt-4"
        />
        {index < hitos.length - 1 && (
          <motion.div
            initial={{ scaleY: 0, originY: 0 }}
            animate={inView ? { scaleY: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
            className="w-px flex-1 bg-gradient-to-b from-[#FACC15]/40 to-transparent min-h-16 mt-2"
          />
        )}
      </div>

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
        className="flex-1 mb-12 lg:mb-16"
      >
        <div className="bg-[#0C1729] border border-[#1A2A4A] hover:border-[#FACC15]/30 p-6 lg:p-8 transition-all duration-300 group hover:bg-[#0F1D38]">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-0.5 bg-[#FACC15] group-hover:w-12 transition-all duration-300" />
            <h3 className="font-display font-black text-xl lg:text-2xl uppercase tracking-tight text-[#F0F4FF]">
              {title}
            </h3>
          </div>
          <p className="font-body text-sm lg:text-base text-[#7B8FAD] leading-relaxed">
            {description}
          </p>
        </div>
      </motion.div>
    </div>
  );
}

export default function Historia() {
  const titleRef = useRef<HTMLDivElement>(null);
  const titleInView = useInView(titleRef, { once: true, margin: "-60px" });

  return (
    <section id="historia" className="relative py-24 lg:py-32 bg-[#070D1A] overflow-hidden">
      {/* Decorative background text */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none select-none z-0 w-full text-center overflow-hidden"
        aria-hidden
      >
        <span className="font-display font-black uppercase text-[clamp(6rem,18vw,16rem)] text-[#0C1729] leading-none whitespace-nowrap">
          HISTORIA
        </span>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 lg:px-8">
        {/* Section header */}
        <div ref={titleRef} className="mb-20 lg:mb-24">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={titleInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="flex items-center gap-3 mb-4"
          >
            <div className="h-px w-10 bg-[#FACC15]" />
            <span className="font-display font-semibold text-xs uppercase tracking-[0.3em] text-[#FACC15]">
              Nuestra trayectoria
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={titleInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="font-display font-black uppercase leading-none text-[clamp(3rem,8vw,7rem)] text-[#F0F4FF]"
          >
            Más de 70{" "}
            <span className="text-stroke-yellow">años</span>
          </motion.h2>
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={titleInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="font-display font-black uppercase leading-none text-[clamp(3rem,8vw,7rem)] text-[#F0F4FF]"
          >
            de historia
          </motion.h2>

          <motion.div
            initial={{ scaleX: 0, originX: 0 }}
            animate={titleInView ? { scaleX: 1 } : {}}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="w-32 h-1.5 bg-[#FACC15] mt-6"
          />
        </div>

        {/* Timeline */}
        <div className="relative">
          {hitos.map((hito, i) => (
            <HitoCard key={hito.year} {...hito} index={i} />
          ))}
        </div>

        {/* CTA bottom */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="mt-4 text-center"
        >
          <p className="font-display font-semibold text-sm uppercase tracking-widest text-[#7B8FAD] mb-6">
            La historia continúa escribiéndose
          </p>
          <a
            href="#socios"
            className="inline-flex items-center gap-2 bg-[#FACC15] hover:bg-[#FDE047] text-[#070D1A] font-display font-black text-sm uppercase tracking-widest px-8 py-4 transition-all duration-200 hover:scale-105 active:scale-95"
          >
            Sé parte del club
          </a>
        </motion.div>
      </div>
    </section>
  );
}
