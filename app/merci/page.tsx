"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/* Lien de réservation Calendly — entretien de présentation, 30 minutes. */
const LIEN_CALENDLY = "https://calendly.com/bly23847/30min";

const ETAPES = [
  { label: "Guide reçu" },
  { label: "Entretien individuel" },
  { label: "Formation" },
];

const mouvementReduit = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* Révélation au scroll — variante courte (400ms / 20px) propre à cette
   page, distincte de `.rev` utilisée sur la page de capture. */
function Rev({
  children,
  delai = 0,
  className = "",
}: {
  children: ReactNode;
  delai?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [vu, setVu] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (mouvementReduit()) {
      setVu(true);
      return;
    }
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setVu(true);
          obs.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -5% 0px" },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`rev-merci ${className}`}
      data-vu={vu ? "true" : "false"}
      style={{ transitionDelay: `${delai}ms` }}
    >
      {children}
    </div>
  );
}

export default function Merci() {
  return (
    <>
      {/* ============================================================
          1. CONFIRMATION — coche animée, titre, sous-titre.
      ============================================================ */}
      <section className="merci-hero relative overflow-hidden px-6 py-28 text-center sm:px-10 sm:py-36">
        <div className="relative z-10 mx-auto max-w-xl">
          <div
            className="fondu-merci flex justify-center"
            style={{ "--d": "60ms" } as React.CSSProperties}
          >
            <svg
              viewBox="0 0 64 64"
              width="56"
              height="56"
              fill="none"
              aria-hidden="true"
            >
              <circle
                cx="32"
                cy="32"
                r="28"
                stroke="#4CAF82"
                strokeWidth="3"
                pathLength={100}
                className="coche-cercle"
              />
              <path
                d="M20 33l8 8 16-18"
                stroke="#4CAF82"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                pathLength={100}
                className="coche-marque"
              />
            </svg>
          </div>

          <h1
            className="fondu-merci merci-titre-hero mt-8"
            style={{ "--d": "180ms" } as React.CSSProperties}
          >
            Votre guide est en route.
          </h1>

          <p
            className="fondu-merci merci-soustitre-hero mt-5"
            style={{ "--d": "320ms" } as React.CSSProperties}
          >
            Il arrive dans votre boîte de réception en moins d’une minute.
          </p>
        </div>
      </section>

      {/* ============================================================
          2. TIMELINE — trois étapes, la première déjà franchie.
      ============================================================ */}
      <section className="merci-timeline px-6 py-16 sm:px-10 sm:py-20">
        <Rev>
          <ol className="mx-auto flex max-w-3xl flex-col md:flex-row">
            {ETAPES.map((e, i) => (
              <li
                key={e.label}
                data-active={i === 0}
                className="merci-etape flex-1"
              >
                <span className="merci-etape-numero">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="merci-etape-label">{e.label}</span>
              </li>
            ))}
          </ol>
        </Rev>
      </section>

      {/* ============================================================
          3. CTA — l'entretien individuel.
      ============================================================ */}
      <section className="merci-cta relative overflow-hidden px-6 py-28 text-center sm:px-10 sm:py-32">
        <svg aria-hidden="true" className="grain-sombre opacity-[0.04]">
          <filter id="grain-merci">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.65"
              numOctaves="3"
              stitchTiles="stitch"
            />
          </filter>
          <rect width="100%" height="100%" filter="url(#grain-merci)" />
        </svg>

        <div className="relative z-10 mx-auto max-w-xl">
          <Rev>
            <h2 className="merci-cta-titre">
              L’étape suivante : un échange de vingt minutes
            </h2>
          </Rev>
          <Rev delai={100}>
            <p className="merci-cta-soustitre mt-5">
              Un instructeur Mind-Eat valide votre candidature lors d’un
              échange de 20 minutes, sans engagement.
            </p>
          </Rev>
          <Rev delai={200}>
            <div className="mt-10">
              <a
                href={LIEN_CALENDLY}
                target="_blank"
                rel="noopener noreferrer"
                className="bouton-final"
              >
                Réserver un entretien de présentation
              </a>
            </div>
          </Rev>
        </div>
      </section>

      <footer className="bg-creme px-6 py-12 sm:px-10">
        <p className="surtitre mx-auto max-w-4xl text-gris-clair">
          Proposition indépendante — non commanditée par Mind-Eat
        </p>
      </footer>
    </>
  );
}
