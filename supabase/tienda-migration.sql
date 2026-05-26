-- ============================================================
-- Tienda: clientes + pedidos
-- Run in Supabase SQL Editor
-- ============================================================

CREATE TABLE IF NOT EXISTS public.clientes_tienda (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre     text NOT NULL,
  email      text NOT NULL UNIQUE,
  telefono   text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.pedidos (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email           text NOT NULL,
  nombre_cliente  text NOT NULL,
  telefono        text NOT NULL,
  items           jsonb NOT NULL DEFAULT '[]',
  total           numeric NOT NULL DEFAULT 0,
  estado          text NOT NULL DEFAULT 'pendiente'
                    CHECK (estado IN ('pendiente', 'pagado', 'cancelado')),
  payment_id      text,
  created_at      timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS pedidos_email_idx ON public.pedidos (email);
CREATE INDEX IF NOT EXISTS pedidos_payment_id_idx ON public.pedidos (payment_id);

ALTER TABLE public.clientes_tienda ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pedidos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role all clientes_tienda" ON public.clientes_tienda
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "service_role all pedidos" ON public.pedidos
  FOR ALL USING (auth.role() = 'service_role');
