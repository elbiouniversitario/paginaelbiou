"use client";

import { useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { ShoppingBag, Plus } from "lucide-react";
import type { Producto, CategoriaProducto } from "@/lib/types";
import { mockProductos } from "@/lib/mock-data";
import { useCart } from "./CartProvider";

const talles = ["XS", "S", "M", "L", "XL", "XXL"];
const categorias: { label: string; value: CategoriaProducto | "Todos" }[] = [
  { label: "Todos",       value: "Todos" },
  { label: "Camisetas",   value: "Camisetas" },
  { label: "Shorts",      value: "Shorts" },
  { label: "Accesorios",  value: "Accesorios" },
];

function formatPrecio(n: number) {
  return new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(n);
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
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.45, delay: (index % 4) * 0.08 }}
      className="bg-white border border-[#D8E1EF] hover:border-[#1A2F5E]/30 hover:shadow-md transition-all duration-200 flex flex-col group"
    >
      {/* Image area */}
      <div className="relative aspect-square bg-[#EEF3FB] flex items-center justify-center overflow-hidden">
        {producto.destacado && (
          <span className="absolute top-3 left-3 bg-[#F5C200] text-[#1A2F5E] font-display font-black text-[9px] uppercase tracking-widest px-2 py-0.5">
            Destacado
          </span>
        )}
        <div className="flex flex-col items-center gap-2 text-[#1A2F5E]/30 group-hover:text-[#1A2F5E]/50 transition-colors">
          <ShoppingBag size={36} strokeWidth={1.5} />
          <span className="font-display font-black text-xs uppercase tracking-widest">EU</span>
        </div>
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col flex-1">
        <span className="font-display font-semibold text-[9px] uppercase tracking-widest text-[#6B7A99] mb-1">{producto.categoria}</span>
        <h3 className="font-display font-black text-sm uppercase text-[#1A2F5E] leading-tight mb-1">{producto.nombre}</h3>
        <p className="font-body text-xs text-[#6B7A99] leading-relaxed mb-4 flex-1">{producto.descripcion}</p>

        {needsTalle && (
          <div className="mb-3">
            <p className="font-display font-semibold text-[9px] uppercase tracking-widest text-[#6B7A99] mb-1.5">
              Talle {!talle && <span className="text-red-400">*</span>}
            </p>
            <div className="flex flex-wrap gap-1">
              {talles.map(t => (
                <button
                  key={t}
                  onClick={() => setTalle(talle === t ? null : t)}
                  className={`font-display font-bold text-[10px] px-2 py-1 border transition-all duration-150 ${
                    talle === t
                      ? "bg-[#1A2F5E] border-[#1A2F5E] text-white"
                      : "border-[#D8E1EF] text-[#6B7A99] hover:border-[#1A2F5E] hover:text-[#1A2F5E]"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between gap-2 pt-3 border-t border-[#D8E1EF]">
          <span className="font-display font-black text-lg text-[#1A2F5E]">{formatPrecio(producto.precio)}</span>
          <button
            onClick={handleAdd}
            disabled={needsTalle && !talle}
            className={`flex items-center gap-1.5 font-display font-black text-[10px] uppercase tracking-widest px-3 py-2 transition-all duration-200 ${
              added
                ? "bg-green-600 text-white"
                : needsTalle && !talle
                ? "bg-[#F7F9FC] text-[#6B7A99] border border-[#D8E1EF] cursor-not-allowed"
                : "bg-[#1A2F5E] hover:bg-[#152549] text-white"
            }`}
          >
            {added ? "¡Listo!" : <><Plus size={11} />Agregar</>}
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
  const filtrados = categoria === "Todos" ? mockProductos : mockProductos.filter(p => p.categoria === categoria);

  return (
    <section id="tienda" className="py-20 lg:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <div ref={titleRef} className="mb-10 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5">
          <div>
            <motion.div initial={{ opacity: 0, y: 16 }} animate={titleInView ? { opacity: 1, y: 0 } : {}} className="section-tag mb-3">
              Productos oficiales
            </motion.div>
            <motion.h2 initial={{ opacity: 0, y: 20 }} animate={titleInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6, delay: 0.1 }} className="font-display font-black uppercase text-[clamp(2.5rem,7vw,5.5rem)] leading-none text-[#1A2F5E]">
              Tienda Oficial
            </motion.h2>
            <div className="w-16 h-1 bg-[#F5C200] mt-4" />
          </div>

          <button
            onClick={toggleOpen}
            className="relative self-start flex items-center gap-2 border border-[#1A2F5E] text-[#1A2F5E] hover:bg-[#1A2F5E] hover:text-white font-display font-black text-xs uppercase tracking-widest px-5 py-3 transition-colors duration-200"
          >
            <ShoppingBag size={15} />
            Mi carrito
            {count > 0 && (
              <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-[#F5C200] text-[#1A2F5E] font-display font-black text-xs flex items-center justify-center">
                {count}
              </span>
            )}
          </button>
        </div>

        {/* Filter */}
        <div className="flex flex-wrap gap-2 mb-8">
          {categorias.map(({ label, value }) => (
            <button
              key={value}
              onClick={() => setCategoria(value)}
              className={`font-display font-bold text-xs uppercase tracking-wider px-4 py-2 border transition-all duration-150 ${
                categoria === value
                  ? "bg-[#1A2F5E] border-[#1A2F5E] text-white"
                  : "border-[#D8E1EF] text-[#6B7A99] hover:border-[#1A2F5E] hover:text-[#1A2F5E]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtrados.map((p, i) => <ProductCard key={p.id} producto={p} index={i} />)}
        </div>

        <p className="mt-8 text-center font-body text-xs text-[#6B7A99]">
          Envíos a todo el país · Pago seguro con dLocal Go
        </p>
      </div>
    </section>
  );
}
