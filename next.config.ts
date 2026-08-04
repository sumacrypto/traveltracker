import path from "node:path";
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  // Hay otros lockfiles más arriba en el árbol de carpetas; sin esto Next infiere
  // mal la raíz del workspace.
  turbopack: {
    root: path.resolve(import.meta.dirname),
  },
};

export default withNextIntl(nextConfig);
