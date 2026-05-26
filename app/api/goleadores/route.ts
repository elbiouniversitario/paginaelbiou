import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const categoria = searchParams.get("categoria") || "Mayor";

  try {
    const db = createServerSupabase();
    const { data, error } = await db
      .from("goleadores")
      .select("jugador_nombre")
      .eq("categoria", categoria) as { data: { jugador_nombre: string }[] | null; error: unknown };

    if (error || !data) return NextResponse.json([]);

    const counts: Record<string, number> = {};
    for (const g of data) {
      counts[g.jugador_nombre] = (counts[g.jugador_nombre] ?? 0) + 1;
    }

    const ranked = Object.entries(counts)
      .map(([nombre, goles]) => ({ nombre, goles }))
      .sort((a, b) => b.goles - a.goles);

    return NextResponse.json(ranked);
  } catch {
    return NextResponse.json([]);
  }
}
