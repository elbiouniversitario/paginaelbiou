"use client";

import { useEffect, useRef, useState } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import type { Producto, CategoriaProducto } from "@/lib/types";
import { Plus, Trash2, Eye, EyeOff, ImagePlus } from "lucide-react";

const categorias: CategoriaProducto[] = ["Camisetas", "Shorts", "Accesorios", "Calzado"];

const empty = {
  nombre:      "",
  descripcion: "",
  precio:      "",
  categoria:   "Camisetas" as CategoriaProducto,
  talles:      "",
  stock:       "0",
};

export default function ProductosAdmin() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [form,      setForm]      = useState(empty);
  const [imgFile,   setImgFile]   = useState<File | null>(null);
  const [imgPrev,   setImgPrev]   = useState("");
  const [saving,    setSaving]    = useState(false);
  const [savErr,    setSavErr]    = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  async function load() {
    if (!supabase) return;
    setLoading(true);
    const { data } = await supabase
      .from("productos")
      .select("*")
      .order("created_at", { ascending: false });
    setProductos((data ?? []) as Producto[]);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function pickImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImgFile(file);
    setImgPrev(URL.createObjectURL(file));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase || !isSupabaseConfigured) return;
    setSaving(true);
    setSavErr("");

    let foto_url = "";

    if (imgFile) {
      const ext  = imgFile.name.split(".").pop();
      const path = `${Date.now()}.${ext}`;
      const { error: uploadErr } = await supabase.storage
        .from("productos")
        .upload(path, imgFile, { upsert: false });

      if (uploadErr) { setSavErr("Error al subir imagen: " + uploadErr.message); setSaving(false); return; }
      const { data: urlData } = supabase.storage.from("productos").getPublicUrl(path);
      foto_url = urlData.publicUrl;
    }

    const tallesArr = form.talles
      ? form.talles.split(",").map((t) => t.trim()).filter(Boolean)
      : [];

    const { error } = await supabase.from("productos").insert({
      nombre:      form.nombre,
      descripcion: form.descripcion,
      precio:      parseFloat(form.precio),
      categoria:   form.categoria,
      talles:      tallesArr,
      stock:       parseInt(form.stock),
      foto_url,
      destacado:   false,
      activo:      true,
    } as never);

    if (error) { setSavErr(error.message); setSaving(false); return; }
    setForm(empty);
    setImgFile(null);
    setImgPrev("");
    setSaving(false);
    load();
  }

  async function toggleActivo(id: string, current: boolean) {
    if (!supabase) return;
    await supabase.from("productos").update({ activo: !current } as never).eq("id", id);
    load();
  }

  async function toggleDestacado(id: string, current: boolean) {
    if (!supabase) return;
    await supabase.from("productos").update({ destacado: !current } as never).eq("id", id);
    load();
  }

  async function eliminar(id: string) {
    if (!supabase || !confirm("¿Eliminar este producto?")) return;
    await supabase.from("productos").delete().eq("id", id);
    load();
  }

  return (
    <div>
      <div className="mb-8">
        <p className="font-display font-bold text-[#F5C200] text-[10px] uppercase tracking-[0.25em] mb-1">Admin</p>
        <h1 className="font-display font-black text-white text-2xl uppercase tracking-wide">Productos</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Form — left */}
        <div className="lg:col-span-2 border border-white/8 bg-white/2 p-6">
          <h2 className="font-display font-black text-white text-base uppercase tracking-wide mb-5">+ Nuevo producto</h2>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Image picker */}
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

            <AF label="Nombre" value={form.nombre} onChange={(v) => setForm({ ...form, nombre: v })} required />
            <AF label="Descripción" value={form.descripcion} onChange={(v) => setForm({ ...form, descripcion: v })} />
            <div className="grid grid-cols-2 gap-3">
              <AF label="Precio (UYU)" type="number" value={form.precio} onChange={(v) => setForm({ ...form, precio: v })} required />
              <AF label="Stock" type="number" value={form.stock} onChange={(v) => setForm({ ...form, stock: v })} required />
            </div>
            <div>
              <label className="block font-display font-bold text-white/40 text-[10px] uppercase tracking-widest mb-2">Categoría</label>
              <select
                value={form.categoria}
                onChange={(e) => setForm({ ...form, categoria: e.target.value as CategoriaProducto })}
                className="w-full bg-white/4 border border-white/10 text-white font-body text-sm px-3 py-2.5 outline-none focus:border-[#F5C200]/40"
              >
                {categorias.map((c) => <option key={c} value={c} className="bg-[#0D1B2E]">{c}</option>)}
              </select>
            </div>
            <AF label="Talles (separados por coma)" value={form.talles} onChange={(v) => setForm({ ...form, talles: v })} placeholder="S, M, L, XL" />
            {savErr && <p className="font-body text-red-400 text-xs">{savErr}</p>}
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 justify-center bg-[#F5C200] text-[#060D16] font-display font-black text-[12px] uppercase tracking-widest py-3 hover:bg-[#F5C200]/90 disabled:opacity-50 transition-colors"
            >
              <Plus size={15} /> {saving ? "Guardando..." : "Guardar producto"}
            </button>
          </form>
        </div>

        {/* List — right */}
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
                        <ActionBtn
                          onClick={() => toggleDestacado(p.id, p.destacado ?? false)}
                          title={p.destacado ? "Quitar destacado" : "Destacar"}
                          className={p.destacado ? "text-[#F5C200]" : "text-white/25 hover:text-white/60"}
                        >
                          ★
                        </ActionBtn>
                        <ActionBtn
                          onClick={() => toggleActivo(p.id, p.activo ?? true)}
                          title={p.activo ? "Ocultar" : "Mostrar"}
                          className="text-white/25 hover:text-white/60"
                        >
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
  );
}

function AF({
  label, value, onChange, type = "text", required, placeholder,
}: {
  label: string; value: string; onChange: (v: string) => void;
  type?: string; required?: boolean; placeholder?: string;
}) {
  return (
    <div>
      <label className="block font-display font-bold text-white/40 text-[10px] uppercase tracking-widest mb-2">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        placeholder={placeholder}
        className="w-full bg-white/4 border border-white/10 text-white font-body text-sm px-3 py-2.5 outline-none focus:border-[#F5C200]/40 transition-colors placeholder:text-white/20"
      />
    </div>
  );
}

function ActionBtn({ children, onClick, title, className }: { children: React.ReactNode; onClick: () => void; title: string; className: string }) {
  return (
    <button onClick={onClick} title={title} className={`w-7 h-7 flex items-center justify-center transition-colors ${className}`}>
      {children}
    </button>
  );
}
