-- Saca de la API REST los helpers internos de las policies.
--
-- Toda función en `public` queda publicada por PostgREST como RPC. Eso dejaba a
-- `are_connected` y `profile_is_visible` llamables sin sesión: cualquiera podía
-- preguntar si dos UUID son amigos, o si un perfil es público.
--
-- No alcanza con `revoke execute`: las policies evalúan estas funciones con el
-- rol de quien consulta, así que sin EXECUTE las consultas fallarían con
-- "permission denied for function". La salida es moverlas a un schema que
-- PostgREST no exponga, conservando el permiso de ejecución.

create schema if not exists private;

-- USAGE sí, para que las policies puedan resolver el nombre. PostgREST no
-- publica este schema, así que las funciones dejan de ser endpoints.
grant usage on schema private to anon, authenticated;

create or replace function private.are_connected(a uuid, b uuid)
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

create or replace function private.profile_is_visible(target uuid, viewer uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select
    target = viewer
    or exists (select 1 from public.profiles p where p.id = target and p.is_public)
    or private.are_connected(target, viewer);
$$;

-- Las policies se recrean apuntando al schema nuevo. Hay que reemplazarlas antes
-- de borrar las funciones viejas: si no, Postgres se niega por dependencia.
drop policy "perfiles visibles" on public.profiles;
create policy "perfiles visibles" on public.profiles
  for select using (private.profile_is_visible(id, auth.uid()));

drop policy "paises visibles" on public.visited_countries;
create policy "paises visibles" on public.visited_countries
  for select using (private.profile_is_visible(user_id, auth.uid()));

drop policy "subdivisiones visibles" on public.visited_subdivisions;
create policy "subdivisiones visibles" on public.visited_subdivisions
  for select using (private.profile_is_visible(user_id, auth.uid()));

drop function if exists public.profile_is_visible(uuid, uuid);
drop function if exists public.are_connected(uuid, uuid);

-- Esta sí se puede revocar sin más: la invoca el trigger con el rol de auth,
-- nunca anon ni authenticated.
revoke execute on function public.handle_new_user() from anon, authenticated;

-- home_country_average, friend_leaderboard y redeem_referral quedan como están:
-- son API pública a propósito y el cliente las llama por RPC.
