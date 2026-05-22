-- =============================================
-- Portal Encargados — tabla_posiciones
-- =============================================

create table if not exists public.tabla_posiciones (
  id            uuid primary key default gen_random_uuid(),
  categoria     text not null check (categoria in ('Mayor','Reserva','Pre-Senior','Sub 20','Sub 18','Femenino')),
  competencia   text,
  posicion      int  not null,
  equipo        text not null,
  is_local_team boolean not null default false,
  pj  int not null default 0,
  pg  int not null default 0,
  pe  int not null default 0,
  pp  int not null default 0,
  gf  int not null default 0,
  gc  int not null default 0,
  pts int not null default 0,
  updated_at    timestamptz default now()
);

alter table public.tabla_posiciones enable row level security;

create policy "tabla_posiciones_public_read"
  on public.tabla_posiciones for select using (true);

create policy "tabla_posiciones_service_all"
  on public.tabla_posiciones for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');
