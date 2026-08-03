import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import { THEME_INIT_SCRIPT } from "@/lib/theme";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Dónde estuve · tu mapa del mundo",
  description:
    "Marcá los países que visitaste y mirá qué porcentaje del mundo llevás explorado y cómo te comparás con el resto de la gente.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f6f8fb" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0d12" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // El script del tema escribe data-theme antes de hidratar, así que el HTML
    // del servidor y el del cliente no coinciden a propósito.
    <html
      lang="es"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        {/* La topología del mapa es lo primero que el usuario necesita ver. */}
        <link rel="preload" href="/geo/countries-50m.json" as="fetch" crossOrigin="anonymous" />
      </head>
      <body className="min-h-full">
        {/* `beforeInteractive` lo saca del árbol de React y lo inyecta en el HTML,
            que es lo que necesita para correr antes del primer paint. Un <script>
            suelto acá adentro haría lo mismo, pero React 19 lo marca como error. */}
        <Script id="theme-init" strategy="beforeInteractive">
          {THEME_INIT_SCRIPT}
        </Script>
        {children}
      </body>
    </html>
  );
}
