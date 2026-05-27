"use client";

import { useRef, useEffect, useState } from "react";
import { motion, useInView } from "framer-motion";
import { ShoppingBag, ArrowRight } from "lucide-react";
import { mockProductos } from "@/lib/mock-data";
import { supabase } from "@/lib/supabase";
import type { Producto } from "@/lib/types";

function formatPrecio(n: number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(n);
}

const defaultFeatured: Producto[] = [
  ...mockProductos.filter((p) => p.destacado),
  ...mockProductos.filter((p) => !p.destacado),
].slice(0, 4);

function PreviewCard({ producto, index }: { producto: Producto; index: number }) {
  const ref = useRef<HTMLAnchorElement>(null);
  const inView = useInView(ref, { once: true, margin: "-30px" });

  return (
    <motion.a
      ref={ref}
      href="#tienda"
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.45, delay: index * 0.09, ease: "easeOut" }}
      whileHover={{ y: -5 }}
      className="group block bg-white border border-[#D8E1EF] hover:border-[#1A2F5E]/40 hover:shadow-lg transition-all duration-250 cursor-pointer"
    >
      {/* Image area */}
      <div className={`relative aspect-square flex items-center justify-center overflow-hidden ${!producto.foto_url ? "bg-[#EEF3FB]" : ""}`}>
        {producto.destacado && (
          <span className="absolute top-2.5 left-2.5 bg-[#F5C200] text-[#1A2F5E] font-display font-black text-[8px] uppercase tracking-widest px-2 py-0.5 z-10">
            Destacado
          </span>
        )}
        {producto.foto_url
          ? <img src={producto.foto_url} alt={producto.nombre} className="absolute inset-0 w-full h-full object-contain p-2" />
          : (
            <div className="flex flex-col items-center gap-2 text-[#1A2F5E]/20 group-hover:text-[#1A2F5E]/35 transition-colors duration-250">
              <ShoppingBag size={40} strokeWidth={1} />
              <span className="font-display font-black text-xs uppercase tracking-widest">Elbio</span>
            </div>
          )
        }
        <div className="absolute inset-0 bg-[#1A2F5E]/0 group-hover:bg-[#1A2F5E]/5 transition-colors duration-250" />
      </div>

      {/* Info */}
      <div className="p-4">
        <span className="font-display font-semibold text-[9px] uppercase tracking-widest text-[#6B7A99] block mb-0.5">
          {producto.categoria}
        </span>
        <h3 className="font-display font-black text-sm uppercase text-[#1A2F5E] leading-tight mb-3 line-clamp-2">
          {producto.nombre}
        </h3>
        <div className="flex items-center justify-between">
          <span className="font-display font-black text-lg text-[#1A2F5E]">
            {formatPrecio(producto.precio)}
          </span>
          <span className="font-display font-bold text-[10px] uppercase tracking-widest text-[#6B7A99] group-hover:text-[#1A2F5E] transition-colors flex items-center gap-1">
            Ver más <ArrowRight size={10} />
          </span>
        </div>
      </div>
    </motion.a>
  );
}

export default function StorePreview() {
  const [featured, setFeatured] = useState<Producto[]>(defaultFeatured);
  const titleRef = useRef<HTMLDivElement>(null);
  const titleInView = useInView(titleRef, { once: true });

  useEffect(() => {
    if (!supabase) return;
    supabase
      .from("productos")
      .select("*")
      .eq("activo", true)
      .order("destacado", { ascending: false })
      .limit(4)
      .then(({ data }) => {
        if (data?.length) setFeatured(data as Producto[]);
      });
  }, []);

  return (
    <section className="py-16 lg:py-20 bg-[#F7F9FC]">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        {/* Header */}
        <div ref={titleRef} className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={titleInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.45 }}
              className="section-tag mb-3"
            >
              Productos oficiales
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 18 }}
              animate={titleInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.08 }}
              className="font-display font-black uppercase text-[#1A2F5E] leading-none"
              style={{ fontSize: "clamp(2.2rem, 6vw, 4.5rem)" }}
            >
              Tienda Oficial
            </motion.h2>
            <div className="w-12 h-0.5 bg-[#F5C200] mt-3" />
          </div>
          <motion.a
            href="#tienda"
            initial={{ opacity: 0 }}
            animate={titleInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="hidden sm:inline-flex items-center gap-2 font-display font-black text-xs uppercase tracking-widest text-[#1A2F5E] hover:text-[#F5C200] transition-colors duration-200"
          >
            Ver toda la tienda <ArrowRight size={13} />
          </motion.a>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
          {featured.map((p: Producto, i: number) => (
            <PreviewCard key={p.id} producto={p} index={i} />
          ))}
        </div>

        {/* Mobile CTA */}
        <div className="mt-7 text-center sm:hidden">
          <a
            href="#tienda"
            className="inline-flex items-center gap-2 bg-[#1A2F5E] hover:bg-[#152549] text-white font-display font-black text-xs uppercase tracking-widest px-7 py-3.5 transition-colors duration-200"
          >
            Ver toda la tienda <ArrowRight size={12} />
          </a>
        </div>
      </div>
    </section>
  );
}
