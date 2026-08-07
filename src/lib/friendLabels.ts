"use client";

import { getSupabase } from "./supabase/client";

export interface FriendLabel {
  id: string;
  friendId: string;
  label: string;
}

/** Todas las etiquetas que puse yo, sobre cualquiera de mis amigos. */
export async function fetchFriendLabels(ownerId: string): Promise<FriendLabel[]> {
  const supabase = getSupabase();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("friend_labels")
    .select("id, friend_id, label")
    .eq("owner_id", ownerId);
  if (error) throw error;
  return ((data ?? []) as { id: string; friend_id: string; label: string }[]).map((row) => ({
    id: row.id,
    friendId: row.friend_id,
    label: row.label,
  }));
}

/**
 * Etiqueta un amigo. Crea la etiqueta en el momento si el nombre es nuevo —
 * no hay un paso separado de "crear etiqueta", es simplemente la primera vez
 * que se usa ese texto. `23505` (ya existe esa etiqueta para ese amigo) no es
 * un error, es un no-op: el estado que se pedía ya está, y en ese caso no hay
 * fila nueva que devolver (`null`) — quien llama ya tiene el estado que
 * pedía, no necesita nada más para actualizar la UI.
 *
 * Devuelve la fila creada (con su id real) en vez de nada: así quien llama
 * puede sumarla directo al estado local sin pedir la lista entera de nuevo.
 */
export async function addFriendLabel(
  ownerId: string,
  friendId: string,
  label: string,
): Promise<FriendLabel | null> {
  const supabase = getSupabase();
  if (!supabase) return null;
  const trimmed = label.trim();
  if (!trimmed) return null;
  const { data, error } = await supabase
    .from("friend_labels")
    .insert({ owner_id: ownerId, friend_id: friendId, label: trimmed })
    .select("id, friend_id, label")
    .single();
  if (error) {
    if (error.code === "23505") return null;
    throw error;
  }
  const row = data as { id: string; friend_id: string; label: string };
  return { id: row.id, friendId: row.friend_id, label: row.label };
}

/**
 * Le saca una etiqueta a un amigo. Cuando esa etiqueta se queda sin nadie
 * adentro, desaparece sola de los filtros — no hace falta borrarla aparte,
 * no existe como entidad propia (ver 0010_friend_labels.sql).
 */
export async function removeFriendLabel(id: string): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) return;
  const { error } = await supabase.from("friend_labels").delete().eq("id", id);
  if (error) throw error;
}
