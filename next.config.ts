import type { NextConfig } from "next";

/**
 * Le site n'utilise aucune fonctionnalité serveur : il peut être livré
 * soit en application Next (Vercel), soit en fichiers statiques.
 *
 * `npm run build`         → build standard, pour un hébergeur Next.
 * `npm run build:statique` → génère en plus le dossier `out/`, déposable
 *                            tel quel sur n'importe quel hébergeur.
 */
const nextConfig: NextConfig = {
  ...(process.env.EXPORT_STATIQUE === "1"
    ? {
        output: "export" as const,
        images: { unoptimized: true },
        /* Produit `merci/index.html` plutôt que `merci.html`. Sans cela,
           servir /merci dépend de la réécriture d'URL de l'hébergeur. */
        trailingSlash: true,
      }
    : {}),
};

export default nextConfig;
