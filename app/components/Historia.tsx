"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useInView } from "framer-motion";
import TrophyBlock from "./TrophyBlock";
import { supabase } from "@/lib/supabase";

type Hito = { year: string; title: string; description: string };

const DEFAULT_HITOS: Hito[] = [
  {
    year: "2002",
    title: "Fundación del Club",
    description: "Un grupo de estudiantes y docentes universitarios fundaron el club con la convicción de que el deporte y la educación van de la mano. Con pocos recursos pero mucha pasión, se jugó el primer partido oficial.",
  },
  {
    year: "2008",
    title: "Primer Campeonato Regional",
    description: "Seis años después de su fundación, el equipo conquistó su primer título regional, consolidando al club como una potencia emergente del fútbol universitario.",
  },
  {
    year: "2023",
    title: "Estadio Propio",
    description: "Gracias al esfuerzo colectivo de socios y dirigentes, se inauguró el estadio del club. Más de 2.000 personas presenciaron el primer partido oficial en casa propia.",
  },
  {
    year: "2026",
    title: "Nueva Era Digital",
    description: "El club da el salto al futuro: estadio renovado, plataforma digital, tienda oficial online y más de 3.400 socios activos.",
  },
];

function HitoItem({ year, title, description, index, total }: Hito & { index: number; total: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const isEven = index % 2 === 0;

  return (
    <div
      ref={ref}
      className={`flex gap-6 lg:gap-0 ${isEven ? "lg:flex-row" : "lg:flex-row-reverse"}`}
    >
      {/* Content */}
      <motion.div
        initial={{ opacity: 0, x: isEven ? -30 : 30 }}
        animate={inView ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="flex-1 lg:px-12 pb-12"
      >
        <div className={`${isEven ? "lg:text-right" : "lg:text-left"}`}>
          <span className="font-display font-black text-5xl lg:text-6xl text-[#F5C200] leading-none block mb-2">
            {year}
          </span>
          <h3 className="font-display font-black text-xl uppercase text-[#1A2F5E] mb-2">
            {title}
          </h3>
          <p className="font-body text-sm text-[#6B7A99] leading-relaxed max-w-xs inline-block">
            {description}
          </p>
        </div>
      </motion.div>

      {/* Center line + dot */}
      <div className="hidden lg:flex flex-col items-center flex-shrink-0 w-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={inView ? { scale: 1 } : {}}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="w-4 h-4 rounded-full bg-[#F5C200] border-4 border-white ring-2 ring-[#F5C200] flex-shrink-0 mt-1"
        />
        {index < total - 1 && (
          <div className="flex-1 w-px bg-[#D8E1EF] mt-2" />
        )}
      </div>

      {/* Empty side */}
      <div className="hidden lg:block flex-1" />
    </div>
  );
}

export default function Historia() {
  const titleRef = useRef<HTMLDivElement>(null);
  const titleInView = useInView(titleRef, { once: true });
  const [hitos, setHitos] = useState<Hito[]>(DEFAULT_HITOS);

  useEffect(() => {
    if (!supabase) return;
    supabase.from("site_content").select("clave,valor").then(({ data }) => {
      const rows = data as { clave: string; valor: string | null }[] | null;
      if (!rows?.length) return;
      const map: Record<string, string> = {};
      for (const row of rows) map[row.clave] = row.valor ?? "";
      const built: Hito[] = [1, 2, 3, 4].map((n) => ({
        year:        map[`hito_${n}_year`]   || DEFAULT_HITOS[n - 1].year,
        title:       map[`hito_${n}_titulo`] || DEFAULT_HITOS[n - 1].title,
        description: map[`hito_${n}_desc`]   || DEFAULT_HITOS[n - 1].description,
      }));
      setHitos(built);
    });
  }, []);

  return (
    <section id="historia">
      {/* Timeline section — light bg */}
      <div className="py-20 lg:py-28 bg-[#F7F9FC]">
        <div className="max-w-4xl mx-auto px-4 lg:px-8">
          {/* Header */}
          <div ref={titleRef} className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={titleInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5 }}
              className="section-tag justify-center mb-4"
            >
              Nuestra trayectoria
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={titleInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-display font-black uppercase text-[clamp(2.5rem,7vw,5.5rem)] leading-none text-[#1A2F5E]"
            >
              Más de 24 años
            </motion.h2>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={titleInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="font-display font-black uppercase text-[clamp(2.5rem,7vw,5.5rem)] leading-none text-[#111827]"
            >
              de historia
            </motion.h2>
            <motion.div
              initial={{ scaleX: 0 }}
              animate={titleInView ? { scaleX: 1 } : {}}
              style={{ originX: "center" }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="w-16 h-1 bg-[#F5C200] mx-auto mt-5"
            />
          </div>

          {/* Timeline */}
          <div className="relative">
            <div className="hidden lg:block absolute left-1/2 -translate-x-px top-0 bottom-0 w-px bg-[#D8E1EF]" />
            {hitos.map((h, i) => (
              <HitoItem key={i} {...h} index={i} total={hitos.length} />
            ))}
          </div>
        </div>
      </div>

      {/* Trophy block — dark bg */}
      <TrophyBlock />
    </section>
  );
}
