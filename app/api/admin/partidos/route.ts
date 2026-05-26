import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";
import type { Partido } from "@/lib/types";

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
  const categoria = searchParams.get("categoria") || "Mayor";

  const { data, error } = await db
    .from("partidos")
    .select("*")
    .eq("categoria", categoria)
    .order("fecha", { ascending: true }) as { data: Partido[] | null; error: unknown };

  if (error) return NextResponse.json({ error: String(error) }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function PATCH(req: NextRequest) {
  const db = await verifyAdmin(req);
  if (!db) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const body = await req.json() as Partial<Partido>;
  const allowed = ["estado", "resultado_local", "resultado_visitante", "hora", "sede", "competencia"];
  const patch: Record<string, unknown> = {};
  for (const key of allowed) {
    if (key in body) patch[key] = (body as Record<string, unknown>)[key];
  }

  const { data, error } = await db
    .from("partidos")
    .update(patch)
    .eq("id", id)
    .select()
    .single() as { data: Partido | null; error: unknown };

  if (error) return NextResponse.json({ error: String(error) }, { status: 500 });
  return NextResponse.json(data);
}
