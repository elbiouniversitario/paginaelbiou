import { NextRequest, NextResponse } from "next/server";
import { CATEGORIES, makeToken, type CatSlug } from "@/lib/encargado-auth";

export async function POST(req: NextRequest) {
  const { category, password } = await req.json() as { category: string; password: string };
  const cat = CATEGORIES[category as CatSlug];
  if (!cat || password !== cat.password) {
    return NextResponse.json({ error: "Contraseña incorrecta" }, { status: 401 });
  }
  const token = makeToken(category as CatSlug);
  return NextResponse.json({ token, category, name: cat.name });
}
