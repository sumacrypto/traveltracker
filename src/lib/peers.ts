"use client";

import { getSupabase } from "./supabase/client";
import { COUNTRIES, GEOMETRY_ID_BY_CODE, CONTINENTS, type Continent } from "@/data/countries";
import type {
  AgeCohortAverage,
  CountryAverage,
  HomeCountryAverage,
  LeaderboardRow,
  Profile,
} from "./supabase/types";

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

/**
 * Media banda de la cohorte de edad: ±5 años alrededor del año de nacimiento,
 * o sea una franja de 11 años. Suficientemente ancha para juntar muestra desde
 * el principio y suficientemente angosta para que "gente de tu edad" siga
 * queriendo decir algo (alguien de 30 no se compara con alguien de 50).
 */
export const AGE_BAND = 5;

export interface AgeAverage {
  /** La franja consultada viaja de vuelta para poder nombrarla en la copy. */
  fromYear: number;
  toYear: number;
  average: number;
  sampleSize: number;
  /**
   * Si la muestra alcanza para mostrar el promedio. A diferencia del país, acá
   * no hay dato publicado al que caer: cuando esto es `false` lo único honesto
   * es decir que todavía falta gente, y eso lo dice el componente.
   */
  enough: boolean;
}

export async function fetchAgeCohortAverage(birthYear: number): Promise<AgeAverage | null> {
  const supabase = getSupabase();
  if (!supabase) return null;

  const fromYear = birthYear - AGE_BAND;
  const toYear = birthYear + AGE_BAND;

  const { data, error } = await supabase
    .rpc("age_cohort_average", { p_birth_year_from: fromYear, p_birth_year_to: toYear })
    .maybeSingle();
  if (error) throw error;

  const row = data as AgeCohortAverage | null;
  if (!row) return null;

  const sampleSize = Number(row.sample_size);
  return {
    fromYear,
    toYear,
    average: Number(row.avg_countries),
    sampleSize,
    enough: sampleSize >= MIN_SAMPLE,
  };
}

export async function fetchLeaderboard(): Promise<LeaderboardRow[]> {
  const supabase = getSupabase();
  if (!supabase) return [];
  const { data, error } = await supabase.rpc("friend_leaderboard");
  if (error) throw error;
  return (data ?? []) as LeaderboardRow[];
}

export interface RankedFriend {
  userId: string;
  label: string;
  countries: number;
}

/**
 * Ordena el ranking, general o de un continente puntual. El desglose por
 * continente no viaja armado desde SQL: la tabla país→continente ya vive en
 * `src/data/countries.ts`, así que duplicarla en la base sería mantener la
 * misma verdad en dos lugares.
 *
 * El label ("Vos"/"you", "Sin nombre"/"No name") no se arma acá: esto no es un
 * componente, no tiene locale. Lo resuelve labelFor(), que le pasa
 * AccountDialog.tsx con useTranslations().
 */
export function rankLeaderboard(
  rows: LeaderboardRow[],
  continent: Continent | "general",
  labelFor: (row: LeaderboardRow) => string,
  locale: string,
): RankedFriend[] {
  const countFor = (row: LeaderboardRow) => {
    if (continent === "general") return row.countries;
    let count = 0;
    for (const code of row.country_codes) {
      const meta = COUNTRIES[GEOMETRY_ID_BY_CODE[code]];
      if (meta?.countable && meta.region === continent) count++;
    }
    return count;
  };

  return rows
    .map((row) => ({
      userId: row.user_id,
      label: labelFor(row),
      countries: countFor(row),
    }))
    .sort((a, b) => b.countries - a.countries || a.label.localeCompare(b.label, locale));
}

export const LEADERBOARD_TABS: Array<Continent | "general"> = ["general", ...CONTINENTS];

/**
 * Perfil de quien invitó, a partir del código en el link. Solo funciona si ese
 * perfil es público: la policy de lectura no distingue "visible para armar el
 * cartel de bienvenida" de "visible en general". Si es privado, la persona que
 * llega igual puede conectar (redeem_referral no depende de esto), pero el
 * cartel no puede mostrar su nombre.
 */
export async function fetchProfileByReferral(code: string): Promise<Profile | null> {
  const supabase = getSupabase();
  if (!supabase) return null;
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("referral_code", code)
    .maybeSingle();
  return (data as Profile | null) ?? null;
}

export async function redeemReferral(code: string): Promise<string | null> {
  const supabase = getSupabase();
  if (!supabase) return null;
  const { data, error } = await supabase.rpc("redeem_referral", { p_code: code });
  if (error) throw error;
  return (data as string | null) ?? null;
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

/**
 * Perfil por nombre de usuario exacto, para agregar un amigo a mano en vez de
 * por link. Mismo criterio de visibilidad que fetchProfileByReferral: la RLS
 * de `profiles` ya limita esto a perfiles públicos (o con los que ya hay
 * conexión), sin necesidad de una RPC nueva — es la misma policy que ya
 * protege el resto de las lecturas de perfiles ajenos.
 */
export async function findProfileByUsername(username: string): Promise<Profile | null> {
  const supabase = getSupabase();
  if (!supabase) return null;
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", username.trim().toLowerCase())
    .maybeSingle();
  return (data as Profile | null) ?? null;
}

export type SendRequestResult = "sent" | "connected";

/**
 * Pide conectar con `targetId`. La policy "invitar" ya permite este insert
 * directo (user_id = quien llama) sin pasar por una RPC — mismo criterio que
 * el resto de esta base: RPC solo cuando hace falta sortear RLS, no para todo.
 *
 * Si la otra persona ya me había pedido conectar antes (su solicitud está
 * esperando que la acepte), aceptar esa en vez de crear una segunda en
 * paralelo: es la misma intención de las dos partes, conviene resolverla al
 * toque en vez de dejar dos filas "pending" cruzadas.
 */
export async function sendFriendRequest(targetId: string): Promise<SendRequestResult> {
  const supabase = getSupabase();
  if (!supabase) return "sent";
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return "sent";

  const { data: reverse } = await supabase
    .from("connections")
    .select("id")
    .eq("user_id", targetId)
    .eq("friend_id", user.id)
    .eq("status", "pending")
    .maybeSingle();

  if (reverse) {
    const { error } = await supabase
      .from("connections")
      .update({ status: "accepted" })
      .eq("id", reverse.id);
    if (error) throw error;
    return "connected";
  }

  const { error } = await supabase
    .from("connections")
    .insert({ user_id: user.id, friend_id: targetId, status: "pending" });
  if (error) throw error;
  return "sent";
}

export interface SentRequest {
  id: string;
  friendId: string;
  display_name: string | null;
  username: string | null;
  avatar_url: string | null;
}

/** Solicitudes que mandé yo y todavía no se aceptaron — el reverso de fetchPendingRequests. */
export async function fetchSentRequests(userId: string): Promise<SentRequest[]> {
  const supabase = getSupabase();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("connections")
    .select("id, friend_id, profiles!connections_friend_id_fkey(display_name, username, avatar_url)")
    .eq("user_id", userId)
    .eq("status", "pending");

  if (error) throw error;

  type Row = {
    id: string;
    friend_id: string;
    profiles: { display_name: string | null; username: string | null; avatar_url: string | null } | null;
  };

  return ((data ?? []) as unknown as Row[]).map((row) => ({
    id: row.id,
    friendId: row.friend_id,
    display_name: row.profiles?.display_name ?? null,
    username: row.profiles?.username ?? null,
    avatar_url: row.profiles?.avatar_url ?? null,
  }));
}

/**
 * Códigos de país de un amigo puntual, para la comparación 1 a 1. Igual que
 * findProfileByUsername: la RLS de `visited_countries` ya lo permite (perfil
 * conectado o público) sin pasar por RPC.
 */
export async function fetchFriendCountries(friendId: string): Promise<string[]> {
  const supabase = getSupabase();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("visited_countries")
    .select("country_code")
    .eq("user_id", friendId);
  if (error) throw error;
  return ((data ?? []) as { country_code: string }[]).map((row) => row.country_code);
}
