import { NextRequest, NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/admin-auth";

export async function GET(req: NextRequest) {
  const db = await verifyAdmin(req);
  if (!db) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Pedidos pagados que tienen items de penca
  const { data, error } = await db
    .from("pedido_items")
    .select("talle, cantidad, pedidos!inner(estado)")
    .ilike("nombre_producto", "%penca%")
    .eq("pedidos.estado", "pagado");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Agrupar por categoría
  const totales: Record<string, number> = {};
  for (const row of data ?? []) {
    const cat = row.talle ?? "Sin categoría";
    totales[cat] = (totales[cat] ?? 0) + row.cantidad;
  }

  const orden = ["MAYOR", "RESERVA", "SUB20", "PRESENIOR", "FEMENINO", "SUB18"];
  const categorias = [
    ...orden.filter((c) => totales[c] !== undefined).map((c) => ({ categoria: c, cantidad: totales[c] })),
    ...Object.entries(totales).filter(([c]) => !orden.includes(c)).map(([c, n]) => ({ categoria: c, cantidad: n })),
  ];

  const total = categorias.reduce((s, c) => s + c.cantidad, 0);

  return NextResponse.json({ total, categorias });
}
