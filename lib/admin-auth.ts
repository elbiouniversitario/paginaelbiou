import { NextRequest } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";

// Valida el Bearer token de Supabase y que el usuario sea admin (profiles.es_admin).
// Devuelve el cliente service-role listo para usar, o null si no está autorizado.
export async function verifyAdmin(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return null;
  const db = createServerSupabase();
  const { data: { user } } = await db.auth.getUser(auth.slice(7));
  if (!user) return null;
  const { data: profile } = await db
    .from("profiles").select("es_admin").eq("id", user.id).single() as {
      data: { es_admin: boolean } | null; error: unknown;
    };
  return profile?.es_admin ? db : null;
}
