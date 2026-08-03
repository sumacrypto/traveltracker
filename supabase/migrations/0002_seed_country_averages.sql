-- Semilla de promedios por país.
--
-- Solo van los países con un número publicado que podamos citar. Rellenar los
-- 195 con estimaciones inventadas daría comparaciones que suenan precisas y no
-- lo son; para el resto la app usa la curva global de src/data/benchmarks.ts
-- hasta que haya muestra propia suficiente.

insert into public.country_averages (country_code, avg_countries_visited, sample_size, source)
values
  ('GB', 12.0, null, 'Prensa sobre encuestas de viaje, 2023'),
  ('AU', 10.0, null, 'Prensa sobre encuestas de viaje, 2023')
on conflict (country_code) do update
  set avg_countries_visited = excluded.avg_countries_visited,
      source = excluded.source,
      updated_at = now();
