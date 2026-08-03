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
}

export interface HomeCountryAverage {
  avg_countries: number;
  sample_size: number;
}
