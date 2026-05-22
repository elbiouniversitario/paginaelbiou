import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";

export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const token = auth.slice(7);

  try {
    const db = createServerSupabase();

    // Verifica el token y obtiene el usuario
    const { data: { user }, error: userErr } = await db.auth.getUser(token);
    if (userErr || !user) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 });
    }

    const { data: profile, error } = await db
      .from("profiles")
      .select("habilitado, es_admin")
      .eq("id", user.id)
      .single();

    if (error || !profile) {
      // Si no hay perfil aún, devolvemos pendiente
      return NextResponse.json({ habilitado: false, es_admin: false });
    }

    return NextResponse.json({
      habilitado: profile.habilitado ?? false,
      es_admin:   (profile as unknown as { es_admin: boolean }).es_admin ?? false,
    });
  } catch {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
