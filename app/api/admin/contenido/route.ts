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

export async function GET(req: NextRequest) {
  const db = await verifyAdmin(req);
  if (!db) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { data, error } = await db.from("site_content").select("clave,valor").order("clave");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function PUT(req: NextRequest) {
  const db = await verifyAdmin(req);
  if (!db) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json() as { clave: string; valor: string }[];
  for (const item of body) {
    await db.from("site_content")
      .upsert({ clave: item.clave, valor: item.valor, updated_at: new Date().toISOString() }, { onConflict: "clave" });
  }
  return NextResponse.json({ ok: true });
}
