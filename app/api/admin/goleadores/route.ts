import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";
import type { Goleador } from "@/lib/types";

async function verifyAdmin(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return null;
  const db = createServerSupabase();
  const { data: { user } } = await db.auth.getUser(auth.slice(7));
  if (!user) return null;
  const { data: profile } = await db
    .from("profiles").select("es_admin").eq("id", user.id).single() as {
      data: { es_admin: boolean } | null; error: unknown;
    };
  return profile?.es_admin ? db : null;
}

export async function GET(req: NextRequest) {
  const db = await verifyAdmin(req);
  if (!db) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const partidoId = searchParams.get("partido_id");

  let query = db.from("goleadores").select("*").order("created_at", { ascending: true });
  if (partidoId) query = query.eq("partido_id", partidoId);

  const { data, error } = await query as { data: Goleador[] | null; error: unknown };
  if (error) return NextResponse.json({ error: String(error) }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function POST(req: NextRequest) {
  const db = await verifyAdmin(req);
  if (!db) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json() as {
    partido_id: string;
    jugador_nombre: string;
    minuto?: number | null;
    es_penal?: boolean;
    categoria: string;
  };

  const { partido_id, jugador_nombre, minuto, es_penal, categoria } = body;
  if (!partido_id || !jugador_nombre || !categoria) {
    return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 });
  }

  const { data, error } = await db
    .from("goleadores")
    .insert({ partido_id, jugador_nombre, minuto: minuto ?? null, es_penal: es_penal ?? false, categoria })
    .select()
    .single() as { data: Goleador | null; error: unknown };

  if (error) return NextResponse.json({ error: String(error) }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(req: NextRequest) {
  const db = await verifyAdmin(req);
  if (!db) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const { error } = await db.from("goleadores").delete().eq("id", id);
  if (error) return NextResponse.json({ error: String(error) }, { status: 500 });
  return NextResponse.json({ ok: true });
}
