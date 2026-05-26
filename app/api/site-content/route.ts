import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";

export async function GET() {
  const db = createServerSupabase();
  const { data, error } = await db
    .from("site_content")
    .select("clave,valor")
    .order("clave");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}
