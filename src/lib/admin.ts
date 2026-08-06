"use client";

import { getSupabase } from "./supabase/client";

export interface AdminProfileRow {
  id: string;
  email: string | null;
  username: string | null;
  display_name: string | null;
  home_country: string | null;
  is_public: boolean;
  countries: number;
  created_at: string;
}

/**
 * La validación real vive en is_admin() del lado de la base (ver
 * supabase/migrations/0008_admin.sql): esto solo pregunta el resultado para
 * decidir qué mostrar. Nada de esto es lo que protege los datos — aunque se
 * llame directo, admin_list_profiles() devuelve vacío para cualquiera que no
 * sea el email confirmado con el usuario.
 */
export async function checkIsAdmin(): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase) return false;
  const { data, error } = await supabase.rpc("is_admin");
  if (error) return false;
  return Boolean(data);
}

export async function fetchAdminProfiles(): Promise<AdminProfileRow[]> {
  const supabase = getSupabase();
  if (!supabase) return [];
  const { data, error } = await supabase.rpc("admin_list_profiles");
  if (error) throw error;
  return (data ?? []) as AdminProfileRow[];
}
