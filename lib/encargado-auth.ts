import { createHmac, timingSafeEqual } from "crypto";

const SECRET = process.env.ENCARGADO_SECRET ?? "elbio-encargado-2026";

export type CatSlug = "mayor" | "reserva" | "presenior" | "sub20" | "sub18" | "femenino";

export const CATEGORIES: Record<CatSlug, { name: string; dbName: string; password: string }> = {
  mayor:     { name: "Mayor",      dbName: "Mayor",      password: "MAYOR2002"     },
  reserva:   { name: "Reserva",    dbName: "Reserva",    password: "RESERVA2002"   },
  presenior: { name: "Pre Senior", dbName: "Pre-Senior", password: "PRESENIOR2002" },
  sub20:     { name: "Sub 20",     dbName: "Sub 20",     password: "SUB202002"     },
  sub18:     { name: "Sub 18",     dbName: "Sub 18",     password: "SUB182002"     },
  femenino:  { name: "Femenino",   dbName: "Femenino",   password: "FEMENINO2002"  },
};

export function makeToken(category: CatSlug): string {
  const exp = Date.now() + 7 * 24 * 60 * 60 * 1000;
  const body = JSON.stringify({ category, exp });
  const sig = createHmac("sha256", SECRET).update(body).digest("hex");
  return `${Buffer.from(body).toString("base64url")}.${sig}`;
}

export function verifyToken(token: string): CatSlug | null {
  try {
    const dotIdx = token.lastIndexOf(".");
    if (dotIdx === -1) return null;
    const bodyB64 = token.slice(0, dotIdx);
    const sig = token.slice(dotIdx + 1);
    const body = Buffer.from(bodyB64, "base64url").toString();
    const expectedSig = createHmac("sha256", SECRET).update(body).digest("hex");
    if (sig.length !== expectedSig.length) return null;
    const sigBuf = Buffer.from(sig, "hex");
    const expectedBuf = Buffer.from(expectedSig, "hex");
    if (!timingSafeEqual(sigBuf, expectedBuf)) return null;
    const { category, exp } = JSON.parse(body) as { category: CatSlug; exp: number };
    if (Date.now() > exp) return null;
    if (!CATEGORIES[category]) return null;
    return category;
  } catch {
    return null;
  }
}
