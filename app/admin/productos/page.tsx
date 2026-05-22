"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import type { Producto, CategoriaProducto } from "@/lib/types";
import { Plus, Trash2, Eye, EyeOff, ImagePlus, ZoomIn, ZoomOut, Check, X } from "lucide-react";

const categorias: CategoriaProducto[] = ["Camisetas", "Shorts", "Accesorios", "Calzado"];

const empty = {
  nombre: "", descripcion: "", precio: "", categoria: "Camisetas" as CategoriaProducto,
  talles: "", stock: "0",
};

/* ── Image Cropper Modal ─────────────────────────────────────── */
function ImageCropper({
  src, onConfirm, onCancel,
}: { src: string; onConfirm: (blob: Blob) => void; onCancel: () => void }) {
  const [scale,  setScale]  = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [drag,   setDrag]   = useState<{ startX: number; startY: number; ox: number; oy: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef       = useRef<HTMLImageElement>(null);

  function onMouseDown(e: React.MouseEvent) {
    e.preventDefault();
    setDrag({ startX: e.clientX, startY: e.clientY, ox: offset.x, oy: offset.y });
  }
  function onMouseMove(e: React.MouseEvent) {
    if (!drag) return;
    setOffset({ x: drag.ox + e.clientX - drag.startX, y: drag.oy + e.clientY - drag.startY });
  }
  function onMouseUp() { setDrag(null); }

  function onTouchStart(e: React.TouchEvent) {
    const t = e.touches[0];
    setDrag({ startX: t.clientX, startY: t.clientY, ox: offset.x, oy: offset.y });
  }
  function onTouchMove(e: React.TouchEvent) {
    if (!drag) return;
    const t = e.touches[0];
    setOffset({ x: drag.ox + t.clientX - drag.startX, y: drag.oy + t.clientY - drag.startY });
  }

  const confirm = useCallback(() => {
    const container = containerRef.current;
    const img       = imgRef.current;
    if (!container || !img) return;

    const cw = container.clientWidth;
    const ch = container.clientHeight;
    const canvas = document.createElement("canvas");
    canvas.width  = cw * 2;
    canvas.height = ch * 2;
    const ctx = canvas.getContext("2d")!;
    ctx.scale(2, 2);

    const iw = img.naturalWidth  * scale;
    const ih = img.naturalHeight * scale;
    const sx = (cw - iw) / 2 + offset.x;
    const sy = (ch - ih) / 2 + offset.y;

    ctx.drawImage(img, sx, sy, iw, ih);
    canvas.toBlob((blob) => { if (blob) onConfirm(blob); }, "image/jpeg", 0.92);
  }, [scale, offset, onConfirm]);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex flex-col items-center justify-center p-4 gap-4">
      <p className="font-display font-bold text-white text-sm uppercase tracking-widest">
        Ajustá la imagen — arrastrá y hacé zoom
      </p>

      {/* Canvas area */}
      <div
        ref={containerRef}
        className="relative w-full max-w-md aspect-[4/3] overflow-hidden bg-black/40 border border-white/20 cursor-grab active:cursor-grabbing select-none"
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onMouseUp}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={imgRef}
          src={src}
          alt=""
          draggable={false}
          style={{
            position: "absolute",
            left: "50%", top: "50%",
            transform: `translate(calc(-50% + ${offset.x}px), calc(-50% + ${offset.y}px)) scale(${scale})`,
            transformOrigin: "center",
            maxWidth: "none",
            userSelect: "none",
          }}
        />
      </div>

      {/* Zoom slider */}
      <div className="flex items-center gap-3 w-full max-w-md">
        <button onClick={() => setScale((s) => Math.max(0.2, s - 0.1))}
          className="text-white/60 hover:text-white transition-colors">
          <ZoomOut size={18} />
        </button>
        <input
          type="range" min="0.2" max="4" step="0.05"
          value={scale}
          onChange={(e) => setScale(parseFloat(e.target.value))}
          className="flex-1 accent-[#F5C200]"
        />
        <button onClick={() => setScale((s) => Math.min(4, s + 0.1))}
          className="text-white/60 hover:text-white transition-colors">
          <ZoomIn size={18} />
        </button>
        <span className="font-body text-white/40 text-xs w-10 text-right">{Math.round(scale * 100)}%</span>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button onClick={onCancel}
          className="flex items-center gap-2 border border-white/20 text-white/60 font-display font-bold text-[11px] uppercase tracking-widest px-5 py-2.5 hover:border-white/40 transition-colors">
          <X size={13} /> Cancelar
        </button>
        <button onClick={confirm}
          className="flex items-center gap-2 bg-[#F5C200] text-[#060D16] font-display font-bold text-[11px] uppercase tracking-widest px-5 py-2.5 hover:bg-[#F5C200]/90 transition-colors">
          <Check size={13} /> Aplicar
        </button>
      </div>
    </div>
  );
}

/* ── Main page ───────────────────────────────────────────────── */
export default function ProductosAdmin() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [form,      setForm]      = useState(empty);
  const [imgFile,   setImgFile]   = useState<Blob | null>(null);
  const [imgPrev,   setImgPrev]   = useState("");
  const [cropSrc,   setCropSrc]   = useState("");
  const [saving,    setSaving]    = useState(false);
  const [savErr,    setSavErr]    = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  async function getToken() {
    const { data } = await supabase!.auth.getSession();
    return data.session?.access_token ?? "";
  }

  async function load() {
    if (!supabase) return;
    setLoading(true);
    const token = await getToken();
    const res = await fetch("/api/admin/productos", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json() as Producto[];
    setProductos(Array.isArray(data) ? data : []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function pickImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setCropSrc(URL.createObjectURL(file));
    if (fileRef.current) fileRef.current.value = "";
  }

  function handleCropConfirm(blob: Blob) {
    setImgFile(blob);
    setImgPrev(URL.createObjectURL(blob));
    setCropSrc("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase) return;
    setSaving(true);
    setSavErr("");

    let foto_url = "";

    if (imgFile) {
      const token = await getToken();
      const fd = new FormData();
      fd.append("file", new File([imgFile], `product.jpg`, { type: "image/jpeg" }));
      fd.append("bucket", "productos");

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      const json = await res.json() as { url?: string; error?: string };
      if (!res.ok || !json.url) {
        setSavErr("Error al subir imagen: " + (json.error ?? "desconocido"));
        setSaving(false);
        return;
      }
      foto_url = json.url;
    }

    const tallesArr = form.talles
      ? form.talles.split(",").map((t) => t.trim()).filter(Boolean)
      : [];

    const token2 = await getToken();
    const insertRes = await fetch("/api/admin/productos", {
      method: "POST",
      headers: { Authorization: `Bearer ${token2}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        nombre: form.nombre, descripcion: form.descripcion,
        precio: parseFloat(form.precio), categoria: form.categoria,
        talles: tallesArr, stock: parseInt(form.stock),
        foto_url, destacado: false, activo: true,
      }),
    });
    const insertJson = await insertRes.json() as { ok?: boolean; error?: string };
    if (!insertRes.ok) { setSavErr(insertJson.error ?? "Error al guardar"); setSaving(false); return; }
    setForm(empty);
    setImgFile(null);
    setImgPrev("");
    setSaving(false);
    load();
  }

  async function toggleActivo(id: string, current: boolean) {
    const token = await getToken();
    await fetch("/api/admin/productos", {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ id, activo: !current }),
    });
    load();
  }
  async function toggleDestacado(id: string, current: boolean) {
    const token = await getToken();
    await fetch("/api/admin/productos", {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ id, destacado: !current }),
    });
    load();
  }
  async function eliminar(id: string) {
    if (!confirm("¿Eliminar este producto?")) return;
    const token = await getToken();
    await fetch("/api/admin/productos", {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    load();
  }

  return (
    <>
      {cropSrc && (
        <ImageCropper
          src={cropSrc}
          onConfirm={handleCropConfirm}
          onCancel={() => setCropSrc("")}
        />
      )}

      <div>
        <div className="mb-8">
          <p className="font-display font-bold text-[#F5C200] text-[10px] uppercase tracking-[0.25em] mb-1">Admin</p>
          <h1 className="font-display font-black text-white text-2xl uppercase tracking-wide">Productos</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Form */}
          <div className="lg:col-span-2 border border-white/8 bg-white/2 p-6">
            <h2 className="font-display font-black text-white text-base uppercase tracking-wide mb-5">+ Nuevo producto</h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div
                onClick={() => fileRef.current?.click()}
                className="relative w-full aspect-[4/3] bg-white/4 border border-dashed border-white/15 flex items-center justify-center cursor-pointer hover:border-[#F5C200]/40 transition-colors overflow-hidden"
              >
                {imgPrev
                  ? <img src={imgPrev} alt="" className="absolute inset-0 w-full h-full object-cover" />
                  : <span className="flex flex-col items-center gap-2 text-white/25"><ImagePlus size={24} /><span className="font-body text-xs">Subir foto</span></span>
                }
                <input ref={fileRef} type="file" accept="image/*" onChange={pickImage} className="hidden" />
              </div>
              {imgPrev && (
                <button type="button" onClick={() => { setImgFile(null); setImgPrev(""); }}
                  className="font-body text-white/30 text-xs text-center hover:text-white/60 transition-colors -mt-2">
                  Cambiar imagen
                </button>
              )}

              <AF label="Nombre" value={form.nombre} onChange={(v) => setForm({ ...form, nombre: v })} required />
              <AF label="Descripción" value={form.descripcion} onChange={(v) => setForm({ ...form, descripcion: v })} />
              <div className="grid grid-cols-2 gap-3">
                <AF label="Precio (UYU)" type="number" value={form.precio} onChange={(v) => setForm({ ...form, precio: v })} required />
                <AF label="Stock" type="number" value={form.stock} onChange={(v) => setForm({ ...form, stock: v })} required />
              </div>
              <div>
                <label className="block font-display font-bold text-white/40 text-[10px] uppercase tracking-widest mb-2">Categoría</label>
                <select value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value as CategoriaProducto })}
                  className="w-full bg-white/4 border border-white/10 text-white font-body text-sm px-3 py-2.5 outline-none focus:border-[#F5C200]/40">
                  {categorias.map((c) => <option key={c} value={c} className="bg-[#0D1B2E]">{c}</option>)}
                </select>
              </div>
              <AF label="Talles (separados por coma)" value={form.talles} onChange={(v) => setForm({ ...form, talles: v })} placeholder="S, M, L, XL" />
              {savErr && <p className="font-body text-red-400 text-xs">{savErr}</p>}
              <button type="submit" disabled={saving}
                className="flex items-center gap-2 justify-center bg-[#F5C200] text-[#060D16] font-display font-black text-[12px] uppercase tracking-widest py-3 hover:bg-[#F5C200]/90 disabled:opacity-50 transition-colors">
                <Plus size={15} /> {saving ? "Guardando..." : "Guardar producto"}
              </button>
            </form>
          </div>

          {/* List */}
          <div className="lg:col-span-3">
            {loading
              ? <p className="font-body text-white/30 text-sm">Cargando...</p>
              : productos.length === 0
                ? <p className="font-body text-white/30 text-sm">No hay productos aún.</p>
                : (
                  <div className="flex flex-col gap-2">
                    {productos.map((p) => (
                      <div key={p.id} className={`flex items-center gap-3 border bg-white/2 px-4 py-3 transition-all ${p.activo ? "border-white/8" : "border-white/4 opacity-50"}`}>
                        {p.foto_url
                          ? <img src={p.foto_url} alt="" className="w-12 h-12 object-cover flex-shrink-0 bg-white/5" />
                          : <div className="w-12 h-12 bg-white/5 flex-shrink-0" />
                        }
                        <div className="flex-1 min-w-0">
                          <p className="font-display font-black text-white text-sm uppercase tracking-wide truncate">{p.nombre}</p>
                          <p className="font-body text-white/40 text-xs">${p.precio.toLocaleString("es-UY")} · {p.categoria} · Stock: {p.stock}</p>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <ActionBtn onClick={() => toggleDestacado(p.id, p.destacado ?? false)}
                            title={p.destacado ? "Quitar destacado" : "Destacar"}
                            className={p.destacado ? "text-[#F5C200]" : "text-white/25 hover:text-white/60"}>★</ActionBtn>
                          <ActionBtn onClick={() => toggleActivo(p.id, p.activo ?? true)}
                            title={p.activo ? "Ocultar" : "Mostrar"} className="text-white/25 hover:text-white/60">
                            {p.activo ? <Eye size={14} /> : <EyeOff size={14} />}
                          </ActionBtn>
                          <ActionBtn onClick={() => eliminar(p.id)} title="Eliminar" className="text-white/20 hover:text-red-400">
                            <Trash2 size={14} />
                          </ActionBtn>
                        </div>
                      </div>
                    ))}
                  </div>
                )
            }
          </div>
        </div>
      </div>
    </>
  );
}

function AF({ label, value, onChange, type = "text", required, placeholder }: {
  label: string; value: string; onChange: (v: string) => void;
  type?: string; required?: boolean; placeholder?: string;
}) {
  return (
    <div>
      <label className="block font-display font-bold text-white/40 text-[10px] uppercase tracking-widest mb-2">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)}
        required={required} placeholder={placeholder}
        className="w-full bg-white/4 border border-white/10 text-white font-body text-sm px-3 py-2.5 outline-none focus:border-[#F5C200]/40 transition-colors placeholder:text-white/20" />
    </div>
  );
}

function ActionBtn({ children, onClick, title, className }: {
  children: React.ReactNode; onClick: () => void; title: string; className: string;
}) {
  return (
    <button onClick={onClick} title={title} className={`w-7 h-7 flex items-center justify-center transition-colors ${className}`}>
      {children}
    </button>
  );
}
