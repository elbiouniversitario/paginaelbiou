"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useCart } from "./CartProvider";

function formatPrecio(n: number) {
  return new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(n);
}

function CartInput({ placeholder, value, onChange, type = "text", required }: {
  placeholder: string; value: string; onChange: (v: string) => void; type?: string; required?: boolean;
}) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required={required}
      className="w-full border border-[#D8E1EF] bg-white text-[#1A2F5E] font-body text-sm px-3 py-2.5 outline-none focus:border-[#1A2F5E] transition-colors placeholder:text-[#6B7A99]/60"
    />
  );
}

export default function CartDrawer() {
  const { items, open, setOpen, total, count, remove, updateQty, clear } = useCart();
  const [email,      setEmail]      = useState("");
  const [nombre,     setNombre]     = useState("");
  const [telefono,   setTelefono]   = useState("");
  const [showForm,   setShowForm]   = useState(false);
  const [processing, setProcessing] = useState(false);
  const [checkErr,   setCheckErr]   = useState("");

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  async function handleCheckout(e: React.FormEvent) {
    e.preventDefault();
    setProcessing(true);
    setCheckErr("");
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items, email, nombre_cliente: nombre, telefono }),
      });
      const data = await res.json() as { payment_url?: string; error?: string };
      if (data.payment_url) {
        window.location.href = data.payment_url;
      } else {
        setCheckErr(data.error ?? "Error al procesar el pago.");
        setProcessing(false);
      }
    } catch {
      setCheckErr("Error de conexión. Intentá de nuevo.");
      setProcessing(false);
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 bg-black/40 z-40"
          />
          <motion.div
            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-sm bg-white border-l border-[#D8E1EF] z-50 flex flex-col shadow-xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#D8E1EF] bg-[#F7F9FC]">
              <div className="flex items-center gap-2">
                <ShoppingBag size={16} className="text-[#1A2F5E]" />
                <span className="font-display font-black text-sm uppercase tracking-widest text-[#1A2F5E]">
                  Carrito
                </span>
                {count > 0 && (
                  <span className="bg-[#F5C200] text-[#1A2F5E] font-display font-black text-xs w-5 h-5 rounded-full flex items-center justify-center">{count}</span>
                )}
              </div>
              <button onClick={() => setOpen(false)} className="text-[#6B7A99] hover:text-[#1A2F5E] transition-colors">
                <X size={18} />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-5 py-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
                  <ShoppingBag size={40} className="text-[#D8E1EF]" />
                  <p className="font-display font-semibold text-sm uppercase tracking-widest text-[#6B7A99]">Tu carrito está vacío</p>
                  <button onClick={() => setOpen(false)} className="font-display font-bold text-xs uppercase tracking-widest text-[#1A2F5E] hover:underline">Seguir comprando</button>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {items.map((item) => {
                    const key = `${item.producto.id}-${item.talle ?? ""}`;
                    return (
                      <div key={key} className="flex gap-3 p-3 border border-[#D8E1EF] bg-[#F7F9FC]">
                        <div className="w-14 h-14 bg-[#EEF3FB] flex items-center justify-center flex-shrink-0 font-display font-black text-[#1A2F5E] text-xs border border-[#D8E1EF]">EU</div>
                        <div className="flex-1 min-w-0">
                          <p className="font-display font-black text-xs uppercase text-[#1A2F5E] leading-tight truncate">{item.producto.nombre}</p>
                          {item.talle && <p className="font-body text-[10px] text-[#6B7A99]">Talle: {item.talle}</p>}
                          <p className="font-display font-black text-sm text-[#1A2F5E] mt-1">{formatPrecio(item.producto.precio)}</p>
                          <div className="flex items-center gap-1.5 mt-1.5">
                            <button onClick={() => updateQty(item.producto.id, item.talle, item.cantidad - 1)} className="w-5 h-5 border border-[#D8E1EF] hover:border-[#1A2F5E] flex items-center justify-center text-[#6B7A99] hover:text-[#1A2F5E]"><Minus size={9} /></button>
                            <span className="font-display font-black text-xs text-[#1A2F5E] w-5 text-center">{item.cantidad}</span>
                            <button onClick={() => updateQty(item.producto.id, item.talle, item.cantidad + 1)} className="w-5 h-5 border border-[#D8E1EF] hover:border-[#1A2F5E] flex items-center justify-center text-[#6B7A99] hover:text-[#1A2F5E]"><Plus size={9} /></button>
                            <button onClick={() => remove(item.producto.id, item.talle)} className="ml-auto text-[#6B7A99] hover:text-red-500 transition-colors"><Trash2 size={12} /></button>
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
              <div className="px-5 py-4 border-t border-[#D8E1EF] flex flex-col gap-3 bg-[#F7F9FC]">
                <div className="flex justify-between items-center">
                  <span className="font-display font-semibold text-xs uppercase tracking-widest text-[#6B7A99]">Total</span>
                  <span className="font-display font-black text-xl text-[#1A2F5E]">{formatPrecio(total)}</span>
                </div>

                {showForm ? (
                  <form onSubmit={handleCheckout} className="flex flex-col gap-2.5">
                    <CartInput placeholder="Tu nombre" value={nombre} onChange={setNombre} required />
                    <CartInput placeholder="Email *" type="email" value={email} onChange={setEmail} required />
                    <CartInput placeholder="WhatsApp (opcional)" type="tel" value={telefono} onChange={setTelefono} />
                    {checkErr && <p className="font-body text-red-500 text-xs">{checkErr}</p>}
                    <button
                      type="submit"
                      disabled={processing}
                      className="w-full bg-[#1A2F5E] hover:bg-[#152549] text-white font-display font-black text-xs uppercase tracking-widest py-4 transition-colors duration-200 disabled:opacity-60"
                    >
                      {processing ? "Procesando..." : "Ir al pago →"}
                    </button>
                    <button type="button" onClick={() => setShowForm(false)} className="font-body text-xs text-[#6B7A99] hover:text-[#1A2F5E] text-center">
                      Cancelar
                    </button>
                  </form>
                ) : (
                  <button
                    onClick={() => setShowForm(true)}
                    className="w-full bg-[#1A2F5E] hover:bg-[#152549] text-white font-display font-black text-xs uppercase tracking-widest py-4 transition-colors duration-200"
                  >
                    Finalizar compra
                  </button>
                )}

                <button onClick={clear} className="font-display font-semibold text-xs uppercase tracking-widest text-[#6B7A99] hover:text-red-500 transition-colors text-center">
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
