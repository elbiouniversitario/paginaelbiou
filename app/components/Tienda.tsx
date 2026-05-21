"use client";

import { useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { ShoppingBag, Plus } from "lucide-react";
import type { Producto, CategoriaProducto } from "@/lib/types";
import { mockProductos } from "@/lib/mock-data";
import { useCart } from "./CartProvider";

const talles = ["XS", "S", "M", "L", "XL", "XXL"];
const categorias: { label: string; value: CategoriaProducto | "Todos" }[] = [
  { label: "Todos", value: "Todos" },
  { label: "Camisetas", value: "Camisetas" },
  { label: "Shorts", value: "Shorts" },
  { label: "Accesorios", value: "Accesorios" },
];

function formatPrecio(n: number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(n);
}

function ProductCard({ producto, index }: { producto: Producto; index: number }) {
  const { add } = useCart();
  const [talle, setTalle] = useState<string | null>(null);
  const [added, setAdded] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const needsTalle = producto.categoria === "Camisetas" || producto.categoria === "Shorts";

  const handleAdd = () => {
    if (needsTalle && !talle) return;
    add(producto, talle ?? undefined);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: (index % 4) * 0.1, ease: "easeOut" }}
      className="group bg-[#0C1729] border border-[#1A2A4A] hover:border-[#FACC15]/30 transition-all duration-300 flex flex-col"
    >
      {/* Product image */}
      <div className="relative aspect-square bg-gradient-to-br from-[#172B5C] to-[#070D1A] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 grid-pattern opacity-50" />
        {producto.destacado && (
          <div className="absolute top-3 left-3 z-10 bg-[#FACC15] text-[#070D1A] font-display font-black text-[10px] uppercase tracking-widest px-2 py-1">
            Destacado
          </div>
        )}
        <div className="relative z-10 flex flex-col items-center gap-2">
          <div className="w-20 h-20 rounded-full bg-[#FACC15]/10 border border-[#FACC15]/20 flex items-center justify-center group-hover:border-[#FACC15]/50 transition-all duration-300">
            <ShoppingBag size={28} className="text-[#FACC15]/60 group-hover:text-[#FACC15] transition-colors duration-300" />
          </div>
          <span className="font-display font-black text-xs uppercase tracking-widest text-[#FACC15]/40 group-hover:text-[#FACC15]/70 transition-colors">
            EU
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="p-5 flex flex-col flex-1">
        <div className="mb-1">
          <span className="font-display font-bold text-[10px] uppercase tracking-widest text-[#FACC15]/60">
            {producto.categoria}
          </span>
        </div>
        <h3 className="font-display font-black text-base uppercase leading-tight text-[#F0F4FF] mb-1">
          {producto.nombre}
        </h3>
        <p className="font-body text-xs text-[#7B8FAD] leading-relaxed mb-4 flex-1">
          {producto.descripcion}
        </p>

        {/* Talle selector (only for clothing) */}
        {needsTalle && (
          <div className="mb-4">
            <p className="font-display font-semibold text-[10px] uppercase tracking-widest text-[#7B8FAD] mb-2">
              Talle {!talle && <span className="text-[#EF4444]">*</span>}
            </p>
            <div className="flex flex-wrap gap-1">
              {talles.map((t) => (
                <button
                  key={t}
                  onClick={() => setTalle(talle === t ? null : t)}
                  className={`font-display font-bold text-xs px-2.5 py-1 transition-all duration-150 ${
                    talle === t
                      ? "bg-[#FACC15] text-[#070D1A]"
                      : "border border-[#1A2A4A] text-[#7B8FAD] hover:border-[#FACC15]/40 hover:text-[#F0F4FF]"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Price + CTA */}
        <div className="flex items-center justify-between gap-3 mt-auto pt-4 border-t border-[#1A2A4A]">
          <span className="font-display font-black text-xl text-[#FACC15]">
            {formatPrecio(producto.precio)}
          </span>
          <button
            onClick={handleAdd}
            disabled={needsTalle && !talle}
            className={`flex items-center gap-2 font-display font-black text-xs uppercase tracking-widest px-4 py-2.5 transition-all duration-200 ${
              added
                ? "bg-[#22C55E] text-white"
                : needsTalle && !talle
                ? "bg-[#1A2A4A] text-[#7B8FAD] cursor-not-allowed"
                : "bg-[#FACC15] hover:bg-[#FDE047] text-[#070D1A] hover:scale-105 active:scale-95"
            }`}
          >
            {added ? (
              "¡Agregado!"
            ) : (
              <>
                <Plus size={12} />
                Agregar
              </>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default function Tienda() {
  const [categoria, setCategoria] = useState<CategoriaProducto | "Todos">("Todos");
  const { count, toggleOpen } = useCart();
  const titleRef = useRef<HTMLDivElement>(null);
  const titleInView = useInView(titleRef, { once: true });

  const productosFiltrados =
    categoria === "Todos"
      ? mockProductos
      : mockProductos.filter((p) => p.categoria === categoria);

  return (
    <section id="tienda" className="relative py-24 lg:py-32 bg-[#0C1729] overflow-hidden">
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none select-none z-0 overflow-hidden w-full text-center"
        aria-hidden
      >
        <span className="font-display font-black uppercase text-[clamp(5rem,16vw,14rem)] text-[#070D1A] leading-none whitespace-nowrap">
          TIENDA
        </span>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div ref={titleRef} className="mb-12 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
          <div>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={titleInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6 }}
              className="flex items-center gap-3 mb-4"
            >
              <div className="h-px w-10 bg-[#FACC15]" />
              <span className="font-display font-semibold text-xs uppercase tracking-[0.3em] text-[#FACC15]">
                Productos oficiales
              </span>
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              animate={titleInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
              className="font-display font-black uppercase leading-none text-[clamp(3rem,8vw,7rem)] text-[#F0F4FF]"
            >
              Tienda{" "}
              <span className="text-stroke-yellow">Oficial</span>
            </motion.h2>
            <motion.div
              initial={{ scaleX: 0, originX: "left" }}
              animate={titleInView ? { scaleX: 1 } : {}}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="w-32 h-1.5 bg-[#FACC15] mt-6"
            />
          </div>

          {/* Cart button */}
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={titleInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.5 }}
            onClick={toggleOpen}
            className="relative flex items-center gap-3 border border-[#FACC15]/40 hover:border-[#FACC15] px-6 py-3 text-[#F0F4FF] hover:text-[#FACC15] transition-all duration-200 self-start"
          >
            <ShoppingBag size={18} />
            <span className="font-display font-black text-sm uppercase tracking-widest">
              Mi carrito
            </span>
            {count > 0 && (
              <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-[#FACC15] text-[#070D1A] font-display font-black text-xs flex items-center justify-center">
                {count}
              </span>
            )}
          </motion.button>
        </div>

        {/* Category filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={titleInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-wrap gap-2 mb-10"
        >
          {categorias.map(({ label, value }) => (
            <button
              key={value}
              onClick={() => setCategoria(value)}
              className={`font-display font-bold text-xs uppercase tracking-widest px-4 py-2 transition-all duration-200 ${
                categoria === value
                  ? "bg-[#FACC15] text-[#070D1A]"
                  : "border border-[#1A2A4A] text-[#7B8FAD] hover:border-[#FACC15]/40 hover:text-[#F0F4FF]"
              }`}
            >
              {label}
            </button>
          ))}
        </motion.div>

        {/* Product grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {productosFiltrados.map((p, i) => (
            <ProductCard key={p.id} producto={p} index={i} />
          ))}
        </div>

        <p className="mt-8 text-center font-body text-xs text-[#7B8FAD]">
          Envíos a todo el país · Pago seguro con dLocal Go
        </p>
      </div>
    </section>
  );
}
