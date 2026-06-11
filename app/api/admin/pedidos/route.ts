import { NextRequest, NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/admin-auth";

export async function GET(req: NextRequest) {
  const db = await verifyAdmin(req);
  if (!db) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { data, error } = await db
    .from("pedidos")
    .select("id, nombre_cliente, email, telefono, total, estado, dlocal_payment_id, created_at")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function PATCH(req: NextRequest) {
  const db = await verifyAdmin(req);
  if (!db) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id, estado } = await req.json() as { id: string; estado: string };
  const { error } = await db.from("pedidos").update({ estado }).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
