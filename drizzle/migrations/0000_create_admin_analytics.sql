-- roles
create type public.app_role as enum ('admin');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;
create policy "users read own roles" on public.user_roles for select to authenticated using (user_id = auth.uid());

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

-- first signed-up user becomes admin automatically
create or replace function public.grant_first_admin()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if not exists (select 1 from public.user_roles where role = 'admin') then
    insert into public.user_roles (user_id, role) values (new.id, 'admin')
    on conflict do nothing;
  end if;
  return new;
end;
$$;
create trigger on_auth_user_created_grant_admin
after insert on auth.users
for each row execute function public.grant_first_admin();

-- sales / pix events
create table public.sales (
  id uuid primary key default gen_random_uuid(),
  txid text not null unique,
  stage text not null default 'checkout',
  amount_cents integer not null default 0,
  status text not null default 'pending',
  product_name text,
  utm_source text,
  utm_campaign text,
  utm_medium text,
  utm_content text,
  utm_term text,
  customer_name text,
  customer_email text,
  customer_phone text,
  created_at timestamptz not null default now(),
  paid_at timestamptz,
  raw jsonb
);
create index sales_created_at_idx on public.sales (created_at desc);
create index sales_campaign_idx on public.sales (utm_campaign);
create index sales_stage_idx on public.sales (stage);
grant select on public.sales to authenticated;
grant all on public.sales to service_role;
alter table public.sales enable row level security;
create policy "admins read sales" on public.sales for select to authenticated using (public.has_role(auth.uid(), 'admin'));

-- ad spend
create table public.ad_spend (
  id uuid primary key default gen_random_uuid(),
  spend_date date not null,
  platform text not null default 'facebook',
  campaign_name text not null,
  spend_cents integer not null default 0,
  clicks integer not null default 0,
  impressions integer not null default 0,
  source text not null default 'manual',
  updated_at timestamptz not null default now(),
  unique (spend_date, platform, campaign_name)
);
create index ad_spend_date_idx on public.ad_spend (spend_date desc);
grant select, insert, update, delete on public.ad_spend to authenticated;
grant all on public.ad_spend to service_role;
alter table public.ad_spend enable row level security;
create policy "admins read spend" on public.ad_spend for select to authenticated using (public.has_role(auth.uid(), 'admin'));
create policy "admins write spend" on public.ad_spend for insert to authenticated with check (public.has_role(auth.uid(), 'admin'));
create policy "admins update spend" on public.ad_spend for update to authenticated using (public.has_role(auth.uid(), 'admin'));
create policy "admins delete spend" on public.ad_spend for delete to authenticated using (public.has_role(auth.uid(), 'admin'));