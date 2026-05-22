import { createServerSupabase } from "@/lib/supabase-server";
import CargaForm from "./CargaForm";
import type { CategoriaEquipo } from "@/lib/types";

const categorias: CategoriaEquipo[] = ["Mayor", "Reserva", "Pre-Senior", "Sub 20", "Sub 18", "Femenino"];

interface Props {
  searchParams: Promise<{ cat?: string; token?: string }>;
}

export default async function CargaPage({ searchParams }: Props) {
  const params = await searchParams;
  const { cat, token } = params;

  const expectedToken = process.env.CARGA_TOKEN;

  if (!expectedToken || token !== expectedToken) {
    return (
      <div className="min-h-screen bg-[#060D16] flex items-center justify-center px-4">
        <div className="text-center">
          <p className="font-display font-black text-white/20 text-4xl mb-3">401</p>
          <p className="font-body text-white/40 text-sm">Link inválido o expirado. Pedí un nuevo link al administrador.</p>
        </div>
      </div>
    );
  }

  const categoria = categorias.includes(cat as CategoriaEquipo)
    ? (cat as CategoriaEquipo)
    : null;

  if (!categoria) {
    return (
      <div className="min-h-screen bg-[#060D16] flex items-center justify-center px-4">
        <div className="text-center">
          <p className="font-body text-white/40 text-sm">
            Categoría no válida. Usá: {categorias.join(", ")}
          </p>
        </div>
      </div>
    );
  }

  let ultimoPartido = null;
  try {
    const db = createServerSupabase();
    const { data } = await db
      .from("partidos")
      .select("*")
      .eq("categoria", categoria)
      .eq("estado", "programado")
      .order("fecha", { ascending: true })
      .limit(1);
    ultimoPartido = data?.[0] ?? null;
  } catch {}

  return <CargaForm categoria={categoria} token={token} ultimoPartido={ultimoPartido} />;
}
