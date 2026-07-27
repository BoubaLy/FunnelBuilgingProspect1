import type { Metadata } from "next";
import {
  Plus_Jakarta_Sans,
  Inter,
  Fraunces,
  Public_Sans,
  JetBrains_Mono,
} from "next/font/google";
import "./globals.css";

/**
 * Système à deux familles sans empattement.
 * Plus Jakarta Sans porte les titres, les numéros et les boutons ;
 * Inter porte le corps de texte, les formulaires et les mentions.
 *
 * next/font télécharge les fichiers au build et les sert depuis le domaine
 * du site, avec `font-display: swap` et les `@font-face` injectés en
 * critique : aucun appel à fonts.googleapis.com au runtime, donc ni
 * preconnect ni requête bloquante, et aucun décalage de mise en page.
 */
const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
  weight: ["600", "700", "800"],
  variable: "--font-jakarta",
});

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600"],
  variable: "--font-inter",
});

/* Trio éditorial réservé au bandeau d'identité de la page de capture et à
   la page de remerciement : Fraunces pour les titres (accent de marque),
   Public Sans pour le corps sur fond sombre, JetBrains Mono pour les
   numéros de la timeline. Le reste du site continue de reposer sur
   Jakarta/Inter — ce trio n'est chargé que là où il est demandé. */
const fraunces = Fraunces({
  subsets: ["latin"],
  display: "swap",
  weight: ["500", "600"],
  variable: "--font-fraunces",
});

const publicSans = Public_Sans({
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600"],
  variable: "--font-public-sans",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  weight: ["500", "600"],
  variable: "--font-jetbrains-mono",
});

/* Renseigner NEXT_PUBLIC_SITE_URL à l'hébergement pour que les URL
   Open Graph et canoniques pointent sur le domaine réel. */
const URL_SITE =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://exemple-maquette.local";
const TITRE =
  "Cinq outils de pleine conscience alimentaire, applicables dès la prochaine consultation";
const DESCRIPTION =
  "Guide gratuit pour les médecins, diététiciens, psychologues, infirmiers et sages-femmes confrontés aux troubles du comportement alimentaire. Cinq pratiques issues du protocole MB-EAT.";

export const metadata: Metadata = {
  metadataBase: new URL(URL_SITE),
  title: TITRE,
  description: DESCRIPTION,
  keywords: [
    "MB-EAT",
    "pleine conscience alimentaire",
    "troubles du comportement alimentaire",
    "formation professionnels de santé",
    "hyperphagie boulimique",
    "guide clinicien",
  ],
  // Maquette de démonstration : désindexée tant qu'elle n'est pas validée.
  robots: { index: false, follow: false },
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: URL_SITE,
    siteName: "Alimentation en pleine conscience — formation d'instructeur",
    title: TITRE,
    description: DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: TITRE,
    description: DESCRIPTION,
  },
};

/**
 * Données structurées Schema.org de type Course.
 * Le tarif n'étant pas public, aucune offre n'est déclarée.
 */
const schemaCourse = {
  "@context": "https://schema.org",
  "@type": "Course",
  name: "Formation d'instructeur en alimentation en pleine conscience",
  description:
    "Formation d'instructeur fondée sur le protocole MB-EAT de Jean Kristeller. Neuf séances de 3 h 30 en visioconférence, seize participants, réservée aux professionnels de santé.",
  inLanguage: "fr-FR",
  teaches: [
    "Animer un cycle de séances d'alimentation en pleine conscience en groupe",
    "Différencier faim physiologique, envie, faim émotionnelle et faim d'habitude",
    "Conduire une dégustation guidée et l'entretien d'exploration qui la suit",
    "Repérer les indications, contre-indications et critères de relais",
  ],
  coursePrerequisites:
    "Diplôme d'État ou titre reconnu dans une profession de santé.",
  audience: {
    "@type": "EducationalAudience",
    educationalRole: "professional",
    audienceType:
      "Médecins, diététiciens nutritionnistes, psychologues, infirmiers, sages-femmes",
  },
  provider: {
    "@type": "Organization",
    name: "[ORGANISME — À RENSEIGNER]",
  },
  hasCourseInstance: {
    "@type": "CourseInstance",
    courseMode: "online",
    courseWorkload: "PT31H",
    maximumAttendeeCapacity: 16,
    location: { "@type": "VirtualLocation", name: "Visioconférence en direct" },
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="fr"
      className={`${jakarta.variable} ${inter.variable} ${fraunces.variable} ${publicSans.variable} ${jetbrainsMono.variable} h-full`}
    >
      <body className="min-h-full">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaCourse) }}
        />
        {children}
      </body>
    </html>
  );
}
