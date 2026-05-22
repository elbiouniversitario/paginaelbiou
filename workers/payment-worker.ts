/**
 * Cloudflare Worker — dLocal Go Payment Gateway
 * Deploy: wrangler deploy
 *
 * Env vars necesarias en Cloudflare Dashboard:
 *   DLOCAL_API_KEY        → tu API key de dLocal Go
 *   DLOCAL_SECRET_KEY     → tu Secret key de dLocal Go
 *   SUPABASE_URL          → URL de tu proyecto Supabase
 *   SUPABASE_SERVICE_KEY  → service_role key de Supabase
 *   SITE_URL              → URL de producción (ej: https://paginaelbiou.vercel.app)
 */

export interface Env {
  DLOCAL_API_KEY: string;
  DLOCAL_SECRET_KEY: string;
  SUPABASE_URL: string;
  SUPABASE_SERVICE_KEY: string;
  SITE_URL: string;
  CALLMEBOT_API_KEY: string;
  WPP_ADMIN_NUMBER: string;
}

interface CartItemPayload {
  producto: { id: string; nombre: string; precio: number };
  cantidad: number;
  talle?: string;
}

interface CheckoutPayload {
  items: CartItemPayload[];
  email: string;
  nombre_cliente?: string;
  telefono?: string;
}

const DLOCAL_API = "https://api.dlocalgo.com/v1";

async function createDlocalPayment(
  payload: CheckoutPayload,
  env: Env
): Promise<{ payment_url: string; payment_id: string }> {
  const total = payload.items.reduce(
    (sum, i) => sum + i.producto.precio * i.cantidad,
    0
  );

  const body = {
    amount: total,
    currency: "ARS",
    country: "AR",
    description: `Compra Elbio Universitario FC — ${payload.items.length} artículo(s)`,
    back_url_success: `${env.SITE_URL}/tienda/gracias`,
    back_url_pending: `${env.SITE_URL}/tienda/pendiente`,
    back_url_rejected: `${env.SITE_URL}/tienda/error`,
    notification_url: `${env.SITE_URL}/api/webhook`,
    payer: { email: payload.email },
  };

  const signature = await generateSignature(body, env.DLOCAL_SECRET_KEY);

  const res = await fetch(`${DLOCAL_API}/payments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Login": env.DLOCAL_API_KEY,
      "X-Trans-Key": env.DLOCAL_SECRET_KEY,
      Authorization: `V3-HMAC-SHA256 login=${env.DLOCAL_API_KEY}, timestamp=${Date.now()}, nonce=${crypto.randomUUID()}, signature=${signature}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`dLocal Go error: ${err}`);
  }

  const data = await res.json() as { redirect_url: string; id: string };
  return { payment_url: data.redirect_url, payment_id: data.id };
}

async function generateSignature(payload: object, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const msgData = encoder.encode(JSON.stringify(payload));
  const key = await crypto.subtle.importKey("raw", keyData, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, msgData);
  return btoa(String.fromCharCode(...new Uint8Array(sig)));
}

async function sendWppNotification(
  payload: CheckoutPayload,
  total: number,
  env: Env
): Promise<void> {
  if (!env.CALLMEBOT_API_KEY || !env.WPP_ADMIN_NUMBER) return;
  const items  = payload.items.map((i) => `${i.cantidad}x ${i.producto.nombre}`).join(", ");
  const nombre = payload.nombre_cliente ?? payload.email;
  const msg    = `🛒 *Nueva compra EU!*\nCliente: ${nombre}\nProductos: ${items}\nTotal: $${total.toLocaleString("es-UY")}\nEmail: ${payload.email}${payload.telefono ? `\nWPP: ${payload.telefono}` : ""}`;
  const url    = `https://api.callmebot.com/whatsapp.php?phone=${env.WPP_ADMIN_NUMBER}&text=${encodeURIComponent(msg)}&apikey=${env.CALLMEBOT_API_KEY}`;
  await fetch(url).catch(() => {});
}

async function saveOrder(
  payload: CheckoutPayload,
  paymentId: string,
  paymentUrl: string,
  env: Env
): Promise<string> {
  const total = payload.items.reduce(
    (sum, i) => sum + i.producto.precio * i.cantidad,
    0
  );

  const pedidoRes = await fetch(`${env.SUPABASE_URL}/rest/v1/pedidos`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: env.SUPABASE_SERVICE_KEY,
      Authorization: `Bearer ${env.SUPABASE_SERVICE_KEY}`,
      Prefer: "return=representation",
    },
    body: JSON.stringify({
      email:          payload.email,
      nombre_cliente: payload.nombre_cliente ?? null,
      telefono:       payload.telefono ?? null,
      total,
      estado: "pendiente",
      dlocal_payment_id:  paymentId,
      dlocal_payment_url: paymentUrl,
    }),
  });

  const pedidos = await pedidoRes.json() as { id: string }[];
  const pedidoId = pedidos[0].id;

  await fetch(`${env.SUPABASE_URL}/rest/v1/pedido_items`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: env.SUPABASE_SERVICE_KEY,
      Authorization: `Bearer ${env.SUPABASE_SERVICE_KEY}`,
    },
    body: JSON.stringify(
      payload.items.map((i) => ({
        pedido_id: pedidoId,
        producto_id: i.producto.id,
        cantidad: i.cantidad,
        precio_unitario: i.producto.precio,
        talle: i.talle,
      }))
    ),
  });

  return pedidoId;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const corsHeaders = {
      "Access-Control-Allow-Origin": env.SITE_URL,
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    // POST /checkout
    if (url.pathname === "/checkout" && request.method === "POST") {
      try {
        const payload = await request.json() as CheckoutPayload;

        if (!payload.items?.length || !payload.email) {
          return Response.json({ error: "Datos incompletos" }, { status: 400, headers: corsHeaders });
        }

        const { payment_url, payment_id } = await createDlocalPayment(payload, env);
        await saveOrder(payload, payment_id, payment_url, env);

        return Response.json({ payment_url }, { headers: corsHeaders });
      } catch (err) {
        console.error(err);
        return Response.json({ error: "Error al procesar el pago" }, { status: 500, headers: corsHeaders });
      }
    }

    // POST /webhook — dLocal Go notifica cambios de estado
    if (url.pathname === "/webhook" && request.method === "POST") {
      try {
        const body = await request.json() as {
          id: string;
          status: string;
          order?: { email?: string; name?: string; phone?: string };
          items?: CartItemPayload[];
          amount?: number;
        };
        const newStatus = body.status === "PAID" ? "pagado" : body.status === "CANCELLED" ? "cancelado" : "pendiente";

        await fetch(`${env.SUPABASE_URL}/rest/v1/pedidos?dlocal_payment_id=eq.${body.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            apikey: env.SUPABASE_SERVICE_KEY,
            Authorization: `Bearer ${env.SUPABASE_SERVICE_KEY}`,
          },
          body: JSON.stringify({ estado: newStatus }),
        });

        if (newStatus === "pagado") {
          await sendWppNotification(
            {
              email: body.order?.email ?? "desconocido",
              nombre_cliente: body.order?.name,
              telefono: body.order?.phone,
              items: body.items ?? [],
            },
            body.amount ?? 0,
            env
          );
        }

        return Response.json({ ok: true });
      } catch (err) {
        return Response.json({ error: "Webhook error" }, { status: 500 });
      }
    }

    return Response.json({ error: "Not found" }, { status: 404 });
  },
};
