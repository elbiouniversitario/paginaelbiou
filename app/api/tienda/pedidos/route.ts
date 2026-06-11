import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";

// La tienda no tiene login con contraseña: la "cuenta" guarda nombre/email/teléfono.
// Para no regalar el historial a cualquiera que conozca un email, exigimos que
// el teléfono también coincida con el del pedido (comparando solo dígitos).
const soloDigitos = (s: string | null | undefined) => (s ?? "").replace(/\D/g, "");

export async function GET(req: NextRequest) {
  const params   = new URL(req.url).searchParams;
  const email    = params.get("email");
  const telefono = soloDigitos(params.get("telefono"));
  if (!email || telefono.length < 6) {
    return NextResponse.json({ error: "Missing email/telefono" }, { status: 400 });
  }

  const db = createServerSupabase();
  const { data, error } = await db
    .from("pedidos")
    .select("id, total, estado, created_at, telefono, pedido_items(cantidad, precio_unitario, talle, nombre_producto)")
    .eq("email", email)
    .neq("estado", "pendiente")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: String(error) }, { status: 500 });

  // Coincidencia por sufijo de 8 dígitos (tolera 099..., +598 99..., etc.)
  const sufijo = telefono.slice(-8);
  const propios = (data ?? []).filter((p) => {
    const telPedido = soloDigitos(p.telefono);
    return telPedido.length >= 6 && telPedido.slice(-8) === sufijo;
  });

  // Transformar al formato que espera el componente OrderCard
  const pedidos = propios.map((p) => ({
    id:         p.id,
    total:      p.total,
    estado:     p.estado,
    created_at: p.created_at,
    items: (p.pedido_items ?? []).map((i: { cantidad: number; precio_unitario: number; talle: string | null; nombre_producto: string | null }) => ({
      producto: { nombre: i.nombre_producto ?? "Producto", precio: i.precio_unitario },
      cantidad: i.cantidad,
      talle:    i.talle ?? undefined,
    })),
  }));

  return NextResponse.json(pedidos);
}
