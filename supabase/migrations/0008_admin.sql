-- Panel de administración: gira sobre la identidad de quien llama, no sobre
-- una contraseña. La primera versión que se pidió era un PIN de 4 dígitos
-- fijo en el cliente — 10.000 combinaciones, sin límite de intentos, y
-- expone los datos de todos los usuarios. Se rechazó esa versión: acá la
-- validación vive en la base (security definer), nunca en el cliente, así
-- que aunque alguien lea el bundle de JS no encuentra nada para bypassear.
--
-- Gira sobre el email confirmado con el usuario, no sobre un id que haya
-- que ir a buscar a mano.

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public, auth
stable
as $$
  select exists (
    select 1 from auth.users
    where id = auth.uid()
      and email = 'sumacrypto@gmail.com'
  );
$$;

/**
 * Perfiles para el panel de admin: solo lo que hace falta para ver quién se
 * va registrando (nombre, contacto, cuándo, cuántos países lleva). El `where
 * public.is_admin()` hace que quien no sea admin reciba una tabla vacía, no
 * un error — mismo criterio que ya usan redeem_group_invite/find_profile en
 * vez de tirar excepción para casos que no ameritan romper la pantalla.
 */
create or replace function public.admin_list_profiles()
returns table (
  id uuid,
  email text,
  username text,
  display_name text,
  home_country text,
  is_public boolean,
  countries bigint,
  created_at timestamptz
)
language sql
security definer
set search_path = public, auth
stable
as $$
  select
    p.id,
    u.email,
    p.username,
    p.display_name,
    p.home_country,
    p.is_public,
    count(vc.id),
    p.created_at
  from public.profiles p
  join auth.users u on u.id = p.id
  left join public.visited_countries vc on vc.user_id = p.id
  where public.is_admin()
  group by p.id, u.email
  order by p.created_at desc;
$$;

-- Mismo agujero que documentó 0004/0007 si se deja solo el grant: Postgres le
-- da EXECUTE a PUBLIC a toda función nueva, y Supabase se lo da explícito a
-- `anon` por default privileges. Sin el revoke, las dos funciones quedan
-- llamables sin sesión desde /rest/v1/rpc/... — is_admin() igual devolvería
-- false (auth.uid() es null sin sesión), pero no vale la pena dejar la
-- superficie abierta.
revoke execute on function public.is_admin() from public, anon;
revoke execute on function public.admin_list_profiles() from public, anon;

grant execute on function public.is_admin() to authenticated;
grant execute on function public.admin_list_profiles() to authenticated;
