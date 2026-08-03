-- El ranking de amigos solo traía el total de países. Para desglosar por
-- continente en el cliente hace falta la lista de códigos: los continentes ya
-- están mapeados en src/data/countries.ts, así que no hace falta duplicar esa
-- tabla en SQL, alcanza con mandar los códigos y que el cliente los agrupe.

create or replace function public.friend_leaderboard()
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
    select case when c.user_id = auth.uid() then c.friend_id else c.user_id end as fid
    from public.connections c
    where c.status = 'accepted'
      and (c.user_id = auth.uid() or c.friend_id = auth.uid())
    union
    select auth.uid()
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

-- La firma de retorno cambió (columna nueva), así que hay que reafirmar quién
-- puede llamarla: mismo criterio que dejó 0001, API pública a propósito.
grant execute on function public.friend_leaderboard() to anon, authenticated;
