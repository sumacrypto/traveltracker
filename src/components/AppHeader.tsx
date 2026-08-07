"use client";

import { useTranslations } from "next-intl";
import { GlobeHemisphereWest } from "@phosphor-icons/react";
import { Link, usePathname } from "@/i18n/navigation";
import ThemeToggle from "./ThemeToggle";
import AccountButton from "./AccountButton";
import { useUiDialogs } from "@/lib/uiState";

const TABS = [
  { href: "/", key: "map" },
  { href: "/stats", key: "stats" },
  { href: "/friends", key: "friends" },
] as const;

/**
 * Header compartido entre `/` (el mapa), `/stats` (Estadísticas) y `/friends`
 * (Amigos): antes vivía adentro de `Explorer.tsx`, pero con rutas propias, el
 * header y los diálogos de cuenta tienen que estar arriba de las tres, en el
 * layout. Mismo patrón visual de pills que ya usa el tablist de continentes
 * en AccountDialog.tsx, pero acá navega de verdad (Link/usePathname de
 * src/i18n/navigation.ts, que existía en el repo pero nadie lo usaba todavía).
 */
export default function AppHeader() {
  const t = useTranslations("appHeader");
  const pathname = usePathname();
  const openAuth = useUiDialogs((state) => state.openAuth);
  const openAccount = useUiDialogs((state) => state.openAccount);

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b border-ink-line px-3 sm:gap-3 sm:px-4 lg:gap-6 lg:px-6">
      <div className="flex shrink-0 items-center gap-2">
        <GlobeHemisphereWest size={22} weight="fill" className="text-accent" />
        {/* En un celular angosto, el logo + las dos pestañas + el botón de
            cuenta no entran todos con nombre completo (shrink-0 en los tres
            grupos a propósito, para que ninguno se deforme apretándose) — el
            ícono ya identifica la marca, así que el texto se esconde primero. */}
        <span className="hidden text-[15px] font-semibold tracking-tight sm:inline">
          {t("appName")}
        </span>
      </div>

      {/* Con tres pestañas (Mapa/Estadísticas/Amigos) ni el achique de arriba
          garantiza que entren enteras en un celular angosto — overflow-x-auto
          es la red de seguridad real, mismo patrón que ya usan las filas de
          pestañas de continente en AccountDialog/FriendsScreen. */}
      <nav
        role="tablist"
        aria-label={t("navAriaLabel")}
        className="flex min-w-0 gap-1 overflow-x-auto"
      >
        {TABS.map(({ href, key }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              role="tab"
              aria-selected={active}
              className={`shrink-0 rounded-full px-2.5 py-2 text-[13px] font-medium whitespace-nowrap transition-colors sm:px-3.5 ${
                active
                  ? "bg-accent text-white"
                  : "border border-ink-line text-text-dim hover:border-accent"
              }`}
            >
              {t(key)}
            </Link>
          );
        })}
      </nav>

      <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-3">
        <ThemeToggle />
        <AccountButton onSignIn={openAuth} onOpenAccount={openAccount} />
      </div>
    </header>
  );
}
