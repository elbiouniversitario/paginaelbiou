/**
 * Cloudflare Worker — dLocal Go Payment Gateway
 * Deploy: cd workers && wrangler deploy
 *
 * Secrets (wrangler secret put <NAME>):
 *   DLOCAL_API_KEY        → API key de dLocal Go
 *   DLOCAL_SECRET_KEY     → Secret key de dLocal Go
 *   SUPABASE_URL          → URL del proyecto Supabase
 *   SUPABASE_SERVICE_KEY  → service_role key de Supabase
 *   CALLMEBOT_API_KEY     → clave de callmebot.com (para WhatsApp)
 *   WPP_ADMIN_NUMBER      → número sin + ni espacios, ej: 59899019892
 *
 * Var (wrangler.toml [vars]):
 *   SITE_URL              → https://paginaelbiou.vercel.app
 */

export interface Env {
  DLOCAL_API_KEY:       string;
  DLOCAL_SECRET_KEY:    string;
  SUPABASE_URL:         string;
  SUPABASE_SERVICE_KEY: string;
  SITE_URL:             string;
  CALLMEBOT_API_KEY:    string;
  WPP_ADMIN_NUMBER:     string;
}

interface CartItemPayload {
  producto: { id: string; nombre: string; precio: number };
  cantidad: number;
  talle?: string;
}

interface CheckoutPayload {
  items:           CartItemPayload[];
  email:           string;
  nombre_cliente?: string;
  telefono?:       string;
}

interface DbProduct { id: string; nombre: string; precio: number }

const DLOCAL_API = "https://api.dlocalgo.com/v1";

// ── Signature generation (dLocal V3-HMAC-SHA256) ─────────────────────────

async function generateSignature(
  login: string, timestamp: number, nonce: string,
  body: object, secret: string
): Promise<string> {
  const encoder  = new TextEncoder();
  const key      = await crypto.subtle.importKey(
    "raw", encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
  );
  const message  = login + timestamp.toString() + nonce + JSON.stringify(body);
  const sig      = await crypto.subtle.sign("HMAC", key, encoder.encode(message));
  return btoa(String.fromCharCode(...new Uint8Array(sig)));
}

// ── Fetch real prices from Supabase ────────────────────────────────────────

async function fetchRealPrices(
  productIds: string[], env: Env
): Promise<Record<string, DbProduct>> {
  const ids   = productIds.map((id) => `"${id}"`).join(",");
  const res   = await fetch(
    `${env.SUPABASE_URL}/rest/v1/productos?id=in.(${ids})&select=id,nombre,precio&activo=eq.true`,
    { headers: { apikey: env.SUPABASE_SERVICE_KEY, Authorization: `Bearer ${env.SUPABASE_SERVICE_KEY}` } }
  );
  const rows  = await res.json() as DbProduct[];
  return Object.fromEntries(rows.map((p) => [p.id, p]));
}

// ── Create dLocal payment ──────────────────────────────────────────────────

async function createDlocalPayment(
  payload: CheckoutPayload,
  verifiedItems: CartItemPayload[],
  env: Env
): Promise<{ payment_url: string; payment_id: string }> {
  const total = verifiedItems.reduce((s, i) => s + i.producto.precio * i.cantidad, 0);

  const body = {
    amount:            total,
    currency:          "UYU",
    country:           "UY",
    description:       `EFU Tienda — ${verifiedItems.length} artículo(s)`,
    back_url_success:  `${env.SITE_URL}/tienda/gracias`,
    back_url_pending:  `${env.SITE_URL}/tienda/pendiente`,
    back_url_rejected: `${env.SITE_URL}/tienda/error`,
    notification_url:  `${env.SITE_URL}/api/webhook`,
    payer:             { email: payload.email },
  };

  const timestamp = Date.now();
  const nonce     = crypto.randomUUID();
  const signature = await generateSignature(
    env.DLOCAL_API_KEY, timestamp, nonce, body, env.DLOCAL_SECRET_KEY
  );

  const res = await fetch(`${DLOCAL_API}/payments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Login":      env.DLOCAL_API_KEY,
      "X-Trans-Key":  env.DLOCAL_SECRET_KEY,
      Authorization:  `V3-HMAC-SHA256 login=${env.DLOCAL_API_KEY}, timestamp=${timestamp}, nonce=${nonce}, signature=${signature}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`dLocal error ${res.status}: ${err}`);
  }

  const data = await res.json() as { redirect_url: string; id: string };
  return { payment_url: data.redirect_url, payment_id: data.id };
}

// ── Save order to Supabase ────────────────────────────────────────────────

async function saveOrder(
  payload: CheckoutPayload,
  verifiedItems: CartItemPayload[],
  paymentId: string,
  paymentUrl: string,
  env: Env
): Promise<string> {
  const total = verifiedItems.reduce((s, i) => s + i.producto.precio * i.cantidad, 0);

  const pedidoRes = await fetch(`${env.SUPABASE_URL}/rest/v1/pedidos`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey:         env.SUPABASE_SERVICE_KEY,
      Authorization:  `Bearer ${env.SUPABASE_SERVICE_KEY}`,
      Prefer:         "return=representation",
    },
    body: JSON.stringify({
      email:              payload.email,
      nombre_cliente:     payload.nombre_cliente ?? null,
      telefono:           payload.telefono ?? null,
      total,
      estado:             "pendiente",
      dlocal_payment_id:  paymentId,
      dlocal_payment_url: paymentUrl,
    }),
  });

  const pedidos  = await pedidoRes.json() as { id: string }[];
  const pedidoId = pedidos[0]?.id;
  if (!pedidoId) throw new Error("No se pudo crear el pedido");

  await fetch(`${env.SUPABASE_URL}/rest/v1/pedido_items`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey:         env.SUPABASE_SERVICE_KEY,
      Authorization:  `Bearer ${env.SUPABASE_SERVICE_KEY}`,
    },
    body: JSON.stringify(
      verifiedItems.map((i) => ({
        pedido_id:       pedidoId,
        producto_id:     i.producto.id,
        cantidad:        i.cantidad,
        precio_unitario: i.producto.precio,
        talle:           i.talle ?? null,
        nombre_producto: i.producto.nombre,
      }))
    ),
  });

  return pedidoId;
}

// ── WhatsApp notification ─────────────────────────────────────────────────

async function sendWppNotification(
  payload: CheckoutPayload,
  verifiedItems: CartItemPayload[],
  total: number,
  env: Env
): Promise<void> {
  if (!env.CALLMEBOT_API_KEY || !env.WPP_ADMIN_NUMBER) return;
  const productos = verifiedItems.map((i) => `${i.cantidad}x ${i.producto.nombre}${i.talle ? ` (${i.talle})` : ""}`).join(", ");
  const nombre    = payload.nombre_cliente ?? payload.email;
  const msg       = `*Nueva compra EFU!*\nCliente: ${nombre}\nProductos: ${productos}\nTotal: $${total.toLocaleString("es-UY")} UYU\nEmail: ${payload.email}${payload.telefono ? `\nWPP: ${payload.telefono}` : ""}`;
  await fetch(
    `https://api.callmebot.com/whatsapp.php?phone=${env.WPP_ADMIN_NUMBER}&text=${encodeURIComponent(msg)}&apikey=${env.CALLMEBOT_API_KEY}`
  ).catch(() => {});
}

// ── Main handler ──────────────────────────────────────────────────────────

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url         = new URL(request.url);
    const corsHeaders = {
      "Access-Control-Allow-Origin":  env.SITE_URL ?? "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    // ── POST /checkout ────────────────────────────────────────────────────
    if (url.pathname === "/checkout" && request.method === "POST") {
      try {
        const payload = await request.json() as CheckoutPayload;

        if (!payload.items?.length || !payload.email) {
          return Response.json(
            { error: "Datos incompletos" },
            { status: 400, headers: corsHeaders }
          );
        }

        // Verify prices from database — never trust client-provided prices
        const productIds   = payload.items.map((i) => i.producto.id);
        const priceMap     = await fetchRealPrices(productIds, env);

        const verifiedItems: CartItemPayload[] = payload.items.map((i) => {
          const db = priceMap[i.producto.id];
          if (!db) throw new Error(`Producto no encontrado: ${i.producto.id}`);
          return { ...i, producto: { id: db.id, nombre: db.nombre, precio: db.precio } };
        });

        const { payment_url, payment_id } = await createDlocalPayment(payload, verifiedItems, env);
        await saveOrder(payload, verifiedItems, payment_id, payment_url, env);

        return Response.json({ payment_url }, { headers: corsHeaders });
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Error desconocido";
        console.error("[checkout]", msg);
        return Response.json(
          { error: "Error al procesar el pago" },
          { status: 500, headers: corsHeaders }
        );
      }
    }

    // ── POST /webhook — dLocal notifica cambios de estado ─────────────────
    if (url.pathname === "/webhook" && request.method === "POST") {
      try {
        const body = await request.json() as {
          id: string; status: string; amount?: number;
          order?: { email?: string; name?: string; phone?: string };
        };

        const newStatus = body.status === "PAID"      ? "pagado"
                        : body.status === "CANCELLED"  ? "cancelado"
                        :                                "pendiente";

        // Update order status in Supabase
        await fetch(
          `${env.SUPABASE_URL}/rest/v1/pedidos?dlocal_payment_id=eq.${body.id}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              apikey:         env.SUPABASE_SERVICE_KEY,
              Authorization:  `Bearer ${env.SUPABASE_SERVICE_KEY}`,
            },
            body: JSON.stringify({ estado: newStatus }),
          }
        );

        // WhatsApp notification on successful payment
        if (newStatus === "pagado") {
          // Fetch order items from Supabase for the notification
          const itemsRes = await fetch(
            `${env.SUPABASE_URL}/rest/v1/pedido_items?pedido_id=eq.${body.id}&select=cantidad,precio_unitario,talle,nombre_producto`,
            {
              headers: {
                apikey:        env.SUPABASE_SERVICE_KEY,
                Authorization: `Bearer ${env.SUPABASE_SERVICE_KEY}`,
              },
            }
          );

          // Also get pedido to find the order by dlocal id
          const pedidosRes = await fetch(
            `${env.SUPABASE_URL}/rest/v1/pedidos?dlocal_payment_id=eq.${body.id}&select=id,email,nombre_cliente,telefono,total`,
            {
              headers: {
                apikey:        env.SUPABASE_SERVICE_KEY,
                Authorization: `Bearer ${env.SUPABASE_SERVICE_KEY}`,
              },
            }
          );

          const pedidos  = await pedidosRes.json() as { id: string; email: string; nombre_cliente: string | null; telefono: string | null; total: number }[];
          const pedido   = pedidos[0];
          const items    = await itemsRes.json() as { cantidad: number; precio_unitario: number; talle: string | null; nombre_producto: string | null }[];

          if (pedido) {
            const fakePayload: CheckoutPayload = {
              email:           pedido.email,
              nombre_cliente:  pedido.nombre_cliente ?? undefined,
              telefono:        pedido.telefono ?? undefined,
              items: items.map((i) => ({
                cantidad: i.cantidad,
                talle: i.talle ?? undefined,
                producto: { id: "", nombre: i.nombre_producto ?? "Producto", precio: i.precio_unitario },
              })),
            };
            await sendWppNotification(fakePayload, fakePayload.items, pedido.total, env);
          }
        }

        return Response.json({ ok: true });
      } catch (err) {
        console.error("[webhook]", err);
        return Response.json({ error: "Webhook error" }, { status: 500 });
      }
    }

    return Response.json({ error: "Not found" }, { status: 404 });
  },
};
