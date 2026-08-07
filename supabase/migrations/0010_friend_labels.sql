-- Etiquetas personales sobre amigos ya conectados: "amigas de la infancia",
-- "grupo de baile". Reemplaza a los grupos con link de invitación (0007):
-- esos pedían una membresía aparte incluso para gente que ya era amiga por
-- `connections`, duplicando ese flujo entero. Acá no hay nada que aceptar ni
-- ningún link — es organización pura de la propia lista de amigos, así que no
-- hace falta ni una función security definer: el dueño lee y escribe solo lo
-- suyo, RLS alcanza.
--
-- A propósito no hay tabla `labels` separada: el nombre de la etiqueta vive
-- en cada fila (owner_id, friend_id, label), y la lista de etiquetas que
-- existen para alguien es simplemente el `distinct label` de sus propias
-- filas. Menos una tabla que mantener sincronizada, y una etiqueta sin nadie
-- adentro desaparece sola en vez de quedar húérfana.

create table public.friend_labels (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  friend_id uuid not null references public.profiles(id) on delete cascade,
  label text not null check (char_length(btrim(label)) between 1 and 40),
  created_at timestamptz not null default now(),
  unique (owner_id, friend_id, label)
);

-- El acceso siempre entra filtrando por owner_id (ver las tres policies de
-- abajo), así que es el índice que importa. No hace falta uno por friend_id:
-- nunca se pregunta "quién me etiquetó a mí", solo "a quién etiqueté yo".
create index friend_labels_owner_idx on public.friend_labels (owner_id);

alter table public.friend_labels enable row level security;

create policy "mis etiquetas: leer" on public.friend_labels
  for select using (owner_id = auth.uid());

create policy "mis etiquetas: crear" on public.friend_labels
  for insert with check (owner_id = auth.uid());

create policy "mis etiquetas: borrar" on public.friend_labels
  for delete using (owner_id = auth.uid());

-- Sin policy de update: cambiar una etiqueta es borrar la fila vieja y crear
-- la nueva (mismo criterio que ya usa el cliente para togglear), no hace
-- falta un tercer camino que mantener.
