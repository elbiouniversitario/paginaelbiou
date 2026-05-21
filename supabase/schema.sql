-- =============================================
-- Elbio Universitario FC — Supabase Schema
-- Correr en: Supabase Dashboard > SQL Editor
-- =============================================

-- Jugadores
create table if not exists public.jugadores (
  id          uuid primary key default gen_random_uuid(),
  nombre      text not null,
  apellido    text not null,
  posicion    text not null check (posicion in ('Arquero','Defensor','Mediocampista','Delantero')),
  numero      integer not null,
  edad        integer not null,
  foto_url    text,
  created_at  timestamptz default now()
);

-- Partidos
create table if not exists public.partidos (
  id                   uuid primary key default gen_random_uuid(),
  rival                text not null,
  fecha                date not null,
  hora                 text not null,
  sede                 text not null,
  es_local             boolean not null default true,
  estado               text not null default 'programado'
                         check (estado in ('programado','en_curso','finalizado','suspendido')),
  resultado_local      integer,
  resultado_visitante  integer,
  competencia          text not null default 'Liga Regional',
  created_at           timestamptz default now()
);

-- Productos
create table if not exists public.productos (
  id          uuid primary key default gen_random_uuid(),
  nombre      text not null,
  descripcion text,
  precio      numeric(10,2) not null,
  foto_url    text,
  categoria   text not null check (categoria in ('Camisetas','Shorts','Accesorios','Calzado')),
  stock       integer not null default 0,
  destacado   boolean default false,
  created_at  timestamptz default now()
);

-- Pedidos
create table if not exists public.pedidos (
  id                 uuid primary key default gen_random_uuid(),
  email              text not null,
  total              numeric(10,2) not null,
  estado             text not null default 'pendiente'
                       check (estado in ('pendiente','pagado','cancelado','reembolsado')),
  dlocal_payment_id  text,
  dlocal_payment_url text,
  created_at         timestamptz default now()
);

-- Items de pedido
create table if not exists public.pedido_items (
  id               uuid primary key default gen_random_uuid(),
  pedido_id        uuid not null references public.pedidos(id) on delete cascade,
  producto_id      uuid not null references public.productos(id),
  cantidad         integer not null,
  precio_unitario  numeric(10,2) not null,
  talle            text,
  created_at       timestamptz default now()
);

-- =============================================
-- RLS (Row Level Security)
-- =============================================
alter table public.jugadores  enable row level security;
alter table public.partidos   enable row level security;
alter table public.productos  enable row level security;
alter table public.pedidos    enable row level security;
alter table public.pedido_items enable row level security;

-- Lectura pública para jugadores, partidos, productos
create policy "Lectura pública jugadores"  on public.jugadores  for select using (true);
create policy "Lectura pública partidos"   on public.partidos   for select using (true);
create policy "Lectura pública productos"  on public.productos  for select using (true);

-- Solo service_role puede escribir pedidos (desde el worker/API)
create policy "Service role pedidos"      on public.pedidos       for all using (auth.role() = 'service_role');
create policy "Service role pedido_items" on public.pedido_items  for all using (auth.role() = 'service_role');

-- =============================================
-- Seed inicial (opcional — datos de ejemplo)
-- =============================================
insert into public.productos (nombre, descripcion, precio, categoria, stock, destacado) values
  ('Camiseta Titular 2025',   'Camiseta oficial temporada 2025',        18500, 'Camisetas',   50, true),
  ('Camiseta Alternativa 2025','Camiseta alternativa edición limitada',  18500, 'Camisetas',   30, true),
  ('Camiseta Retro 1952',     'Edición especial año de fundación',       22000, 'Camisetas',   15, true),
  ('Short Oficial',           'Short oficial mismo modelo plantel',      9500,  'Shorts',      40, false),
  ('Bufanda Oficial',         'Bufanda tejida colores del club',         4500,  'Accesorios', 100, false),
  ('Gorra EU',                'Gorra con logo bordado, talle único',     5200,  'Accesorios',  60, false),
  ('Mochila Club',            'Mochila oficial con compartimentos',     14900,  'Accesorios',  20, false)
on conflict do nothing;
