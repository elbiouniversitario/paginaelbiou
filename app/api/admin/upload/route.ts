import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";

export async function POST(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = createServerSupabase();
  const { data: { user } } = await db.auth.getUser(auth.slice(7));
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await db
    .from("profiles").select("es_admin").eq("id", user.id).single() as {
      data: { es_admin: boolean } | null; error: unknown;
    };
  if (!profile?.es_admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const bucket = (formData.get("bucket") as string) || "productos";

  if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

  const ext  = file.name.split(".").pop() ?? "jpg";
  const path = `${Date.now()}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error: uploadErr } = await db.storage
    .from(bucket)
    .upload(path, buffer, { contentType: file.type, upsert: false });

  if (uploadErr) return NextResponse.json({ error: uploadErr.message }, { status: 500 });

  const { data: urlData } = db.storage.from(bucket).getPublicUrl(path);
  return NextResponse.json({ url: urlData.publicUrl });
}
