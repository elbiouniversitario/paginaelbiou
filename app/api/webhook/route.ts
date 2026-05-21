import { NextRequest, NextResponse } from "next/server";

// dLocal Go nos notifica aquí cuando cambia el estado del pago
// Redirigimos al Cloudflare Worker para que actualice Supabase
const WORKER_URL = process.env.PAYMENT_WORKER_URL ?? "";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (WORKER_URL) {
      await fetch(`${WORKER_URL}/webhook`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Webhook error" }, { status: 500 });
  }
}
