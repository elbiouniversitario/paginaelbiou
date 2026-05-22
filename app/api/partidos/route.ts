import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";

function verifyToken(body: Record<string, unknown>) {
  const expected = process.env.CARGA_TOKEN;
  if (!expected || body.token !== expected) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  return null;
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const authErr = verifyToken(body);
  if (authErr) return authErr;

  const { rival, fecha, hora, sede, es_local, competencia, categoria } = body;

  if (!rival || !fecha || !categoria) {
    return NextResponse.json({ error: "Datos incompletos" }, { status: 400 });
  }

  const db = createServerSupabase();
  const { error } = await db.from("partidos").insert({
    rival,
    fecha,
    hora:        hora        || null,
    sede:        sede        || null,
    es_local:    es_local    ?? true,
    competencia: competencia || "Liga Regional",
    categoria,
    estado:      "programado",
  } as never);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const authErr = verifyToken(body);
  if (authErr) return authErr;

  const { id, resultado_local, resultado_visitante, estado } = body;

  if (!id) return NextResponse.json({ error: "ID requerido" }, { status: 400 });

  const db = createServerSupabase();
  const { error } = await db.from("partidos").update({
    resultado_local,
    resultado_visitante,
    estado: estado ?? "finalizado",
  } as never).eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
