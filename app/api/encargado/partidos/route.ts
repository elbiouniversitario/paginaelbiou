import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";
import { CATEGORIES, verifyToken, type CatSlug } from "@/lib/encargado-auth";

function verifyEncargado(req: NextRequest): CatSlug | null {
  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return null;
  return verifyToken(auth.slice(7));
}

export async function GET(req: NextRequest) {
  const slug = verifyEncargado(req);
  if (!slug) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const db = createServerSupabase();
  const { data, error } = await db
    .from("partidos")
    .select("*")
    .eq("categoria", CATEGORIES[slug].dbName)
    .order("fecha", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function POST(req: NextRequest) {
  const slug = verifyEncargado(req);
  if (!slug) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const db = createServerSupabase();
  const body = await req.json() as Record<string, unknown>;
  body.categoria = CATEGORIES[slug].dbName;
  const { error } = await db.from("partidos").insert(body as never);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function PATCH(req: NextRequest) {
  const slug = verifyEncargado(req);
  if (!slug) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const db = createServerSupabase();
  const body = await req.json() as { id: string; [key: string]: unknown };
  const { id, ...fields } = body;
  delete fields.categoria;
  const { error } = await db
    .from("partidos")
    .update(fields as never)
    .eq("id", id)
    .eq("categoria", CATEGORIES[slug].dbName);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const slug = verifyEncargado(req);
  if (!slug) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const db = createServerSupabase();
  const { id } = await req.json() as { id: string };
  const { error } = await db
    .from("partidos")
    .delete()
    .eq("id", id)
    .eq("categoria", CATEGORIES[slug].dbName);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
