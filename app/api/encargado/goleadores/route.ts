import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";
import { CATEGORIES, verifyToken, type CatSlug } from "@/lib/encargado-auth";
import type { Goleador } from "@/lib/types";

function verifyEncargado(req: NextRequest): CatSlug | null {
  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return null;
  return verifyToken(auth.slice(7));
}

export async function GET(req: NextRequest) {
  const slug = verifyEncargado(req);
  if (!slug) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const partidoId = searchParams.get("partido_id");
  if (!partidoId) return NextResponse.json({ error: "Missing partido_id" }, { status: 400 });

  const db = createServerSupabase();
  const { data, error } = await db
    .from("goleadores")
    .select("*")
    .eq("partido_id", partidoId)
    .order("created_at", { ascending: true }) as { data: Goleador[] | null; error: unknown };

  if (error) return NextResponse.json({ error: String(error) }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function POST(req: NextRequest) {
  const slug = verifyEncargado(req);
  if (!slug) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json() as {
    partido_id: string;
    jugador_nombre: string;
    minuto?: number | null;
    es_penal?: boolean;
  };

  if (!body.partido_id || !body.jugador_nombre?.trim()) {
    return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 });
  }

  const db = createServerSupabase();
  const { data, error } = await db
    .from("goleadores")
    .insert({
      partido_id:     body.partido_id,
      jugador_nombre: body.jugador_nombre.trim(),
      minuto:         body.minuto ?? null,
      es_penal:       body.es_penal ?? false,
      categoria:      CATEGORIES[slug].dbName,
    })
    .select()
    .single() as { data: Goleador | null; error: unknown };

  if (error) return NextResponse.json({ error: String(error) }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(req: NextRequest) {
  const slug = verifyEncargado(req);
  if (!slug) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const db = createServerSupabase();
  const { error } = await db.from("goleadores").delete().eq("id", id);
  if (error) return NextResponse.json({ error: String(error) }, { status: 500 });
  return NextResponse.json({ ok: true });
}
