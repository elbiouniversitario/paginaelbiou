import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";

const WORKER_URL = process.env.PAYMENT_WORKER_URL ?? "";

export async function POST(req: NextRequest) {
  const body = await req.json() as {
    items: { producto: { precio: number }; cantidad: number }[];
    email: string;
    nombre_cliente: string;
    telefono: string;
  };

  const db = createServerSupabase();

  // Upsert customer record
  await db.from("clientes_tienda").upsert(
    { nombre: body.nombre_cliente, email: body.email, telefono: body.telefono },
    { onConflict: "email" }
  );

  // Calculate total from items
  const total = (body.items ?? []).reduce(
    (sum, item) => sum + (item.producto?.precio ?? 0) * (item.cantidad ?? 1),
    0
  );

  // Save order as pending
  const { data: pedido } = await db
    .from("pedidos")
    .insert({
      email:          body.email,
      nombre_cliente: body.nombre_cliente,
      telefono:       body.telefono,
      items:          body.items,
      total,
      estado:         "pendiente",
    })
    .select("id")
    .single();

  if (!WORKER_URL) {
    return NextResponse.json(
      { error: "Pasarela de pago no configurada. Contactá al administrador." },
      { status: 503 }
    );
  }

  try {
    const res = await fetch(`${WORKER_URL}/checkout`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ ...body, order_id: pedido?.id }),
    });
    const data = await res.json() as { payment_url?: string; payment_id?: string; error?: string };

    // Link payment_id to our order if returned
    if (data.payment_id && pedido?.id) {
      await db.from("pedidos").update({ payment_id: data.payment_id }).eq("id", pedido.id);
    }

    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ error: "Error al conectar con la pasarela de pago." }, { status: 500 });
  }
}
