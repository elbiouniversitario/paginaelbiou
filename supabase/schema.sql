-- =============================================
-- Elbio Fernández Universitario — Supabase Schema v2
-- Correr en: Supabase Dashboard > SQL Editor > New Query
-- =============================================

-- =============================================
-- TABLA: profiles (portal de jugadores)
-- Se crea automáticamente al hacer signup.
-- Admin habilita con: habilitado = true
-- =============================================
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  nombre      text,
  posicion    text check (posicion in ('Arquero','Defensor','Mediocampista','Delantero')),
  numero      integer,
  categoria   text check (categoria in ('Mayor','Reserva','Pre-Senior','Sub 20','Sub 18','Femenino')),
  foto_url    text,
  habilitado  boolean not null default false,
  es_admin    boolean not null default false,
  created_at  timestamptz default now()
);

-- Función: crea profile automáticamente al registrarse
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, nombre)
  values (new.id, coalesce(new.raw_user_meta_data->>'nombre', ''));
  return new;
end;
$$ language plpgsql security definer;

-- Trigger que dispara la función al registrarse
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- =============================================
-- TABLA: jugadores (plantel público)
-- =============================================
create table if not exists public.jugadores (
  id          uuid primary key default gen_random_uuid(),
  nombre      text not null,
  apellido    text not null,
  posicion    text not null check (posicion in ('Arquero','Defensor','Mediocampista','Delantero')),
  numero      integer not null,
  edad        integer,
  foto_url    text,
  created_at  timestamptz default now()
);

-- =============================================
-- TABLA: partidos
-- Incluye columna 'categoria' para filtrar por división
-- =============================================
create table if not exists public.partidos (
  id                   uuid primary key default gen_random_uuid(),
  rival                text not null,
  fecha                date not null,
  hora                 text,
  sede                 text,
  es_local             boolean not null default true,
  estado               text not null default 'programado'
                         check (estado in ('programado','en_curso','finalizado','suspendido')),
  resultado_local      integer,
  resultado_visitante  integer,
  competencia          text default 'Liga Regional',
  categoria            text not null default 'Mayor'
                         check (categoria in ('Mayor','Reserva','Pre-Senior','Sub 20','Sub 18','Femenino')),
  created_at           timestamptz default now()
);

-- =============================================
-- TABLA: productos
-- 'talles' es array de strings, 'activo' oculta sin borrar
-- =============================================
create table if not exists public.productos (
  id          uuid primary key default gen_random_uuid(),
  nombre      text not null,
  descripcion text,
  precio      numeric(10,2) not null,
  foto_url    text,
  categoria   text not null check (categoria in ('Camisetas','Shorts','Accesorios','Calzado')),
  talles      text[] default '{}',
  stock       integer not null default 0,
  destacado   boolean default false,
  activo      boolean default true,
  created_at  timestamptz default now()
);

-- =============================================
-- TABLA: pedidos
-- =============================================
create table if not exists public.pedidos (
  id                 uuid primary key default gen_random_uuid(),
  nombre_cliente     text,
  email              text not null,
  telefono           text,
  total              numeric(10,2) not null,
  estado             text not null default 'pendiente'
                       check (estado in ('pendiente','pagado','cancelado','reembolsado')),
  dlocal_payment_id  text,
  dlocal_payment_url text,
  notificado_wpp     boolean default false,
  created_at         timestamptz default now()
);

-- =============================================
-- TABLA: pedido_items
-- =============================================
create table if not exists public.pedido_items (
  id               uuid primary key default gen_random_uuid(),
  pedido_id        uuid not null references public.pedidos(id) on delete cascade,
  producto_id      uuid not null references public.productos(id),
  cantidad         integer not null,
  precio_unitario  numeric(10,2) not null,
  talle            text,
  nombre_producto  text,
  created_at       timestamptz default now()
);

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================
alter table public.profiles     enable row level security;
alter table public.jugadores    enable row level security;
alter table public.partidos     enable row level security;
alter table public.productos    enable row level security;
alter table public.pedidos      enable row level security;
alter table public.pedido_items enable row level security;

-- Jugadores: cualquiera puede leer
create policy "public_read_jugadores"
  on public.jugadores for select using (true);

-- Partidos: cualquiera puede leer
create policy "public_read_partidos"
  on public.partidos for select using (true);

-- Partidos: service_role escribe (carga de partidos con token + admin)
create policy "service_write_partidos"
  on public.partidos for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

-- Productos: solo activos son públicos
create policy "public_read_productos_activos"
  on public.productos for select using (activo = true);

-- Productos: service_role puede todo (admin panel)
create policy "service_all_productos"
  on public.productos for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

-- Pedidos: solo service_role (Cloudflare Worker)
create policy "service_all_pedidos"
  on public.pedidos for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

create policy "service_all_pedido_items"
  on public.pedido_items for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

-- Profiles: cada usuario ve y edita el suyo
create policy "user_read_own_profile"
  on public.profiles for select using (auth.uid() = id);

create policy "user_update_own_profile"
  on public.profiles for update using (auth.uid() = id)
  with check (auth.uid() = id);

-- Profiles: admin ve y edita todos
create policy "admin_read_all_profiles"
  on public.profiles for select
  using (exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.es_admin = true
  ));

create policy "admin_update_all_profiles"
  on public.profiles for update
  using (exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.es_admin = true
  ));

-- =============================================
-- STORAGE BUCKETS
-- Correr estas líneas en SQL Editor también
-- =============================================
insert into storage.buckets (id, name, public)
values ('productos', 'productos', true)
on conflict do nothing;

insert into storage.buckets (id, name, public)
values ('jugadores', 'jugadores', true)
on conflict do nothing;

-- Storage: upload permitido solo para service_role
create policy "service_upload_productos"
  on storage.objects for insert
  with check (bucket_id = 'productos' and auth.role() = 'service_role');

create policy "public_read_productos_storage"
  on storage.objects for select
  using (bucket_id = 'productos');

create policy "service_upload_jugadores"
  on storage.objects for insert
  with check (bucket_id = 'jugadores' and auth.role() = 'service_role');

create policy "public_read_jugadores_storage"
  on storage.objects for select
  using (bucket_id = 'jugadores');

-- =============================================
-- SEED: productos de ejemplo
-- =============================================
insert into public.productos (nombre, descripcion, precio, categoria, talles, stock, destacado) values
  ('Camiseta Titular 2025',      'Camiseta oficial temporada 2025. Tecnología secado rápido.',           18500, 'Camisetas', '{"S","M","L","XL","XXL"}', 50, true),
  ('Camiseta Alternativa 2025',  'Camiseta alternativa edición limitada temporada 2025.',                18500, 'Camisetas', '{"S","M","L","XL"}',       30, true),
  ('Camiseta Retro 2013',        'Edición especial conmemorativa del título Divisional C.',              22000, 'Camisetas', '{"S","M","L","XL"}',       15, true),
  ('Short Oficial',              'Short oficial, mismo modelo que usa el plantel.',                       9500, 'Shorts',    '{"S","M","L","XL","XXL"}', 40, false),
  ('Bufanda Oficial',            'Bufanda tejida con los colores del club.',                              4500, 'Accesorios','{}',                       100, false),
  ('Gorra EU',                   'Gorra con logo bordado, regulable, talle único.',                      5200, 'Accesorios','{}',                        60, false),
  ('Mochila Club',               'Mochila oficial con compartimento para botines.',                     14900, 'Accesorios','{}',                        20, false)
on conflict do nothing;
