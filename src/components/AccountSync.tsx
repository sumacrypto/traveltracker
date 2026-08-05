"use client";

import { useEffect } from "react";
import { getSupabase, SUPABASE_ENABLED } from "@/lib/supabase/client";
import { setRemoteSink, subdivisionKey, useTrip } from "@/lib/store";
import { takePendingGroupInvite, takePendingReferral, useAccount } from "@/lib/account";
import { codesToGeometryIds, toCountryCode } from "@/lib/countryCodes";
import { track } from "@/lib/analytics";
import type { Profile, VisitedCountry, VisitedSubdivision } from "@/lib/supabase/types";

/**
 * Puente entre la sesión de Supabase y el progreso local. No dibuja nada.
 *
 * Al iniciar sesión hace la unión de lo local con lo remoto en vez de que uno
 * pise al otro: alguien puede haber marcado países sin cuenta en este dispositivo
 * y tener otros guardados desde antes, y perder cualquiera de los dos sería peor
 * que quedarse con un país de más.
 *
 * El `?ref=` de la URL lo lee y lo guarda `ReferralWelcome`, no acá: ese
 * componente le muestra a la persona quién la invitó antes de canjear nada.
 * Acá solo se retira el código guardado (`takePendingReferral`) una vez que hay
 * sesión, para completar el canje que `ReferralWelcome` dejó pendiente. El
 * `?g=` de los grupos funciona igual, con `GroupsSection` del otro lado.
 */
export default function AccountSync() {
  useEffect(() => {
    if (!SUPABASE_ENABLED) return;
    const supabase = getSupabase();
    if (!supabase) return;

    let active = true;

    const syncForUser = async (userId: string) => {
      useAccount.getState().set({ status: "loading" });

      try {
        const pendingReferral = takePendingReferral();
        if (pendingReferral) {
          await supabase.rpc("redeem_referral", { p_code: pendingReferral });
        }

        // Mismo trato para el `?g=` de un link de grupo: GroupsSection lo
        // guarda cuando todavía no hay sesión y el canje se completa acá.
        const pendingGroup = takePendingGroupInvite();
        if (pendingGroup) {
          await supabase.rpc("redeem_group_invite", { p_code: pendingGroup });
        }

        const [profileRes, countriesRes, subdivisionsRes] = await Promise.all([
          supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
          supabase.from("visited_countries").select("country_code").eq("user_id", userId),
          supabase
            .from("visited_subdivisions")
            .select("country_code, subdivision_code")
            .eq("user_id", userId),
        ]);

        if (!active) return;
        if (countriesRes.error) throw countriesRes.error;

        const local = useTrip.getState();

        // --- Países ---------------------------------------------------------
        const remoteCodes = ((countriesRes.data ?? []) as Pick<VisitedCountry, "country_code">[])
          .map((row) => row.country_code);
        const mergedCountries: Record<string, true> = { ...local.visited };
        for (const id of codesToGeometryIds(remoteCodes)) mergedCountries[id] = true;

        const remoteSet = new Set(remoteCodes);
        const missingInRemote = Object.keys(local.visited)
          .map(toCountryCode)
          .filter((code): code is string => Boolean(code) && !remoteSet.has(code!));

        if (missingInRemote.length) {
          await supabase
            .from("visited_countries")
            .upsert(
              missingInRemote.map((code) => ({ user_id: userId, country_code: code })),
              { onConflict: "user_id,country_code", ignoreDuplicates: true },
            );
        }

        // --- Subdivisiones --------------------------------------------------
        const remoteSubs = (subdivisionsRes.data ?? []) as Pick<
          VisitedSubdivision,
          "country_code" | "subdivision_code"
        >[];
        const mergedSubs: Record<string, true> = { ...local.subdivisions };
        for (const row of remoteSubs) {
          mergedSubs[subdivisionKey(row.country_code, row.subdivision_code)] = true;
        }

        const remoteSubSet = new Set(
          remoteSubs.map((row) => subdivisionKey(row.country_code, row.subdivision_code)),
        );
        const missingSubs = Object.keys(local.subdivisions).filter((key) => !remoteSubSet.has(key));

        if (missingSubs.length) {
          await supabase.from("visited_subdivisions").upsert(
            missingSubs.map((key) => {
              const [countryCode, subdivisionCode] = key.split(":");
              return { user_id: userId, country_code: countryCode, subdivision_code: subdivisionCode };
            }),
            { onConflict: "user_id,country_code,subdivision_code", ignoreDuplicates: true },
          );
        }

        if (!active) return;
        useTrip.getState().replaceAll(mergedCountries, mergedSubs);

        // A partir de acá cada cambio se replica.
        setRemoteSink({
          markCountry: (geometryId) => {
            const code = toCountryCode(geometryId);
            if (!code) return;
            void supabase
              .from("visited_countries")
              .upsert(
                { user_id: userId, country_code: code },
                { onConflict: "user_id,country_code", ignoreDuplicates: true },
              );
          },
          unmarkCountry: (geometryId) => {
            const code = toCountryCode(geometryId);
            if (!code) return;
            void supabase
              .from("visited_countries")
              .delete()
              .eq("user_id", userId)
              .eq("country_code", code);
          },
          markSubdivision: (countryCode, subdivisionCode) => {
            void supabase.from("visited_subdivisions").upsert(
              { user_id: userId, country_code: countryCode, subdivision_code: subdivisionCode },
              { onConflict: "user_id,country_code,subdivision_code", ignoreDuplicates: true },
            );
          },
          unmarkSubdivision: (countryCode, subdivisionCode) => {
            void supabase
              .from("visited_subdivisions")
              .delete()
              .eq("user_id", userId)
              .eq("country_code", countryCode)
              .eq("subdivision_code", subdivisionCode);
          },
        });

        useAccount.getState().set({
          profile: (profileRes.data as Profile | null) ?? null,
          status: "synced",
        });
      } catch {
        if (active) useAccount.getState().set({ status: "error" });
      }
    };

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      const user = data.session?.user ?? null;
      useAccount.getState().set({ user });
      if (user) void syncForUser(user.id);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (!active) return;
      const user = session?.user ?? null;
      useAccount.getState().set({ user });

      if (user) {
        if (event === "SIGNED_IN") track("signup_completed", { provider: user.app_metadata.provider });
        void syncForUser(user.id);
      } else {
        setRemoteSink(null);
        useAccount.getState().set({ profile: null, status: "anon" });
      }
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
      setRemoteSink(null);
    };
  }, []);

  return null;
}
