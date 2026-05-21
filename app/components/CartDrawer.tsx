"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useCart } from "./CartProvider";

function formatPrecio(n: number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(n);
}

export default function CartDrawer() {
  const { items, open, setOpen, total, count, remove, updateQty, clear } = useCart();

  // Lock body scroll when open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const handleCheckout = async () => {
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      });
      const data = await res.json();
      if (data.payment_url) {
        window.location.href = data.payment_url;
      }
    } catch {
      alert("Error al procesar el pago. Intentá de nuevo.");
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-[#0C1729] border-l border-[#1A2A4A] z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#1A2A4A]">
              <div className="flex items-center gap-3">
                <ShoppingBag size={18} className="text-[#FACC15]" />
                <span className="font-display font-black text-sm uppercase tracking-widest text-[#F0F4FF]">
                  Tu carrito
                </span>
                {count > 0 && (
                  <span className="bg-[#FACC15] text-[#070D1A] font-display font-black text-xs w-5 h-5 rounded-full flex items-center justify-center">
                    {count}
                  </span>
                )}
              </div>
              <button
                onClick={() => setOpen(false)}
                className="text-[#7B8FAD] hover:text-[#F0F4FF] transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
                  <ShoppingBag size={48} className="text-[#1A2A4A]" />
                  <p className="font-display font-semibold text-sm uppercase tracking-widest text-[#7B8FAD]">
                    Tu carrito está vacío
                  </p>
                  <button
                    onClick={() => setOpen(false)}
                    className="font-display font-black text-xs uppercase tracking-widest text-[#FACC15] hover:underline"
                  >
                    Seguir comprando
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {items.map((item) => {
                    const key = `${item.producto.id}-${item.talle ?? ""}`;
                    return (
                      <div
                        key={key}
                        className="flex gap-4 p-4 bg-[#172B5C]/30 border border-[#1A2A4A]"
                      >
                        {/* Placeholder image */}
                        <div className="w-16 h-16 bg-[#172B5C] flex items-center justify-center flex-shrink-0 font-display font-black text-[#FACC15] text-xs">
                          EU
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-display font-black text-sm uppercase text-[#F0F4FF] leading-tight truncate">
                            {item.producto.nombre}
                          </p>
                          {item.talle && (
                            <p className="font-body text-xs text-[#7B8FAD] mt-0.5">
                              Talle: {item.talle}
                            </p>
                          )}
                          <p className="font-display font-black text-sm text-[#FACC15] mt-1">
                            {formatPrecio(item.producto.precio)}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <button
                              onClick={() => updateQty(item.producto.id, item.talle, item.cantidad - 1)}
                              className="w-6 h-6 border border-[#1A2A4A] hover:border-[#FACC15] flex items-center justify-center text-[#7B8FAD] hover:text-[#FACC15] transition-colors"
                            >
                              <Minus size={10} />
                            </button>
                            <span className="font-display font-black text-sm text-[#F0F4FF] w-6 text-center">
                              {item.cantidad}
                            </span>
                            <button
                              onClick={() => updateQty(item.producto.id, item.talle, item.cantidad + 1)}
                              className="w-6 h-6 border border-[#1A2A4A] hover:border-[#FACC15] flex items-center justify-center text-[#7B8FAD] hover:text-[#FACC15] transition-colors"
                            >
                              <Plus size={10} />
                            </button>
                            <button
                              onClick={() => remove(item.producto.id, item.talle)}
                              className="ml-auto text-[#7B8FAD] hover:text-[#EF4444] transition-colors"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="px-6 py-5 border-t border-[#1A2A4A] flex flex-col gap-3">
                <div className="flex justify-between items-center">
                  <span className="font-display font-semibold text-sm uppercase tracking-widest text-[#7B8FAD]">
                    Total
                  </span>
                  <span className="font-display font-black text-2xl text-[#FACC15]">
                    {formatPrecio(total)}
                  </span>
                </div>
                <button
                  onClick={handleCheckout}
                  className="w-full bg-[#FACC15] hover:bg-[#FDE047] text-[#070D1A] font-display font-black text-sm uppercase tracking-widest py-4 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                >
                  Finalizar compra
                </button>
                <button
                  onClick={clear}
                  className="font-display font-semibold text-xs uppercase tracking-widest text-[#7B8FAD] hover:text-[#EF4444] transition-colors text-center"
                >
                  Vaciar carrito
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
