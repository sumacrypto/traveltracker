-- is_admin() pasa a comparar contra el uuid fijo en vez del email.

-- El email es mutable: cambiarlo apagaba el panel en silencio, y la seguridad
-- quedaba apoyada en que Supabase garantice unicidad y confirmacion de la
-- direccion. El id de auth.users no cambia mientras la cuenta exista.

-- El uuid va en texto plano igual que iba el email: no es una credencial, es
-- un id interno, y lo unico que hace es decidir si auth.uid() es esa cuenta.
-- La validacion sigue viviendo en la base, nunca en el cliente.

-- El coalesce esta porque `null = uuid` da null: sin sesion la funcion
-- devolvia null en vez de false. No abria nada (en un where, null no es true),
-- pero rompia el contrato booleano para quien la llame directo.

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public, auth
stable
as $$
  select coalesce(auth.uid() = '386e77a6-8e3b-4e8b-9841-7887df185067'::uuid, false);
$$;
