import { NextRequest, NextResponse } from "next/server";

const WORKER_URL = process.env.PAYMENT_WORKER_URL ?? "";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Si el worker de Cloudflare está configurado, lo usamos
    if (WORKER_URL) {
      const res = await fetch(`${WORKER_URL}/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      return NextResponse.json(data, { status: res.status });
    }

    // Modo demo: sin worker configurado
    return NextResponse.json(
      {
        error: "Pasarela de pago no configurada",
        info: "Configurá PAYMENT_WORKER_URL en las variables de entorno de Vercel",
      },
      { status: 503 }
    );
  } catch {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
