-- =====================================================================
-- MEGA CAPACETES - Estrutura do banco de dados
-- Gerado em: 2026-10-08 23:03 UTC
-- Como usar: le o arquivo COMO-RESTAURAR.md que esta nesta mesma pasta.
-- Este arquivo pode ser executado inteiro de uma vez no SQL Editor.
-- =====================================================================

create extension if not exists pgcrypto;

-- tipo de acesso (administrador)
do $$ begin
  if not exists (select 1 from pg_type where typname='app_role' and typnamespace='public'::regnamespace) then
    create type public.app_role as enum ('admin');
  end if;
end $$;

-- ---------- user_roles ----------
create table if not exists public.user_roles (
  id uuid default gen_random_uuid() not null,
  user_id uuid not null,
  role public.app_role not null,
  created_at timestamp with time zone default now() not null,
  constraint user_roles_pkey PRIMARY KEY (id),
  constraint user_roles_user_id_role_key UNIQUE (user_id, role)
);
alter table public.user_roles enable row level security;
grant all on public.user_roles to anon, authenticated, service_role;

-- ---------- sales ----------
create table if not exists public.sales (
  id uuid default gen_random_uuid() not null,
  txid text not null,
  stage text default 'checkout'::text not null,
  amount_cents integer default 0 not null,
  status text default 'pending'::text not null,
  product_name text,
  utm_source text,
  utm_campaign text,
  utm_medium text,
  utm_content text,
  utm_term text,
  customer_name text,
  customer_email text,
  customer_phone text,
  created_at timestamp with time zone default now() not null,
  paid_at timestamp with time zone,
  raw jsonb,
  constraint sales_pkey PRIMARY KEY (id),
  constraint sales_txid_key UNIQUE (txid)
);
alter table public.sales enable row level security;
grant all on public.sales to anon, authenticated, service_role;

-- ---------- ad_spend ----------
create table if not exists public.ad_spend (
  id uuid default gen_random_uuid() not null,
  spend_date date not null,
  platform text default 'facebook'::text not null,
  campaign_name text not null,
  spend_cents integer default 0 not null,
  clicks integer default 0 not null,
  impressions integer default 0 not null,
  source text default 'manual'::text not null,
  updated_at timestamp with time zone default now() not null,
  constraint ad_spend_pkey PRIMARY KEY (id),
  constraint ad_spend_spend_date_platform_campaign_name_key UNIQUE (spend_date, platform, campaign_name)
);
alter table public.ad_spend enable row level security;
grant all on public.ad_spend to anon, authenticated, service_role;

-- ---------- app_settings ----------
create table if not exists public.app_settings (
  key text not null,
  value text not null,
  updated_at timestamp with time zone default now() not null,
  constraint app_settings_pkey PRIMARY KEY (key)
);
alter table public.app_settings enable row level security;
grant all on public.app_settings to anon, authenticated, service_role;

-- ---------- campaign_settings ----------
create table if not exists public.campaign_settings (
  id uuid default gen_random_uuid() not null,
  campaign_name text not null,
  is_active boolean default true not null,
  meta_campaign_id text,
  last_action text,
  updated_at timestamp with time zone default now() not null,
  constraint campaign_settings_pkey PRIMARY KEY (id),
  constraint campaign_settings_campaign_name_key UNIQUE (campaign_name)
);
alter table public.campaign_settings enable row level security;
grant all on public.campaign_settings to anon, authenticated, service_role;

-- ---------- receipts ----------
create table if not exists public.receipts (
  id uuid default gen_random_uuid() not null,
  created_at timestamp with time zone default now() not null,
  file_path text not null,
  file_name text,
  mime text,
  txid text,
  amount text,
  customer_name text,
  customer_cpf text,
  customer_phone text,
  constraint receipts_pkey PRIMARY KEY (id)
);
alter table public.receipts enable row level security;
grant all on public.receipts to anon, authenticated, service_role;

-- ---------- visitor_presence ----------
create table if not exists public.visitor_presence (
  session_id text not null,
  step text not null,
  utm_campaign text,
  last_seen timestamp with time zone default now() not null,
  first_seen timestamp with time zone default now() not null,
  constraint visitor_presence_pkey PRIMARY KEY (session_id)
);
alter table public.visitor_presence enable row level security;
grant all on public.visitor_presence to anon, authenticated, service_role;

-- ---------- funcoes ----------
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$
;

CREATE OR REPLACE FUNCTION public.grant_first_admin()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $$
begin
  if not exists (select 1 from public.user_roles where role = 'admin') then
    insert into public.user_roles (user_id, role) values (new.id, 'admin')
    on conflict do nothing;
  end if;
  return new;
end;
$$
;

-- ---------- primeiro cadastro vira administrador ----------
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.grant_first_admin();

-- ---------- regras de acesso ----------
drop policy if exists "admins delete spend" on public.ad_spend;
create policy "admins delete spend" on public.ad_spend for DELETE to authenticated using (has_role(auth.uid(), 'admin'::app_role));
drop policy if exists "admins update spend" on public.ad_spend;
create policy "admins update spend" on public.ad_spend for UPDATE to authenticated using (has_role(auth.uid(), 'admin'::app_role));
drop policy if exists "admins write spend" on public.ad_spend;
create policy "admins write spend" on public.ad_spend for INSERT to authenticated with check (has_role(auth.uid(), 'admin'::app_role));
drop policy if exists "admins read spend" on public.ad_spend;
create policy "admins read spend" on public.ad_spend for SELECT to authenticated using (has_role(auth.uid(), 'admin'::app_role));
drop policy if exists "Anyone can read settings" on public.app_settings;
create policy "Anyone can read settings" on public.app_settings for SELECT to anon, authenticated using (true);
drop policy if exists "admins update campaign settings" on public.campaign_settings;
create policy "admins update campaign settings" on public.campaign_settings for UPDATE to authenticated using (has_role(auth.uid(), 'admin'::app_role));
drop policy if exists "admins read campaign settings" on public.campaign_settings;
create policy "admins read campaign settings" on public.campaign_settings for SELECT to authenticated using (has_role(auth.uid(), 'admin'::app_role));
drop policy if exists "admins insert campaign settings" on public.campaign_settings;
create policy "admins insert campaign settings" on public.campaign_settings for INSERT to authenticated with check (has_role(auth.uid(), 'admin'::app_role));
drop policy if exists "admins delete campaign settings" on public.campaign_settings;
create policy "admins delete campaign settings" on public.campaign_settings for DELETE to authenticated using (has_role(auth.uid(), 'admin'::app_role));
drop policy if exists "admins read receipts" on public.receipts;
create policy "admins read receipts" on public.receipts for SELECT to authenticated using (has_role(auth.uid(), 'admin'::app_role));
drop policy if exists "admins delete receipts" on public.receipts;
create policy "admins delete receipts" on public.receipts for DELETE to authenticated using (has_role(auth.uid(), 'admin'::app_role));
drop policy if exists "loja registra vendas mega" on public.sales;
create policy "loja registra vendas mega" on public.sales for INSERT to anon with check ((stage = 'mega-capacetes'::text));
drop policy if exists "loja le vendas mega" on public.sales;
create policy "loja le vendas mega" on public.sales for SELECT to anon using ((stage = 'mega-capacetes'::text));
drop policy if exists "loja marca venda mega paga" on public.sales;
create policy "loja marca venda mega paga" on public.sales for UPDATE to anon using (((stage = 'mega-capacetes'::text) AND (status = 'pending'::text))) with check (((stage = 'mega-capacetes'::text) AND (status = 'paid'::text)));
drop policy if exists "admins read sales" on public.sales;
create policy "admins read sales" on public.sales for SELECT to authenticated using (has_role(auth.uid(), 'admin'::app_role));
drop policy if exists "users read own roles" on public.user_roles;
create policy "users read own roles" on public.user_roles for SELECT to authenticated using ((user_id = auth.uid()));
drop policy if exists "admins read presence" on public.visitor_presence;
create policy "admins read presence" on public.visitor_presence for SELECT to authenticated using (has_role(auth.uid(), 'admin'::app_role));

-- ---------- indices ----------
create index if not exists ad_spend_date_idx on public.ad_spend USING btree (spend_date DESC);
create index if not exists sales_stage_idx on public.sales USING btree (stage);
create index if not exists sales_campaign_idx on public.sales USING btree (utm_campaign);
create index if not exists sales_created_at_idx on public.sales USING btree (created_at DESC);
create index if not exists visitor_presence_last_seen on public.visitor_presence USING btree (last_seen);

-- ---------- pasta dos comprovantes ----------
insert into storage.buckets (id, name, public) values ('comprovantes','comprovantes', false) on conflict (id) do nothing;

