import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Hay otros lockfiles más arriba en el árbol de carpetas; sin esto Next infiere
  // mal la raíz del workspace.
  turbopack: {
    root: path.resolve(import.meta.dirname),
  },
};

export default nextConfig;
