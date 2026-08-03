"use client";

import { getSupabase } from "./supabase/client";
import type { CountryAverage, HomeCountryAverage, LeaderboardRow } from "./supabase/types";

/**
 * Debajo de esta muestra el promedio propio dice más del ruido que del país, así
 * que se cae al dato precargado en vez de mostrar un número inventado.
 */
export const MIN_SAMPLE = 30;

export interface PeerAverage {
  countryCode: string;
  average: number;
  sampleSize: number;
  /** "usuarios" cuando sale de nuestra propia base, "publico" cuando es el precargado. */
  origin: "usuarios" | "publico";
  source: string | null;
}

export async function fetchPeerAverage(countryCode: string): Promise<PeerAverage | null> {
  const supabase = getSupabase();
  if (!supabase) return null;

  const [ownRes, publicRes] = await Promise.all([
    supabase.rpc("home_country_average", { p_country: countryCode }).maybeSingle(),
    supabase.from("country_averages").select("*").eq("country_code", countryCode).maybeSingle(),
  ]);

  const own = ownRes.data as HomeCountryAverage | null;
  if (own && own.sample_size >= MIN_SAMPLE) {
    return {
      countryCode,
      average: Number(own.avg_countries),
      sampleSize: Number(own.sample_size),
      origin: "usuarios",
      source: null,
    };
  }

  const preloaded = publicRes.data as CountryAverage | null;
  if (preloaded) {
    return {
      countryCode,
      average: Number(preloaded.avg_countries_visited),
      sampleSize: preloaded.sample_size ?? 0,
      origin: "publico",
      source: preloaded.source,
    };
  }

  return null;
}

export async function fetchLeaderboard(): Promise<LeaderboardRow[]> {
  const supabase = getSupabase();
  if (!supabase) return [];
  const { data, error } = await supabase.rpc("friend_leaderboard");
  if (error) throw error;
  return (data ?? []) as LeaderboardRow[];
}

export interface PendingRequest {
  id: string;
  user_id: string;
  display_name: string | null;
  username: string | null;
  avatar_url: string | null;
}

export async function fetchPendingRequests(userId: string): Promise<PendingRequest[]> {
  const supabase = getSupabase();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("connections")
    .select("id, user_id, profiles!connections_user_id_fkey(display_name, username, avatar_url)")
    .eq("friend_id", userId)
    .eq("status", "pending");

  if (error) throw error;

  type Row = {
    id: string;
    user_id: string;
    profiles: { display_name: string | null; username: string | null; avatar_url: string | null } | null;
  };

  return ((data ?? []) as unknown as Row[]).map((row) => ({
    id: row.id,
    user_id: row.user_id,
    display_name: row.profiles?.display_name ?? null,
    username: row.profiles?.username ?? null,
    avatar_url: row.profiles?.avatar_url ?? null,
  }));
}

export async function acceptRequest(connectionId: string) {
  const supabase = getSupabase();
  if (!supabase) return;
  const { error } = await supabase
    .from("connections")
    .update({ status: "accepted" })
    .eq("id", connectionId);
  if (error) throw error;
}
