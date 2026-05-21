"use client";

import { useState, useRef } from "react";
import { motion, useInView } from "framer-motion";

const trophies = [
  { letter: "B", year: "2014", division: "División B" },
  { letter: "C", year: "2013", division: "División A" },
  { letter: "D", year: "2012", division: "División B" },
  { letter: "F", year: "2008", division: "División D" },
];

function TrophyCard({ letter, year, division, index }: (typeof trophies)[0] & { index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const [hovered, setHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    setMouse({
      x: (e.clientX - rect.left - rect.width / 2) / (rect.width / 2),
      y: (e.clientY - rect.top - rect.height / 2) / (rect.height / 2),
    });
  };

  const spring = { type: "spring" as const, stiffness: 140, damping: 22 };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 36 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.13, ease: "easeOut" }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setMouse({ x: 0, y: 0 }); }}
      className="relative overflow-hidden cursor-default select-none"
      style={{ aspectRatio: "0.72" }}
    >
      {/* Base background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0D1B2E] via-[#0A1622] to-[#060D16]" />

      {/* Subtle radial glow from center */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{ opacity: hovered ? 1 : 0 }}
        transition={{ duration: 0.4 }}
        style={{ background: "radial-gradient(ellipse at center 60%, rgba(245,194,0,0.07) 0%, transparent 65%)" }}
      />

      {/* ── Layer 1 (back): Trophy image ── */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        animate={{
          x: hovered ? mouse.x * -18 : 0,
          y: hovered ? mouse.y * -12 : 0,
          scale: hovered ? 1.06 : 1,
        }}
        transition={spring}
      >
        {/* Replace /trophy.png with your real trophy image */}
        <img
          src="/trophy.png"
          alt=""
          className="w-[70%] h-[70%] object-contain"
          style={{
            opacity: 0.38,
            filter: "drop-shadow(0 8px 24px rgba(245,194,0,0.25)) brightness(1.1) contrast(1.05)",
            mixBlendMode: "luminosity",
          }}
        />
      </motion.div>

      {/* ── Layer 2 (mid): Giant division letter ── */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        animate={{
          x: hovered ? mouse.x * 12 : 0,
          y: hovered ? mouse.y * 8 : 0,
        }}
        transition={spring}
      >
        <span
          className="font-display font-black text-[#F5C200]"
          style={{ fontSize: "clamp(6rem, 12vw, 9rem)", lineHeight: 1, opacity: 0.07 }}
        >
          {letter}
        </span>
      </motion.div>

      {/* ── Layer 3 (front): Year + label ── */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 p-5"
        animate={{
          x: hovered ? mouse.x * -7 : 0,
          y: hovered ? mouse.y * -5 : 0,
        }}
        transition={spring}
      >
        <span
          className="block font-display font-black text-[#F5C200] leading-none mb-1.5"
          style={{ fontSize: "clamp(1.8rem, 3.5vw, 2.5rem)" }}
        >
          {year}
        </span>
        <span className="block font-display font-bold text-white/60 text-[10px] uppercase tracking-[0.22em]">
          {division}
        </span>
      </motion.div>

      {/* Border */}
      <motion.div
        className="absolute inset-0 border pointer-events-none"
        animate={{ borderColor: hovered ? "rgba(245,194,0,0.35)" : "rgba(255,255,255,0.05)" }}
        transition={{ duration: 0.35 }}
      />

      {/* Bottom edge accent */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-px"
        animate={{ background: hovered ? "rgba(245,194,0,0.6)" : "rgba(245,194,0,0.15)" }}
        transition={{ duration: 0.35 }}
      />
    </motion.div>
  );
}

export default function TrophyBlock() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });

  return (
    <div className="bg-[#060D16] py-16 lg:py-20">
      <div className="max-w-5xl mx-auto px-4 lg:px-8">
        {/* Stars header */}
        <div ref={ref} className="text-center mb-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={inView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.5 }}
            className="flex justify-center gap-3 mb-5"
          >
            {trophies.map((_, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: -10 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.4, delay: 0.1 + i * 0.08 }}
                className="text-[#F5C200]"
                style={{ fontSize: "1.75rem", lineHeight: 1 }}
              >
                ★
              </motion.span>
            ))}
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="font-display font-black text-white/20 text-[10px] uppercase tracking-[0.3em] mb-1"
          >
            Palmarés del Club
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.28 }}
            className="font-display font-black text-white uppercase"
            style={{ fontSize: "clamp(1.4rem, 4vw, 2.2rem)", letterSpacing: "0.05em" }}
          >
            4 Títulos
          </motion.div>
        </div>

        {/* Trophy grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {trophies.map((t, i) => (
            <TrophyCard key={t.year} {...t} index={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
