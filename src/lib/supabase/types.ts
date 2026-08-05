/**
 * Tipos del esquema, escritos a mano para no depender de generarlos contra un
 * proyecto que todavía no existe. Cuando el proyecto esté creado se pueden
 * regenerar con `supabase gen types typescript`.
 */

export interface Profile {
  id: string;
  username: string | null;
  display_name: string | null;
  home_country: string | null;
  home_city: string | null;
  birth_year: number | null;
  avatar_url: string | null;
  is_public: boolean;
  referral_code: string;
  referred_by: string | null;
  created_at: string;
}

export interface VisitedCountry {
  id: string;
  user_id: string;
  country_code: string;
  visited_at: string | null;
  created_at: string;
}

export interface VisitedSubdivision {
  id: string;
  user_id: string;
  country_code: string;
  subdivision_code: string;
  created_at: string;
}

export type ConnectionStatus = "pending" | "accepted" | "blocked";

export interface Connection {
  id: string;
  user_id: string;
  friend_id: string;
  status: ConnectionStatus;
  created_at: string;
}

export interface Group {
  id: string;
  owner_id: string;
  name: string;
  /** Código del link de invitación, mismo mecanismo que `Profile.referral_code`. */
  invite_code: string;
  created_at: string;
}

export interface GroupMember {
  group_id: string;
  user_id: string;
  joined_at: string;
}

/**
 * Fila de `list_my_groups()`. No es la tabla: trae además el conteo de miembros
 * y si quien pregunta es el dueño, que es lo que la UI necesita para decidir
 * entre "salir del grupo" y "eliminar el grupo".
 */
export interface MyGroup {
  id: string;
  name: string;
  invite_code: string;
  member_count: number;
  is_owner: boolean;
}

export interface CountryAverage {
  country_code: string;
  avg_countries_visited: number;
  sample_size: number | null;
  source: string | null;
  updated_at: string;
}

export interface LeaderboardRow {
  user_id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  countries: number;
  /** ISO alpha-2 de cada país visitado, para desglosar por continente en el cliente. */
  country_codes: string[];
}

/**
 * `group_leaderboard()` devuelve exactamente las mismas columnas que
 * `friend_leaderboard()`, a propósito: así `rankLeaderboard()` de peers.ts
 * ordena grupos y amigos con el mismo código, sin una segunda versión que
 * mantener en paralelo.
 */
export type GroupLeaderboardRow = LeaderboardRow;

export interface HomeCountryAverage {
  avg_countries: number;
  sample_size: number;
}

/** Mismo shape que HomeCountryAverage, pero agregando por franja de `birth_year`. */
export interface AgeCohortAverage {
  avg_countries: number;
  sample_size: number;
}
