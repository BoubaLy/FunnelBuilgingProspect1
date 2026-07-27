import type { Metadata } from "next";

/**
 * Une page de remerciement ne doit jamais être indexée : elle serait
 * atteignable sans passer par le formulaire, ce qui fausse la mesure de
 * conversion et laisse fuir la ressource.
 */
export const metadata: Metadata = {
  title: "Votre guide est en route",
  description:
    "Confirmation d'inscription — le guide des cinq outils de pleine conscience alimentaire arrive par email.",
  robots: { index: false, follow: false, nocache: true },
};

export default function LayoutMerci({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <>{children}</>;
}
