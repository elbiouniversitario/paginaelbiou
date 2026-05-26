import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";

export async function GET(req: NextRequest) {
  const email = new URL(req.url).searchParams.get("email");
  if (!email) return NextResponse.json({ error: "Missing email" }, { status: 400 });

  const db = createServerSupabase();
  const { data, error } = await db
    .from("pedidos")
    .select("id, items, total, estado, created_at")
    .eq("email", email)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: String(error) }, { status: 500 });
  return NextResponse.json(data ?? []);
}
