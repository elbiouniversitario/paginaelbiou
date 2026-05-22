import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";

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

export async function POST(req: NextRequest) {
  const db = await verifyAdmin(req);
  if (!db) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json() as Record<string, unknown>;
  const { error } = await db.from("productos").insert(body as never);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function GET(req: NextRequest) {
  const db = await verifyAdmin(req);
  if (!db) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { data, error } = await db.from("productos").select("*").order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function PATCH(req: NextRequest) {
  const db = await verifyAdmin(req);
  if (!db) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json() as { id: string; [key: string]: unknown };
  const { id, ...fields } = body;
  const { error } = await db.from("productos").update(fields as never).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const db = await verifyAdmin(req);
  if (!db) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await req.json() as { id: string };
  const { error } = await db.from("productos").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
