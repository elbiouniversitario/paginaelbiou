"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { Save, RotateCcw, Upload, X, ImageIcon } from "lucide-react";

type ContentMap = Record<string, string>;

type SectionField = { key: string; label: string; multiline?: boolean };
type Section = {
  title: string;
  fields: SectionField[];
  fotoKey?: string;
};

const SECTIONS: Section[] = [
  {
    title: "Hero — Descripción",
    fields: [
      { key: "hero_descripcion", label: "Texto debajo del título principal", multiline: true },
    ],
  },
  {
    title: "Historia — Hito 1",
    fields: [
      { key: "hito_1_year",   label: "Año" },
      { key: "hito_1_titulo", label: "Título" },
      { key: "hito_1_desc",   label: "Descripción", multiline: true },
    ],
  },
  {
    title: "Historia — Hito 2",
    fields: [
      { key: "hito_2_year",   label: "Año" },
      { key: "hito_2_titulo", label: "Título" },
      { key: "hito_2_desc",   label: "Descripción", multiline: true },
    ],
  },
  {
    title: "Historia — Hito 3",
    fields: [
      { key: "hito_3_year",   label: "Año" },
      { key: "hito_3_titulo", label: "Título" },
      { key: "hito_3_desc",   label: "Descripción", multiline: true },
    ],
  },
  {
    title: "Historia — Hito 4",
    fields: [
      { key: "hito_4_year",   label: "Año" },
      { key: "hito_4_titulo", label: "Título" },
      { key: "hito_4_desc",   label: "Descripción", multiline: true },
    ],
  },
  {
    title: "Slider — Slide 1",
    fotoKey: "slide_1_foto",
    fields: [
      { key: "slide_1_tag",    label: "Etiqueta pequeña" },
      { key: "slide_1_linea1", label: "Título — Línea 1" },
      { key: "slide_1_linea2", label: "Título — Línea 2" },
      { key: "slide_1_sub",    label: "Subtítulo" },
    ],
  },
  {
    title: "Slider — Slide 2",
    fotoKey: "slide_2_foto",
    fields: [
      { key: "slide_2_tag",    label: "Etiqueta pequeña" },
      { key: "slide_2_linea1", label: "Título — Línea 1" },
      { key: "slide_2_linea2", label: "Título — Línea 2" },
      { key: "slide_2_sub",    label: "Subtítulo" },
    ],
  },
  {
    title: "Slider — Slide 3",
    fotoKey: "slide_3_foto",
    fields: [
      { key: "slide_3_tag",    label: "Etiqueta pequeña" },
      { key: "slide_3_linea1", label: "Título — Línea 1" },
      { key: "slide_3_linea2", label: "Título — Línea 2" },
      { key: "slide_3_sub",    label: "Subtítulo" },
    ],
  },
  {
    title: "Slider — Slide 4",
    fotoKey: "slide_4_foto",
    fields: [
      { key: "slide_4_tag",    label: "Etiqueta pequeña" },
      { key: "slide_4_linea1", label: "Título — Línea 1" },
      { key: "slide_4_linea2", label: "Título — Línea 2" },
      { key: "slide_4_sub",    label: "Subtítulo" },
    ],
  },
];

export default function ContenidoAdmin() {
  const [content,    setContent]    = useState<ContentMap>({});
  const [original,   setOriginal]   = useState<ContentMap>({});
  const [loading,    setLoading]    = useState(true);
  const [saving,     setSaving]     = useState(false);
  const [saved,      setSaved]      = useState(false);
  const [uploading,  setUploading]  = useState<string | null>(null);
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});

  async function getToken() {
    const { data } = await supabase!.auth.getSession();
    return data.session?.access_token ?? "";
  }

  const load = useCallback(async () => {
    setLoading(true);
    const token = await getToken();
    const res = await fetch("/api/admin/contenido", { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json() as { clave: string; valor: string | null }[];
    const map: ContentMap = {};
    for (const item of data) map[item.clave] = item.valor ?? "";
    setContent(map);
    setOriginal(map);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  function set(key: string, value: string) {
    setContent((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    const token = await getToken();
    const body = Object.entries(content).map(([clave, valor]) => ({ clave, valor }));
    await fetch("/api/admin/contenido", {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setOriginal(content);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  async function handleFotoUpload(fotoKey: string, file: File) {
    setUploading(fotoKey);
    const token = await getToken();
    const fd = new FormData();
    fd.append("file", file);
    fd.append("bucket", "productos");
    const res = await fetch("/api/admin/upload", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: fd,
    });
    const data = await res.json() as { url?: string };
    if (data.url) set(fotoKey, data.url);
    setUploading(null);
  }

  const isDirty = JSON.stringify(content) !== JSON.stringify(original);

  if (loading) {
    return <p className="font-body text-white/30 text-sm">Cargando contenido...</p>;
  }

  return (
    <div>
      <div className="flex items-end justify-between mb-8">
        <div>
          <p className="font-display font-bold text-[#F5C200] text-xs uppercase tracking-[0.25em] mb-1">Admin</p>
          <h1 className="font-display font-black text-white text-2xl uppercase tracking-wide">Contenido del Sitio</h1>
        </div>
        <div className="flex items-center gap-3">
          {isDirty && (
            <button
              onClick={() => setContent(original)}
              className="flex items-center gap-2 font-display font-bold text-xs uppercase tracking-wider text-white/40 hover:text-white/70 transition-colors"
            >
              <RotateCcw size={13} /> Descartar
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={!isDirty || saving}
            className="flex items-center gap-2 bg-[#F5C200] text-[#060D16] font-display font-black text-xs uppercase tracking-widest px-5 py-2.5 hover:bg-[#F5C200]/90 disabled:opacity-40 transition-colors"
          >
            <Save size={13} />
            {saving ? "Guardando..." : saved ? "¡Guardado!" : "Guardar cambios"}
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        {SECTIONS.map((section) => (
          <div key={section.title} className="border border-white/8 bg-white/2 p-6">
            <h2 className="font-display font-black text-[#F5C200] text-xs uppercase tracking-widest mb-4">
              {section.title}
            </h2>
            <div className="flex flex-col gap-4">
              {/* Photo upload (slider sections) */}
              {section.fotoKey && (
                <div>
                  <label className="block font-display font-bold text-white/40 text-xs uppercase tracking-widest mb-2">
                    Foto de fondo
                  </label>
                  <div className="flex items-center gap-4">
                    {content[section.fotoKey] ? (
                      <div className="relative flex-shrink-0">
                        <img
                          src={content[section.fotoKey]}
                          alt="preview"
                          className="w-32 h-20 object-cover border border-white/10"
                        />
                        <button
                          onClick={() => set(section.fotoKey!, "")}
                          className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500/80 hover:bg-red-500 text-white flex items-center justify-center transition-colors"
                        >
                          <X size={10} />
                        </button>
                      </div>
                    ) : (
                      <div className="w-32 h-20 border border-white/10 bg-white/4 flex items-center justify-center flex-shrink-0">
                        <ImageIcon size={20} className="text-white/20" />
                      </div>
                    )}
                    <div className="flex flex-col gap-2">
                      <label className="flex items-center gap-2 cursor-pointer bg-white/4 border border-white/10 hover:border-white/25 text-white/60 hover:text-white font-display font-bold text-xs uppercase tracking-widest px-4 py-2.5 transition-colors">
                        {uploading === section.fotoKey ? (
                          <span className="text-[#F5C200]">Subiendo...</span>
                        ) : (
                          <>
                            <Upload size={13} />
                            {content[section.fotoKey] ? "Cambiar foto" : "Subir foto"}
                          </>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          disabled={!!uploading}
                          ref={(el) => { fileRefs.current[section.fotoKey!] = el; }}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleFotoUpload(section.fotoKey!, file);
                            e.target.value = "";
                          }}
                        />
                      </label>
                      <p className="font-body text-white/25 text-xs">
                        Se superpone al fondo de color del slide
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Text fields */}
              {section.fields.map(({ key, label, multiline }) => (
                <div key={key}>
                  <label className="block font-display font-bold text-white/40 text-xs uppercase tracking-widest mb-2">
                    {label}
                  </label>
                  {multiline ? (
                    <textarea
                      value={content[key] ?? ""}
                      onChange={(e) => set(key, e.target.value)}
                      rows={3}
                      className="w-full bg-white/4 border border-white/10 text-white font-body text-sm px-3 py-2.5 outline-none focus:border-[#F5C200]/40 transition-colors resize-none"
                    />
                  ) : (
                    <input
                      type="text"
                      value={content[key] ?? ""}
                      onChange={(e) => set(key, e.target.value)}
                      className="w-full bg-white/4 border border-white/10 text-white font-body text-sm px-3 py-2.5 outline-none focus:border-[#F5C200]/40 transition-colors"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
