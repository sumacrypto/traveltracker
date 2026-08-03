-- Esquema inicial de "Dónde estuve".
--
-- Todo lo que se lee de otra persona pasa por RLS. Las funciones que necesitan
-- mirar filas ajenas (amistades, agregados) son security definer y devuelven
-- solo lo mínimo, para que las policies no se vuelvan recursivas.

-- ---------------------------------------------------------------------------
-- Tablas
-- ---------------------------------------------------------------------------

create table public.profiles (
  id uuid primary key references auth.users on delete cascade,
  username text unique,
  display_name text,
  -- ISO 3166-1 alpha-2 del país de origen, para comparar contra sus pares.
  home_country text,
  home_city text,
  birth_year int check (birth_year between 1900 and 2100),
  avatar_url text,
  is_public boolean not null default true,
  referral_code text not null unique default substr(md5(gen_random_uuid()::text), 1, 8),
  referred_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create index profiles_home_country_idx on public.profiles (home_country);
create index profiles_referral_code_idx on public.profiles (referral_code);

create table public.visited_countries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  -- ISO 3166-1 alpha-2
  country_code text not null,
  -- Opcional: mucha gente no se acuerda de la fecha.
  visited_at date,
  created_at timestamptz not null default now(),
  unique (user_id, country_code)
);

create index visited_countries_user_idx on public.visited_countries (user_id);

create table public.visited_subdivisions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  country_code text not null,
  -- ISO 3166-2, por ejemplo US-CA o AR-B
  subdivision_code text not null,
  created_at timestamptz not null default now(),
  unique (user_id, country_code, subdivision_code)
);

create index visited_subdivisions_user_idx on public.visited_subdivisions (user_id, country_code);

create table public.connections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  friend_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'blocked')),
  created_at timestamptz not null default now(),
  unique (user_id, friend_id),
  constraint connections_no_self check (user_id <> friend_id)
);

create index connections_friend_idx on public.connections (friend_id);

-- Promedios precargados con datos públicos. Se van reemplazando por los
-- agregados propios a medida que haya muestra suficiente por país.
create table public.country_averages (
  country_code text primary key,
  avg_countries_visited numeric not null,
  sample_size int,
  source text,
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Helpers (security definer para no recursar dentro de las policies)
-- ---------------------------------------------------------------------------

create or replace function public.are_connected(a uuid, b uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.connections c
    where c.status = 'accepted'
      and ((c.user_id = a and c.friend_id = b) or (c.user_id = b and c.friend_id = a))
  );
$$;

/** Si `viewer` puede ver el progreso de `target`. */
create or replace function public.profile_is_visible(target uuid, viewer uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select
    target = viewer
    or exists (select 1 from public.profiles p where p.id = target and p.is_public)
    or public.are_connected(target, viewer);
$$;

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.visited_countries enable row level security;
alter table public.visited_subdivisions enable row level security;
alter table public.connections enable row level security;
alter table public.country_averages enable row level security;

create policy "perfiles visibles" on public.profiles
  for select using (public.profile_is_visible(id, auth.uid()));

create policy "perfil propio: crear" on public.profiles
  for insert with check (id = auth.uid());

create policy "perfil propio: editar" on public.profiles
  for update using (id = auth.uid()) with check (id = auth.uid());

create policy "países visibles" on public.visited_countries
  for select using (public.profile_is_visible(user_id, auth.uid()));

create policy "países propios: escribir" on public.visited_countries
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "subdivisiones visibles" on public.visited_subdivisions
  for select using (public.profile_is_visible(user_id, auth.uid()));

create policy "subdivisiones propias: escribir" on public.visited_subdivisions
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "conexiones propias" on public.connections
  for select using (user_id = auth.uid() or friend_id = auth.uid());

create policy "invitar" on public.connections
  for insert with check (user_id = auth.uid());

-- Solo quien recibe la invitación puede aceptarla o bloquearla.
create policy "responder invitación" on public.connections
  for update using (friend_id = auth.uid()) with check (friend_id = auth.uid());

create policy "cortar conexión" on public.connections
  for delete using (user_id = auth.uid() or friend_id = auth.uid());

create policy "promedios públicos" on public.country_averages
  for select using (true);

-- ---------------------------------------------------------------------------
-- Alta de usuario
-- ---------------------------------------------------------------------------

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    new.raw_user_meta_data ->> 'avatar_url'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Consultas agregadas
-- ---------------------------------------------------------------------------

/**
 * Promedio real de países visitados entre usuarios del mismo país de origen.
 * Devuelve también el tamaño de muestra: el cliente decide a partir de cuántos
 * usuarios vale la pena mostrarlo en vez del dato precargado.
 */
create or replace function public.home_country_average(p_country text)
returns table (avg_countries numeric, sample_size bigint)
language sql
security definer
set search_path = public
stable
as $$
  select coalesce(avg(cnt), 0)::numeric, count(*)::bigint
  from (
    select count(vc.id) as cnt
    from public.profiles p
    left join public.visited_countries vc on vc.user_id = p.id
    where p.home_country = p_country
    group by p.id
  ) por_usuario;
$$;

/** Ranking entre las conexiones aceptadas de quien llama, más el propio. */
create or replace function public.friend_leaderboard()
returns table (
  user_id uuid,
  username text,
  display_name text,
  avatar_url text,
  countries bigint
)
language sql
security definer
set search_path = public
stable
as $$
  with circulo as (
    select case when c.user_id = auth.uid() then c.friend_id else c.user_id end as fid
    from public.connections c
    where c.status = 'accepted'
      and (c.user_id = auth.uid() or c.friend_id = auth.uid())
    union
    select auth.uid()
  )
  select p.id, p.username, p.display_name, p.avatar_url, count(vc.id)
  from circulo
  join public.profiles p on p.id = circulo.fid
  left join public.visited_countries vc on vc.user_id = p.id
  where auth.uid() is not null
  group by p.id
  order by count(vc.id) desc, p.id;
$$;

/**
 * Conecta a quien llama con el dueño de `p_code`. La invitación queda aceptada
 * de un lado: quien invitó la confirma después.
 */
create or replace function public.redeem_referral(p_code text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  inviter uuid;
begin
  if auth.uid() is null then
    raise exception 'Hace falta estar autenticado';
  end if;

  select id into inviter from public.profiles where referral_code = p_code;

  if inviter is null or inviter = auth.uid() then
    return null;
  end if;

  update public.profiles
     set referred_by = inviter
   where id = auth.uid() and referred_by is null;

  insert into public.connections (user_id, friend_id, status)
  values (auth.uid(), inviter, 'pending')
  on conflict (user_id, friend_id) do nothing;

  return inviter;
end;
$$;
