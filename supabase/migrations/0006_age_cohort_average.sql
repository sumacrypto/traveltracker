-- Promedio de países visitados por franja de año de nacimiento, para comparar
-- contra "gente de tu edad". `birth_year` ya se pide en el perfil desde 0001,
-- así que esto no necesita ningún campo nuevo.
--
-- Mismo patrón que `home_country_average`: security definer porque tiene que
-- leer perfiles que las policies le esconden a quien llama, `stable` porque no
-- escribe, y devuelve únicamente el agregado — nunca una fila por persona, así
-- que ningún `birth_year` individual sale de acá.
--
-- La franja la elige el cliente (llega como parámetro) en vez de calcularse acá
-- a partir del perfil de quien llama: el mismo criterio de `home_country_average`,
-- que tampoco mira el perfil propio. Eso deja pedir una franja de un solo año,
-- donde `avg_countries` sería el conteo de una sola persona; sigue sin
-- identificar a nadie (año de nacimiento no es identidad) y `sample_size` viaja
-- crudo justamente para que el cliente lo vea y descarte la muestra chica en
-- vez de mostrar ruido — el umbral vive en `MIN_SAMPLE`, en src/lib/peers.ts.

create or replace function public.age_cohort_average(
  p_birth_year_from int,
  p_birth_year_to int
)
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
    where p.birth_year between p_birth_year_from and p_birth_year_to
    group by p.id
  ) por_usuario;
$$;

-- API pública a propósito, igual que `home_country_average`: la comparación
-- tiene que poder mostrarse antes de crear la cuenta.
grant execute on function public.age_cohort_average(int, int) to anon, authenticated;
