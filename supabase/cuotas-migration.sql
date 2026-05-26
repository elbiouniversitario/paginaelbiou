-- ── PLANS ──────────────────────────────────────────────────────────
create table if not exists public.plans (
  id                    uuid primary key default gen_random_uuid(),
  slug                  text unique,
  label                 text not null,
  price                 numeric(10,2) not null default 0,
  active                boolean not null default true,
  visible               boolean not null default true,
  dlocal_checkout_token text,
  created_at            timestamptz default now()
);
alter table public.plans enable row level security;
create policy "plans_public_read" on public.plans for select using (true);

-- ── MEMBERS ────────────────────────────────────────────────────────
create table if not exists public.members (
  id                     uuid primary key default gen_random_uuid(),
  user_id                uuid references auth.users(id) on delete set null,
  member_number          text unique,
  name                   text not null,
  email                  text,
  phone                  text,
  address                text,
  plan_id                uuid references public.plans(id) on delete set null,
  status                 text not null default 'active',
  joined_at              date default current_date,
  dlocal_customer_id     text,
  dlocal_subscription_id text,
  created_at             timestamptz default now(),
  updated_at             timestamptz default now()
);
alter table public.members enable row level security;
create policy "members_own_read"    on public.members for select using (auth.uid() = user_id);
create policy "members_own_update"  on public.members for update using (auth.uid() = user_id);
create policy "members_service_all" on public.members using (true) with check (true);

-- ── PAYMENTS ───────────────────────────────────────────────────────
create table if not exists public.payments (
  id                uuid primary key default gen_random_uuid(),
  member_id         uuid references public.members(id) on delete cascade,
  plan_id           uuid references public.plans(id) on delete set null,
  amount            numeric(10,2),
  currency          text default 'UYU',
  status            text default 'pending',
  payment_date      timestamptz,
  period_month      int,
  period_year       int,
  dlocal_payment_id text,
  dlocal_order_id   text,
  notes             text,
  created_at        timestamptz default now()
);
alter table public.payments enable row level security;
create policy "payments_own_read" on public.payments
  for select using (
    member_id in (select id from public.members where user_id = auth.uid())
  );
create policy "payments_service_all" on public.payments using (true) with check (true);

-- ── MEMBER_SUMMARY VIEW ────────────────────────────────────────────
create or replace view public.member_summary as
select
  m.id, m.user_id, m.member_number, m.name, m.email,
  m.phone, m.address, m.status, m.joined_at, m.plan_id,
  m.dlocal_subscription_id,
  p.label as plan_label,
  p.price as plan_price,
  p.slug  as plan_slug,
  max(pay.payment_date) as last_payment_date,
  greatest(0,
    (extract(year  from now())::int - extract(year  from max(pay.payment_date))::int) * 12
    + extract(month from now())::int - extract(month from max(pay.payment_date))::int
  ) as overdue_months,
  m.created_at
from public.members m
left join public.plans p on p.id = m.plan_id
left join public.payments pay on pay.member_id = m.id and pay.status = 'completed'
group by m.id, m.user_id, m.member_number, m.name, m.email,
  m.phone, m.address, m.status, m.joined_at, m.plan_id,
  m.dlocal_subscription_id, p.label, p.price, p.slug, m.created_at;

-- ── PLANS DATA ─────────────────────────────────────────────────────
insert into public.plans (id, slug, label, price, active, visible, dlocal_checkout_token, created_at) values
  ('e87acc91-b0bf-4792-a021-b9d4aab44ce8','futbol-mayor-2026','Futbol Mayor 2026',1500,true,true,'QsWWEBiySqapj56mahkCav3pd1Iev6iO','2026-05-13T17:04:57.89672+00:00'),
  ('93961521-ed41-4fc7-86d8-81dcd9587705','prueba','Prueba22',50,true,false,'Ym6wJ1dzuvLz2sLUH79lnVjPRBNaUvO8','2026-05-13T02:49:46.524173+00:00'),
  ('0d96b671-7822-4c76-a352-60114157e28c','pago-a-voluntad-mp4jxggv','Pago a voluntad',1,true,false,'b3Blbl9saW5rOm1pZDoyMTgzODk=','2026-05-13T21:08:27.668244+00:00')
on conflict (id) do nothing;

-- ── MEMBERS DATA (user_ids mapeados al nuevo Supabase) ─────────────
insert into public.members (id, user_id, member_number, name, email, plan_id, status, joined_at, dlocal_subscription_id, created_at, updated_at) values
  ('0aa3c7d0-d107-42c9-851f-5c11a7a3b29f','af10d636-a30f-4f00-b79a-4b0e6fc4612a','EU-00001','Ignacio Suarez','nachosuarez98@gmail.com','e87acc91-b0bf-4792-a021-b9d4aab44ce8','active','2026-05-13','21838944369138309316','2026-05-13T17:15:16.91729+00:00','2026-05-13T17:53:00.609203+00:00'),
  ('baf4d15c-42f7-4bb5-b50c-9f1accb6c9b5','7148824b-3254-416a-8f82-4628fe285a8f','EU-00002','Martin Costa','tinchocosta24@gmail.com','e87acc91-b0bf-4792-a021-b9d4aab44ce8','active','2026-05-13','2183899136234693370','2026-05-13T17:58:24.054848+00:00','2026-05-13T18:04:55.626288+00:00'),
  ('0952accd-a671-486e-b0ae-39d98335006c','03da8d92-4c59-452b-9902-23a3e00da7a1','EU-00003','Joaquin Artia Roveta','joaquinartia8@gmail.com','e87acc91-b0bf-4792-a021-b9d4aab44ce8','active','2026-05-15','21838927865555770429','2026-05-15T02:57:37.051859+00:00','2026-05-15T03:20:37.337303+00:00'),
  ('225d9ed4-720b-43c4-8383-fc0104b46db2','2a05f760-afd1-4298-ad47-cfc27b93d2c6','EU-00004','Kevin Favio Gomez Peluffo','kevingomezpeluffo2003@gmail.com','e87acc91-b0bf-4792-a021-b9d4aab44ce8','active','2026-05-18',null,'2026-05-18T16:01:42.255039+00:00','2026-05-18T19:30:10.6755+00:00')
on conflict (id) do nothing;

-- ── PAYMENTS DATA ──────────────────────────────────────────────────
insert into public.payments (id, member_id, plan_id, amount, currency, status, payment_date, period_month, period_year, dlocal_payment_id, dlocal_order_id, notes, created_at) values
  ('5c42c259-503d-4618-b0a9-4e220c114665','225d9ed4-720b-43c4-8383-fc0104b46db2',null,1500,'UYU','completed','2026-05-18T16:11:29.026+00:00',5,2026,'DP-7193128','EU-PAY-225d9ed4-1779120540455',null,'2026-05-18T16:09:01.335014+00:00'),
  ('14069ca8-98cd-4dc6-829b-a5c1406d0c6a','0952accd-a671-486e-b0ae-39d98335006c','e87acc91-b0bf-4792-a021-b9d4aab44ce8',1500,'UYU','completed','2026-05-15T03:20:35.028+00:00',5,2026,null,null,'Debito automatico activado primer cobro registrado','2026-05-15T03:20:37.6571+00:00'),
  ('36ed8cba-01bb-4e59-bb32-41ff5eec50e3','baf4d15c-42f7-4bb5-b50c-9f1accb6c9b5','e87acc91-b0bf-4792-a021-b9d4aab44ce8',1500,'UYU','completed','2026-05-13T18:04:55.536+00:00',5,2026,null,null,'Debito automatico activado primer cobro registrado','2026-05-13T18:04:55.856176+00:00'),
  ('485c1a95-a78e-4774-9702-f3eb67ff442a','0aa3c7d0-d107-42c9-851f-5c11a7a3b29f','e87acc91-b0bf-4792-a021-b9d4aab44ce8',1500,'UYU','completed','2026-05-13T17:53:00.501+00:00',5,2026,null,null,'Debito automatico activado primer cobro registrado','2026-05-13T17:53:00.839692+00:00')
on conflict (id) do nothing;

-- ── ADMIN CUOTAS ───────────────────────────────────────────────────
insert into public.admins (id, name, email) values
  ('31c51432-69b5-4bec-9a01-686f53ced4f5','Elbio Universitario','elbiouniversitario2023@gmail.com')
on conflict (id) do nothing;
