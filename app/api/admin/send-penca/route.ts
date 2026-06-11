import { NextRequest, NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/admin-auth";

function generatePencaCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const arr   = new Uint8Array(6);
  crypto.getRandomValues(arr);
  return "PENCA-" + Array.from(arr, (b) => chars[b % chars.length]).join("");
}

// POST /api/admin/send-penca?pid=DP-XXXXX
// Para pedidos PENDIENTES por transferencia: marca como pagado, genera código y manda email
export async function POST(req: NextRequest) {
  const db = await verifyAdmin(req);
  if (!db) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const pid = req.nextUrl.searchParams.get("pid")?.trim();
  if (!pid) return NextResponse.json({ error: "Missing pid" }, { status: 400 });

  try {
    // 1. Marcar pedido como pagado
    await db.from("pedidos").update({ estado: "pagado" }).eq("dlocal_payment_id", pid);

    // 2. Buscar datos del pedido
    const { data: pedidos } = await db
      .from("pedidos")
      .select("id, email, nombre_cliente")
      .eq("dlocal_payment_id", pid)
      .limit(1);

    const pedido = pedidos?.[0];
    if (!pedido) return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 });

    // 3. Verificar si ya tiene código penca
    const { data: existing } = await db
      .from("penca_codigos")
      .select("id")
      .eq("dlocal_payment_id", pid)
      .limit(1);

    if (existing?.length) return NextResponse.json({ ok: true, msg: "Ya tenía código generado" });

    // 4. Verificar si tiene items de penca
    const { data: items } = await db
      .from("pedido_items")
      .select("cantidad, nombre_producto")
      .eq("pedido_id", pedido.id);

    const pencaItems = (items ?? []).filter((i) =>
      (i.nombre_producto ?? "").toLowerCase().includes("penca")
    );

    if (!pencaItems.length) return NextResponse.json({ error: "El pedido no tiene items de penca" }, { status: 400 });

    // 5. Generar código(s)
    const totalCodigos = pencaItems.reduce((s, i) => s + i.cantidad, 0);
    const codigos: string[] = [];
    for (let i = 0; i < totalCodigos; i++) codigos.push(generatePencaCode());

    // 6. Guardar en DB
    await db.from("penca_codigos").insert(
      codigos.map((codigo) => ({
        codigo,
        dlocal_payment_id: pid,
        email: pedido.email,
      }))
    );

    // 7. Enviar email via EmailJS
    const serviceId  = process.env.EMAILJS_SERVICE_ID  ?? "";
    const templateId = process.env.EMAILJS_TEMPLATE_ID ?? "";
    const publicKey  = process.env.EMAILJS_PUBLIC_KEY  ?? "";
    const privateKey = process.env.EMAILJS_PRIVATE_KEY ?? "";
    const pencaLink  = `${process.env.NEXT_PUBLIC_SUPABASE_URL ? "https://www.clubelbiouniversitario.com" : ""}/penca`;

    if (serviceId && templateId && publicKey) {
      await fetch("https://api.emailjs.com/api/v1.0/email/send", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          service_id:  serviceId,
          template_id: templateId,
          user_id:     publicKey,
          accessToken: privateKey,
          template_params: {
            to_email:       pedido.email,
            to_name:        pedido.nombre_cliente ?? "Cliente",
            penca_codigo:   codigos.join(", "),
            penca_cantidad: String(codigos.length),
            penca_link:     "https://www.clubelbiouniversitario.com/penca",
          },
        }),
      }).catch(() => {});
    }

    return NextResponse.json({ ok: true, codigos });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
