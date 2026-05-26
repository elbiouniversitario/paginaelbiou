import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";

const WORKER_URL = process.env.PAYMENT_WORKER_URL ?? "";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as Record<string, unknown>;

    // Relay to worker first
    if (WORKER_URL) {
      await fetch(`${WORKER_URL}/webhook`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(body),
      });
    }

    // Update order status in our pedidos table
    const paymentId = (body.data as Record<string, unknown>)?.id as string
      ?? body.payment_id as string
      ?? body.id as string;

    const rawStatus = (body.data as Record<string, unknown>)?.status as string
      ?? body.status as string;

    if (paymentId && rawStatus) {
      const estado =
        rawStatus === "PAID"     ? "pagado"    :
        rawStatus === "REJECTED" ? "cancelado" :
        rawStatus === "EXPIRED"  ? "cancelado" : null;

      if (estado) {
        const db = createServerSupabase();
        await db.from("pedidos").update({ estado }).eq("payment_id", paymentId);
      }
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Webhook error" }, { status: 500 });
  }
}
