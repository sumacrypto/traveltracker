"use client";

import { getSupabase } from "./supabase/client";
import type { GroupLeaderboardRow, MyGroup } from "./supabase/types";

/**
 * Cohorts personalizados: los grupos que la persona arma ella misma. Calcado de
 * peers.ts — mismas convenciones: devuelve datos crudos, nunca texto armado (no
 * hay locale acá), y deja que el componente decida qué hacer con el error.
 *
 * Todo pasa por RPC y no por `from("groups")` porque el ranking necesita ver
 * perfiles que las policies le esconderían a quien pregunta; el detalle está en
 * supabase/migrations/0007_groups.sql.
 */

export async function fetchMyGroups(): Promise<MyGroup[]> {
  const supabase = getSupabase();
  if (!supabase) return [];
  const { data, error } = await supabase.rpc("list_my_groups");
  if (error) throw error;
  return ((data ?? []) as MyGroup[]).map((row) => ({
    ...row,
    member_count: Number(row.member_count),
  }));
}

/** Devuelve el id del grupo nuevo. */
export async function createGroup(name: string): Promise<string | null> {
  const supabase = getSupabase();
  if (!supabase) return null;
  const { data, error } = await supabase.rpc("create_group", { p_name: name });
  if (error) throw error;
  return (data as string | null) ?? null;
}

/**
 * Suma a quien llama al grupo del código. `null` cuando el código no existe:
 * un link viejo o mal copiado no es una excepción, es un caso a mostrar.
 */
export async function redeemGroupInvite(code: string): Promise<string | null> {
  const supabase = getSupabase();
  if (!supabase) return null;
  const { data, error } = await supabase.rpc("redeem_group_invite", { p_code: code });
  if (error) throw error;
  return (data as string | null) ?? null;
}

export async function fetchGroupLeaderboard(groupId: string): Promise<GroupLeaderboardRow[]> {
  const supabase = getSupabase();
  if (!supabase) return [];
  const { data, error } = await supabase.rpc("group_leaderboard", { p_group_id: groupId });
  if (error) throw error;
  return (data ?? []) as GroupLeaderboardRow[];
}

/** Salir de un grupo ajeno. Va directo a la tabla: la policy ya lo limita a la fila propia. */
export async function leaveGroup(groupId: string, userId: string): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) return;
  const { error } = await supabase
    .from("group_members")
    .delete()
    .eq("group_id", groupId)
    .eq("user_id", userId);
  if (error) throw error;
}

/** Borrar el grupo propio. El `on delete cascade` se lleva puestos los miembros. */
export async function deleteGroup(groupId: string): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) return;
  const { error } = await supabase.from("groups").delete().eq("id", groupId);
  if (error) throw error;
}
