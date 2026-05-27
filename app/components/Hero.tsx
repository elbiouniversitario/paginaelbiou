"use client";

import { useEffect, useState } from "react";
import { motion, type Variants } from "framer-motion";
import { Trophy, Users, Calendar, Star } from "lucide-react";
import Image from "next/image";

const DEFAULT_STATS = [
  { icon: Trophy,   clave: "hero_stat_campeonatos", value: "12",     label: "Campeonatos" },
  { icon: Calendar, clave: "hero_stat_fundacion",   value: "1952",   label: "Fundación" },
  { icon: Users,    clave: "hero_stat_socios",       value: "3.400+", label: "Socios" },
  { icon: Star,     clave: "hero_stat_division",     value: "1ra",    label: "División" },
];

const marqueeItems = [
  "Elbio Universitario", "·", "Pasión y Garra", "·",
  "Desde 1952", "·", "Azul y Amarillo", "·",
  "Fútbol Universitario", "·",
];

const fadeUp: Variants = {
  hidden:  { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const container: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.15 } },
};

const DEFAULT_DESC = "Más que un club. Una comunidad forjada en la cancha, en las aulas y en el corazón de cada socio desde 1952.";

export default function Hero() {
  const [visible, setVisible] = useState(false);
  const [descripcion, setDescripcion] = useState(DEFAULT_DESC);
  const [stats, setStats] = useState(DEFAULT_STATS.map((s) => ({ ...s })));

  useEffect(() => { const t = setTimeout(() => setVisible(true), 80); return () => clearTimeout(t); }, []);

  useEffect(() => {
    fetch("/api/site-content")
      .then((r) => r.json())
      .then((rows: { clave: string; valor: string | null }[]) => {
        if (!rows?.length) return;
        const map: Record<string, string> = {};
        for (const row of rows) map[row.clave] = row.valor ?? "";
        if (map.hero_descripcion) setDescripcion(map.hero_descripcion);
        setStats(DEFAULT_STATS.map((s) => ({ ...s, value: map[s.clave] || s.value })));
      })
      .catch(() => {});
  }, []);

  return (
    <section id="inicio" className="relative overflow-hidden bg-white pt-20">

      <div className="flex h-1.5">
        <div className="flex-1 bg-[#1A2F5E]" />
        <div className="w-16 bg-[#F5C200]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-16 lg:py-24">
        <motion.div
          variants={container}
          initial="hidden"
          animate={visible ? "visible" : "hidden"}
          className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20"
        >
          <div className="flex-1 text-center lg:text-left">
            <motion.div variants={fadeUp} className="section-tag mb-5">
              Club Atlético · Est. 1952
            </motion.div>

            <motion.h1
              variants={fadeUp}
              className="font-display font-black uppercase leading-[0.9] text-[clamp(3.5rem,9vw,8rem)] text-[#1A2F5E]"
            >
              Elbio
            </motion.h1>
            <motion.h1
              variants={fadeUp}
              className="font-display font-black uppercase leading-[0.9] text-[clamp(2rem,5vw,4.5rem)] text-[#111827]"
            >
              Universitario
            </motion.h1>

            <motion.div
              variants={{
                hidden:  { scaleX: 0, originX: "left" },
                visible: { scaleX: 1, originX: "left", transition: { duration: 0.6, delay: 0.4 } },
              }}
              className="w-20 h-1 bg-[#F5C200] mt-5 mb-6 mx-auto lg:mx-0"
            />

            <motion.p variants={fadeUp} className="font-body text-base text-[#6B7A99] max-w-md mb-8 mx-auto lg:mx-0 leading-relaxed">
              {descripcion}
            </motion.p>

            <motion.div variants={fadeUp} className="flex flex-wrap gap-3 justify-center lg:justify-start">
              <a
                href="#historia"
                className="bg-[#1A2F5E] hover:bg-[#152549] text-white font-display font-black text-xs uppercase tracking-widest px-7 py-3.5 transition-colors duration-200"
              >
                Conocé el Club
              </a>
              <a
                href="#plantel"
                className="border border-[#1A2F5E] text-[#1A2F5E] hover:bg-[#EEF3FB] font-display font-black text-xs uppercase tracking-widest px-7 py-3.5 transition-colors duration-200"
              >
                Ver Plantel
              </a>
            </motion.div>
          </div>

          <motion.div
            variants={fadeUp}
            className="relative flex-shrink-0 flex items-center justify-center"
          >
            <div className="absolute w-64 h-64 lg:w-80 lg:h-80 rounded-full border-2 border-[#F5C200]/30" />
            <div className="absolute w-56 h-56 lg:w-72 lg:h-72 rounded-full border border-[#1A2F5E]/10" />
            <div className="relative w-48 h-48 lg:w-64 lg:h-64 rounded-full bg-[#EEF3FB] border border-[#D8E1EF] flex items-center justify-center shadow-lg">
              <Image
                src="/logo.ico"
                alt="Escudo Elbio Universitario"
                width={160}
                height={160}
                className="rounded-full object-contain"
                priority
              />
            </div>
          </motion.div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.7 }}
        className="border-t border-[#D8E1EF] bg-[#F7F9FC]"
      >
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-[#D8E1EF]">
            {stats.map(({ icon: Icon, value, label }) => (
              <div key={label} className="flex items-center gap-3 px-6 py-5 group">
                <Icon size={18} className="text-[#F5C200] flex-shrink-0" />
                <div>
                  <div className="font-display font-black text-xl text-[#1A2F5E] leading-none">{value}</div>
                  <div className="font-display font-semibold text-xs uppercase tracking-widest text-[#6B7A99] mt-0.5">{label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      <div className="overflow-hidden bg-[#1A2F5E] py-2.5">
        <div className="flex whitespace-nowrap animate-marquee">
          {[...marqueeItems, ...marqueeItems].map((item, i) => (
            <span key={i} className="font-display font-bold text-xs uppercase tracking-widest text-white/70 mx-5">
              {item}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
