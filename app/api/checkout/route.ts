import { NextRequest, NextResponse } from "next/server";

const WORKER_URL = process.env.PAYMENT_WORKER_URL ?? "";

export async function POST(req: NextRequest) {
  if (!WORKER_URL) {
    return NextResponse.json(
      { error: "Pasarela de pago no configurada. Contactá al administrador." },
      { status: 503 }
    );
  }

  try {
    const body = await req.json();
    const res  = await fetch(`${WORKER_URL}/checkout`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(body),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ error: "Error al conectar con la pasarela de pago." }, { status: 500 });
  }
}
