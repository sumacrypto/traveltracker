-- Cohorts personalizados: grupos con nombre propio ("mis amigas de la
-- infancia", "el grupo de baile") a los que se entra por link de invitación.
--
-- Por qué una tabla nueva y no reusar `connections`: una conexión es una
-- arista de a dos, y un grupo de N personas no se puede representar con
-- aristas sin inventar la noción de grupo en el cliente. Además el sentido es
-- distinto — estar en el mismo grupo no implica estar conectado 1 a 1, que es
-- justamente lo que pidió el producto (sumarse por link, sin conectar antes).

create table public.groups (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  -- Mismo mecanismo que `profiles.referral_code`: 8 hex al azar, imposible de
  -- adivinar por fuerza bruta a través de la API y corto para compartir.
  invite_code text not null unique default substr(md5(gen_random_uuid()::text), 1, 8),
  created_at timestamptz not null default now()
);

create table public.group_members (
  group_id uuid not null references public.groups(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (group_id, user_id)
);

-- La PK ya cubre las consultas por grupo; este índice es para el camino
-- inverso, "en qué grupos estoy", que es el que corre en cada carga de /stats.
create index group_members_user_idx on public.group_members (user_id);

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------

-- El helper vive en `private` y no en `public` por lo mismo que explica 0003:
-- toda función en `public` queda publicada por PostgREST como RPC, y esto no
-- es API, es plomería de las policies.
create schema if not exists private; -- no-op si 0003 ya lo creó
grant usage on schema private to anon, authenticated;

create or replace function private.is_group_member(gid uuid, uid uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.group_members gm
    where gm.group_id = gid and gm.user_id = uid
  );
$$;

alter table public.groups enable row level security;
alter table public.group_members enable row level security;

create policy "grupos visibles a miembros" on public.groups
  for select using (owner_id = auth.uid() or private.is_group_member(id, auth.uid()));

-- Los grupos se crean por `create_group()`, que además suma a quien lo crea
-- como primer miembro en la misma transacción. Sin policy de insert directo:
-- un insert suelto dejaría un grupo sin dueño adentro.

-- Renombrar y borrar son del dueño. Sin la de borrar, un grupo creado por error
-- quedaría para siempre: nadie más que el dueño puede sacarlo, y el `on delete
-- cascade` de group_members se encarga del resto.
create policy "editar grupo propio" on public.groups
  for update using (owner_id = auth.uid()) with check (owner_id = auth.uid());

create policy "borrar grupo propio" on public.groups
  for delete using (owner_id = auth.uid());

create policy "miembros visibles a miembros" on public.group_members
  for select using (private.is_group_member(group_id, auth.uid()));

create policy "salir de un grupo" on public.group_members
  for delete using (user_id = auth.uid());

-- Sin policy de insert directo: sumarse a un grupo pasa únicamente por
-- redeem_group_invite(), que sortea RLS a propósito (mismo criterio que
-- redeem_referral insertando en connections). Si se pudiera insertar de
-- frente, cualquiera con el UUID de un grupo se metería sin tener el link.

-- ---------------------------------------------------------------------------
-- API
-- ---------------------------------------------------------------------------

/** Crea el grupo y mete a quien lo crea adentro, todo o nada. */
create or replace function public.create_group(p_name text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  gid uuid;
  nombre text := nullif(btrim(p_name), '');
begin
  if auth.uid() is null then
    raise exception 'Hace falta estar autenticado';
  end if;

  if nombre is null then
    raise exception 'El grupo necesita un nombre';
  end if;

  insert into public.groups (owner_id, name) values (auth.uid(), left(nombre, 60))
  returning id into gid;

  insert into public.group_members (group_id, user_id) values (gid, auth.uid());

  return gid;
end;
$$;

/**
 * Suma a quien llama al grupo del código. Devuelve el id del grupo, o null si
 * el código no existe — que no es un error: un link viejo o mal copiado no
 * tiene por qué romper la pantalla.
 */
create or replace function public.redeem_group_invite(p_code text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  gid uuid;
begin
  if auth.uid() is null then
    raise exception 'Hace falta estar autenticado';
  end if;

  select id into gid from public.groups where invite_code = p_code;
  if gid is null then
    return null;
  end if;

  insert into public.group_members (group_id, user_id) values (gid, auth.uid())
  on conflict (group_id, user_id) do nothing;

  return gid;
end;
$$;

/**
 * Ranking dentro de un grupo, calcado de friend_leaderboard(): mismas columnas
 * a propósito, así el cliente reusa rankLeaderboard() sin cambios.
 *
 * Es security definer porque tiene que devolver perfiles que la policy de
 * `profiles` le escondería a quien llama (los perfiles privados de gente con la
 * que no está conectado 1 a 1). Eso es deliberado y es el trato del grupo:
 * sumarse es aceptar aparecer en su ranking. El candado es el `exists` de
 * adentro — si quien llama no es miembro, no sale ninguna fila.
 */
create or replace function public.group_leaderboard(p_group_id uuid)
returns table (
  user_id uuid,
  username text,
  display_name text,
  avatar_url text,
  countries bigint,
  country_codes text[]
)
language sql
security definer
set search_path = public
stable
as $$
  with circulo as (
    select gm.user_id as fid
    from public.group_members gm
    where gm.group_id = p_group_id
      and exists (
        select 1 from public.group_members me
        where me.group_id = p_group_id and me.user_id = auth.uid()
      )
  )
  select
    p.id,
    p.username,
    p.display_name,
    p.avatar_url,
    count(vc.id),
    coalesce(array_agg(vc.country_code) filter (where vc.country_code is not null), '{}')
  from circulo
  join public.profiles p on p.id = circulo.fid
  left join public.visited_countries vc on vc.user_id = p.id
  where auth.uid() is not null
  group by p.id
  order by count(vc.id) desc, p.id;
$$;

/** Los grupos de quien llama, con cuántos son y si es el dueño. */
create or replace function public.list_my_groups()
returns table (
  id uuid,
  name text,
  invite_code text,
  member_count bigint,
  is_owner boolean
)
language sql
security definer
set search_path = public
stable
as $$
  select g.id, g.name, g.invite_code, count(gm2.user_id), g.owner_id = auth.uid()
  from public.groups g
  join public.group_members gm on gm.group_id = g.id and gm.user_id = auth.uid()
  left join public.group_members gm2 on gm2.group_id = g.id
  where auth.uid() is not null
  group by g.id
  order by g.created_at;
$$;

-- Solo `authenticated`: las cuatro dependen de auth.uid(), así que llamadas sin
-- sesión no devuelven nada (o directamente fallan). Dejarlas abiertas a `anon`
-- sería publicar endpoints que no pueden hacer nada más que existir.
--
-- El grant solo no alcanza, y es exactamente el agujero que documentó 0004:
-- Postgres le da EXECUTE a PUBLIC a toda función nueva, y encima Supabase tiene
-- default privileges que se lo dan explícito a `anon` en el schema public. Sin
-- estos revoke, las cuatro quedan colgando de /rest/v1/rpc/... sin sesión (lo
-- detecta el lint anon_security_definer_function_executable de get_advisors).
revoke execute on function public.create_group(text) from public, anon;
revoke execute on function public.redeem_group_invite(text) from public, anon;
revoke execute on function public.group_leaderboard(uuid) from public, anon;
revoke execute on function public.list_my_groups() from public, anon;

grant execute on function public.create_group(text) to authenticated;
grant execute on function public.redeem_group_invite(text) to authenticated;
grant execute on function public.group_leaderboard(uuid) to authenticated;
grant execute on function public.list_my_groups() to authenticated;
