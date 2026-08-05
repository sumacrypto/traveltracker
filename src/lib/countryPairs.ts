import { COUNTRY_PAIR_FACTS, type CountryPairFact } from "@/data/countryPairFacts";

/** Todos los hechos curados donde `code` es el país de origen (el "de dónde sos"). */
export function factsForOrigin(code: string): CountryPairFact[] {
  return COUNTRY_PAIR_FACTS.filter((fact) => fact.originCode === code);
}

/** El hecho puntual para un par origen→destino, si existe. */
export function findPairFact(origin: string, destination: string): CountryPairFact | null {
  return (
    COUNTRY_PAIR_FACTS.find(
      (fact) => fact.originCode === origin && fact.destinationCode === destination,
    ) ?? null
  );
}
