"use client";

import { useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ElementType,
  type ReactNode,
} from "react";

/* ------------------------------------------------------------------
   Photo du hero — Brooke Lark, Unsplash, licence libre, aucune
   attribution requise. Servie en local depuis /public : pas de
   dépendance réseau, pas de configuration de domaine.
------------------------------------------------------------------ */
const PHOTO_HERO = "/hero-bol.jpg";

/* Le titre est découpé en segments. `i: true` met le segment en couleur
   d'accent — pas de changement de famille, pas d'italique. */
const TITRE_HERO: { t: string; i?: boolean }[] = [
  { t: "Cinq outils pour les patients que" },
  { t: "l’information", i: true },
  { t: "n’atteint plus" },
];

const ETAPES = [
  {
    cle: "Méthode",
    titre: "Protocole MB-EAT, évalué en essais contrôlés",
    detail:
      "Développé par Jean Kristeller à l’Indiana State University. Un essai randomisé de 2014 documente la réduction des épisodes de crise dans l’hyperphagie boulimique.",
    glyphe: (
      <>
        <path pathLength={120} d="M14 6h12M18 6v9l-8 15a4 4 0 0 0 3.5 6h13a4 4 0 0 0 3.5-6l-8-15V6" />
        <path pathLength={120} d="M13 24h14" />
      </>
    ),
  },
  {
    cle: "Usage",
    titre: "Applicable dès la prochaine consultation",
    detail:
      "Les cinq outils s’intègrent à un entretien existant. Aucun matériel, aucune réorganisation de votre pratique, aucune formation préalable exigée.",
    glyphe: (
      <>
        <path pathLength={120} d="M6 10a3 3 0 0 1 3-3h13a3 3 0 0 1 3 3v9a3 3 0 0 1-3 3h-8l-6 5v-5H9a3 3 0 0 1-3-3z" />
        <path pathLength={120} d="M27 14h3a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3h-1v4l-5-4" />
      </>
    ),
  },
  {
    cle: "Accès",
    titre: "Téléchargement immédiat",
    detail:
      "Le guide arrive dans votre boîte dans la minute. Une adresse suffit, sans autre information, et le lien de désinscription fonctionne dès le premier message.",
    glyphe: (
      <>
        <path pathLength={120} d="M20 5v18" />
        <path pathLength={120} d="M12 16l8 8 8-8" />
        <path pathLength={120} d="M6 27v4a3 3 0 0 0 3 3h22a3 3 0 0 0 3-3v-4" />
      </>
    ),
  },
];

const FORMATEURS = [
  {
    nom: "Savéria Garcia",
    certifications: ["Diététicienne nutritionniste", "Praticienne certifiée du GROS"],
  },
  {
    nom: "Sandrine Le Mazou",
    certifications: [
      "Diététicienne nutritionniste",
      "Certifiée en alimentation intuitive",
    ],
  },
  {
    nom: "Jean-Jacques Colin",
    certifications: [
      "Médecin nutritionniste",
      "Auteur de deux ouvrages sur la pleine conscience alimentaire",
    ],
  },
];

const OUTILS = [
  {
    cle: "Perception",
    titre: "L’échelle de faim et de rassasiement",
    texte:
      "Deux questions posées au bon moment — avant le repas, puis à mi-assiette. Elles déplacent l’attention du patient des règles externes vers ses propres sensations, sans lui suggérer la réponse.",
  },
  {
    cle: "Entretien",
    titre: "La dégustation guidée en consultation",
    texte:
      "Trois minutes, un aliment. Ce que le patient rapporte de cette expérience vous renseigne davantage qu’un rappel alimentaire de dix minutes.",
  },
  {
    cle: "Différenciation",
    titre: "Distinguer quatre types de faim",
    texte:
      "Faim physiologique, envie, faim émotionnelle, faim d’habitude. Les repères qui les séparent, et la formulation des questions qui évite d’induire la réponse.",
  },
  {
    cle: "Transmission",
    titre: "Le temps d’arrêt avant la prise alimentaire",
    texte:
      "Une séquence de trente secondes à transmettre au patient, applicable entre deux consultations, sans matériel ni support écrit.",
  },
  {
    cle: "Limites",
    titre: "Reconnaître ce qui relève d’un relais",
    texte:
      "Les signes indiquant qu’un trouble dépasse le cadre de votre suivi, les contre-indications de l’approche, et vers qui orienter.",
  },
];

const mouvementReduit = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ==================================================================
   Révélation mot à mot
================================================================== */
function Mots({
  segments,
  base = 0,
  pas = 55,
}: {
  segments: { t: string; i?: boolean }[];
  base?: number;
  pas?: number;
}) {
  const mots = segments.flatMap((s) =>
    s.t.split(" ").map((m) => ({ mot: m, italique: Boolean(s.i) })),
  );

  return (
    <>
      {mots.map(({ mot, italique }, i) => {
        const style = { "--d": `${base + i * pas}ms` } as React.CSSProperties;
        return (
          <span key={`${mot}-${i}`}>
            <span className="mot">
              <span
                className={italique ? "accent-titre" : undefined}
                style={style}
              >
                {mot}
              </span>
            </span>
            {i < mots.length - 1 ? " " : ""}
          </span>
        );
      })}
    </>
  );
}

/* ==================================================================
   Entrée au scroll
================================================================== */
function Rev({
  children,
  delai = 0,
  className = "",
  variante = "rev",
  as: Tag = "div",
}: {
  children: ReactNode;
  delai?: number;
  className?: string;
  variante?: "rev" | "filet";
  as?: ElementType;
}) {
  const ref = useRef<HTMLElement | null>(null);
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
    <Tag
      ref={ref}
      className={`${variante} ${className}`}
      data-vu={vu ? "true" : "false"}
      style={{ transitionDelay: `${delai}ms` }}
    >
      {children}
    </Tag>
  );
}

/* ==================================================================
   Bouton aimanté
================================================================== */
function BoutonAimante({
  children,
  clair = false,
  occupe = false,
}: {
  children: ReactNode;
  clair?: boolean;
  occupe?: boolean;
}) {
  const ref = useRef<HTMLButtonElement | null>(null);

  const bouger = useCallback((e: React.PointerEvent<HTMLButtonElement>) => {
    const el = ref.current;
    if (!el || mouvementReduit()) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${(e.clientX - (r.left + r.width / 2)) * 0.18}px`);
    el.style.setProperty("--my", `${(e.clientY - (r.top + r.height / 2)) * 0.3}px`);
  }, []);

  const relacher = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--mx", "0px");
    el.style.setProperty("--my", "0px");
  }, []);

  return (
    <button
      ref={ref}
      type="submit"
      disabled={occupe}
      aria-busy={occupe}
      onPointerMove={bouger}
      onPointerLeave={relacher}
      /* shrink-0 : le bouton porte overflow:hidden, une compression flex
         tronquerait le libellé. */
      className={`cta shrink-0 ${clair ? "cta-clair" : ""}`}
    >
      {children}
    </button>
  );
}

/* ==================================================================
   Formulaire — un seul champ. Maquette : rien n’est transmis.
================================================================== */
function Formulaire({
  id,
  sombre = false,
  compact = false,
}: {
  id: string;
  sombre?: boolean;
  compact?: boolean;
}) {
  const [email, setEmail] = useState("");
  const [etat, setEtat] = useState<
    "saisie" | "erreur" | "envoi" | "envoye" | "echec"
  >("saisie");
  /* "demo" tant que la clé Systeme.io n'est pas configurée côté Netlify,
     "live" une fois l'inscription réellement enregistrée. */
  const [mode, setMode] = useState<"demo" | "live">("demo");
  const valide = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());
  const router = useRouter();

  const envoyer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valide(email)) {
      setEtat("erreur");
      return;
    }
    setEtat("envoi");
    try {
      const r = await fetch("/api/inscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!r.ok) throw new Error(String(r.status));
      const data = await r.json();
      setMode(data?.mode === "live" ? "live" : "demo");
      setEtat("envoye");

      /* La page de remerciement est une URL distincte : c'est elle qui sert
         d'événement de conversion pour la mesure, et c'est là que se joue
         la suite du tunnel. L'adresse est transmise par sessionStorage
         pour permettre la segmentation en un clic. */
      try {
        window.sessionStorage.setItem("mindeat.email", email.trim().toLowerCase());
      } catch {
        /* Navigation privée ou stockage refusé : la page de remerciement
           masquera simplement le bloc de segmentation. */
      }
      router.push("/merci");
    } catch {
      setEtat("echec");
    }
  };

  if (etat === "envoye") {
    return (
      <div
        role="status"
        className={`fondu rounded-md border p-6 ${
          sombre ? "border-white/30 bg-white/10" : "border-vert-frais bg-vert-pale"
        }`}
        style={{ "--d": "0ms" } as React.CSSProperties}
      >
        <p className={`surtitre ${sombre ? "text-white" : "text-vert-profond"}`}>
          {mode === "live" ? "C’est enregistré" : "Maquette de démonstration"}
        </p>
        <p
          className={`mt-3 text-[15px] leading-relaxed ${
            sombre ? "text-white/85" : "text-encre"
          }`}
        >
          {mode === "live"
            ? "Le guide part à l’instant vers votre boîte de réception. S’il n’apparaît pas d’ici quelques minutes, pensez à vérifier vos indésirables."
            : "Aucune donnée n’a été transmise et aucun guide n’a été envoyé. En production, cette validation déclencherait l’envoi du fichier et l’entrée dans la séquence de suivi."}
        </p>
      </div>
    );
  }

  return (
    <form
      noValidate onSubmit={envoyer}>
      <div className={compact ? "flex gap-2" : "flex flex-col gap-3 sm:flex-row"}>
        <label htmlFor={id} className="sr-only">
          Adresse électronique professionnelle
        </label>
        <input
          id={id}
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="Adresse électronique professionnelle"
          value={email}
          aria-invalid={etat === "erreur"}
          onChange={(e) => {
            setEmail(e.target.value);
            if (etat === "erreur") setEtat("saisie");
          }}
          className={`champ-email ${sombre ? "champ-sombre" : ""}`}
        />
        <BoutonAimante clair={sombre} occupe={etat === "envoi"}>
          {etat === "envoi" ? "Envoi…" : "Recevoir le guide"}
        </BoutonAimante>
      </div>

      {(etat === "erreur" || etat === "echec") && (
        <p
          role="alert"
          className={`mt-3 text-[14px] ${sombre ? "text-white" : "text-tomate"}`}
        >
          {etat === "erreur"
            ? "Merci d’indiquer une adresse électronique valide."
            : "L’envoi n’a pas abouti. Merci de réessayer dans un instant."}
        </p>
      )}

      {!compact && (
        <p
          className={`mt-4 text-[13px] leading-relaxed ${
            sombre ? "text-white/70" : "text-gris"
          }`}
        >
          Maquette de démonstration — aucune donnée n’est collectée. Le guide est
          un fichier exemple.
        </p>
      )}
    </form>
  );
}

/* ==================================================================
   Machine à étapes — Méthode · Usage · Accès
   Défilement automatique, mise en pause au survol, sélection au clic.
   Ne tourne que lorsque la section est à l'écran.
================================================================== */
function MachineEtapes() {
  const [actif, setActif] = useState(0);
  const listeRef = useRef<HTMLOListElement | null>(null);

  /* L'étape active suit le défilement. Pas de minuterie, pas
     d'indicateur d'attente : c'est le lecteur qui fait avancer le
     parcours. La mesure porte sur la rangée de cartes et non sur la
     section entière, sinon la dernière étape ne s'active qu'une fois les
     cartes à moitié sorties de l'écran. */
  useEffect(() => {
    const el = listeRef.current;
    if (!el) return;
    let raf = 0;

    const mesurer = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      // 0 quand le haut de la rangée atteint 82 % de la hauteur de fenêtre,
      // 1 quand son bas remonte à 25 %.
      const debut = vh * 0.82;
      const fin = vh * 0.25 - r.height;
      const progression = (debut - r.top) / (debut - fin);
      const index = Math.floor(progression * ETAPES.length);
      setActif(Math.min(ETAPES.length - 1, Math.max(0, index)));
    };

    const auScroll = () => {
      if (!raf) raf = requestAnimationFrame(mesurer);
    };

    mesurer();
    window.addEventListener("scroll", auScroll, { passive: true });
    window.addEventListener("resize", auScroll);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("scroll", auScroll);
      window.removeEventListener("resize", auScroll);
    };
  }, []);

  return (
    <div className="mx-auto max-w-6xl">
      <Rev>
        <p className="surtitre text-vert-profond">Comment cela se passe</p>
      </Rev>
      <Rev delai={110}>
        <h2 className="h2 mt-5 max-w-[17ch]">Trois étapes, aucune friction</h2>
      </Rev>

      <ol ref={listeRef} className="mt-14 grid gap-4 lg:grid-cols-3 lg:gap-5">
        {ETAPES.map((e, i) => (
          <Rev as="li" key={e.cle} delai={i * 120}>
            <article
              data-actif={actif === i}
              className="etape flex h-full flex-col p-7"
            >
              <div className="flex items-center gap-5">
                <span className="pastille shrink-0" aria-hidden="true">
                  <span className="chiffre text-[15px]">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </span>

                <svg
                  className="glyphe shrink-0"
                  width="40"
                  height="40"
                  viewBox="0 0 40 40"
                  fill="none"
                  stroke={actif === i ? "#2e6b4f" : "#94a3b8"}
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  {e.glyphe}
                </svg>
              </div>

              <div className="mt-7">
                <p className="surtitre text-vert-profond">{e.cle}</p>
                <h3 className="h3 mt-3 text-[19px]">{e.titre}</h3>
                <p className="mt-4 text-[15px] leading-relaxed text-gris">
                  {e.detail}
                </p>
              </div>
            </article>
          </Rev>
        ))}
      </ol>

      {/* Avancement d'ensemble */}
      <div
        aria-hidden="true"
        className="liaison mt-10 hidden h-px w-full lg:block"
        data-franchi="true"
      >
        <span
          style={{ transform: `scaleX(${(actif + 1) / ETAPES.length})` }}
        />
      </div>
    </div>
  );
}

/* ==================================================================
   PAGE
================================================================== */
export default function Page() {
  const heroRef = useRef<HTMLElement | null>(null);
  const [barre, setBarre] = useState(false);
  const [actifOutil, setActifOutil] = useState(0);
  const itemsRef = useRef<(HTMLLIElement | null)[]>([]);

  const halo = useCallback((e: React.PointerEvent<HTMLElement>) => {
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--cx", `${e.clientX - r.left}px`);
    el.style.setProperty("--cy", `${e.clientY - r.top}px`);
  }, []);

  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => setBarre(!e.isIntersecting), {
      threshold: 0,
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    const els = itemsRef.current.filter(Boolean) as HTMLLIElement[];
    if (!els.length) return;
    const obs = new IntersectionObserver(
      (entrees) => {
        entrees.forEach((e) => {
          if (e.isIntersecting) {
            const i = els.indexOf(e.target as HTMLLIElement);
            if (i >= 0) setActifOutil(i);
          }
        });
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 },
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  return (
    <>
      {/* Jauge de lecture — CSS natif piloté au scroll */}
      <div className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-[3px] bg-bordure/60">
        <div className="jauge h-full origin-left bg-vert-profond" />
      </div>

      {/* ============================================================
          1. HERO — photo plein cadre en fond, texte centré par-dessus.
          Le voile clair est la décision de fond : sans lui la photo
          concurrence le titre au lieu de le porter. Il est plus opaque au
          centre, où vit le texte, et se dissipe vers les bords où la
          photo peut respirer.
      ============================================================ */}
      <section
        ref={heroRef}
        className="relative isolate flex min-h-[100svh] items-center overflow-hidden bg-creme"
      >
        {/* Photo — occupe toute la section */}
        <div className="volet absolute inset-0" style={{ "--d": "0ms" } as React.CSSProperties}>
          <div className="photo-parallaxe absolute inset-0">
            <div
              aria-hidden="true"
              className="kenburns absolute inset-[-6%] bg-cover bg-center"
              style={{ backgroundImage: `url("${PHOTO_HERO}")` }}
            />
          </div>

          {/* Voile qui fait dominer le texte sur l'image, en deux couches.
              Une première couche unie et légère évite que la photo ne
              reste vive jusque dans les coins ; une seconde, en dégradé
              radial très ouvert (95 % de la section), maintient une
              opacité quasi constante sur toute la hauteur qu'occupe le
              texte — du surtitre au formulaire — et ne se dissipe qu'aux
              franges. Un premier essai concentrait l'opacité sur le seul
              centre géométrique : la photo redevenait dominante derrière
              le surtitre, en haut de la colonne. */}
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-creme/45"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 95% 92% at 50% 50%, rgba(250,247,241,0.9) 0%, rgba(250,247,241,0.86) 55%, rgba(250,247,241,0.55) 82%, rgba(250,247,241,0.15) 100%)",
            }}
          />

          <svg aria-hidden="true" className="grain opacity-[0.045]">
            <filter id="grain">
              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.65"
                numOctaves="3"
                stitchTiles="stitch"
              />
            </filter>
            <rect width="100%" height="100%" filter="url(#grain)" />
          </svg>
        </div>

        {/* Texte — centré, au-dessus du voile */}
        <div className="relative z-10 mx-auto w-full max-w-5xl px-6 py-24 text-center sm:px-10">
          <p
            className="fondu surtitre text-vert-profond"
            style={{ "--d": "220ms" } as React.CSSProperties}
          >
            Guide gratuit · Professionnels de santé
          </p>

          <h1 className="h1 mx-auto mt-6 max-w-[26ch]">
            <Mots segments={TITRE_HERO} base={340} pas={55} />
          </h1>

          <p
            className="fondu mx-auto mt-7 max-w-[46ch] text-[17px] leading-[1.8] text-gris"
            style={{ "--d": "980ms" } as React.CSSProperties}
          >
            Pour les médecins, diététiciens, psychologues, infirmiers et
            sages-femmes confrontés aux troubles du comportement
            alimentaire : cinq pratiques issues du protocole MB-EAT,
            utilisables dès votre prochaine consultation.
          </p>

          <div
            className="fondu mx-auto mt-10 max-w-xl text-left"
            style={{ "--d": "1140ms" } as React.CSSProperties}
          >
            <Formulaire id="email-hero" />
          </div>
        </div>

        <div
          className="fondu absolute bottom-7 left-1/2 z-10 hidden -translate-x-1/2 lg:block"
          style={{ "--d": "1600ms" } as React.CSSProperties}
        >
          <div className="trait-descend relative h-12 w-px overflow-hidden bg-bordure" />
        </div>
      </section>

      {/* ============================================================
          2. LES TROIS ÉTAPES
      ============================================================ */}
      <section className="border-y border-bordure bg-sable px-6 py-24 sm:px-10 sm:py-28">
        <MachineEtapes />
      </section>

      {/* ============================================================
          3. AUTORITÉ
      ============================================================ */}
      <section className="bg-creme px-6 py-28 sm:px-10 sm:py-32">
        <div className="mx-auto max-w-6xl">
          <Rev>
            <p className="surtitre text-vert-profond">Qui rédige ce guide</p>
          </Rev>
          <Rev delai={110}>
            <h2 className="h2 mt-5 max-w-[20ch]">
              L’équipe qui forme les instructeurs
            </h2>
          </Rev>

          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {FORMATEURS.map((f, i) => (
              <Rev key={f.nom} delai={i * 130}>
                <article onPointerMove={halo} className="carte h-full p-7">
                  <div className="mb-7 flex aspect-[4/3] items-center justify-center rounded-md border border-dashed border-bordure bg-sable">
                    <span className="surtitre text-gris-clair">Portrait à fournir</span>
                  </div>
                  <h3 className="h3 text-[22px]">{f.nom}</h3>
                  <ul className="mt-4 space-y-1.5">
                    {f.certifications.map((c) => (
                      <li key={c} className="text-[14px] leading-snug text-vert-profond">
                        {c}
                      </li>
                    ))}
                  </ul>
                </article>
              </Rev>
            ))}
          </div>

          <Rev delai={120}>
            <p className="surtitre mt-12 text-gris-clair">
              9 séances · 31 h · 16 participants au maximum
            </p>
          </Rev>
        </div>
      </section>

      {/* ============================================================
          4. CONTENU DU GUIDE — index collant
      ============================================================ */}
      <section className="bg-ivoire px-6 sm:px-10">
        <div className="mx-auto grid max-w-6xl gap-x-16 pb-24 lg:grid-cols-[19rem_1fr]">
          <div className="top-0 hidden h-screen flex-col justify-center lg:sticky lg:flex">
            <p className="surtitre text-vert-profond">Ce que contient le guide</p>
            <h2 className="h2 mt-5">Cinq pratiques décrites pour être utilisées</h2>

            <div className="mt-11 flex items-end gap-5">
              <div
                className="chiffre-piste chiffre text-[5rem] font-extrabold leading-none text-vert-profond"
                style={{ fontVariantNumeric: "tabular-nums", width: "2.2ch" }}
                aria-hidden="true"
              >
                {OUTILS.map((_, i) => (
                  <span
                    key={i}
                    style={{
                      transform: `translateY(${(i - actifOutil) * 100}%)`,
                      opacity: i === actifOutil ? 1 : 0,
                    }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                ))}
              </div>
              <span className="surtitre mb-3 text-gris-clair">/ 05</span>
            </div>

            <div className="mt-7 h-px w-full bg-bordure">
              <div
                className="h-full bg-vert-profond transition-transform duration-700 ease-out"
                style={{
                  transform: `scaleX(${(actifOutil + 1) / OUTILS.length})`,
                  transformOrigin: "left",
                }}
              />
            </div>
          </div>

          <div className="pt-24 lg:hidden">
            <p className="surtitre text-vert-profond">Ce que contient le guide</p>
            <h2 className="h2 mt-5">Cinq pratiques décrites pour être utilisées</h2>
          </div>

          <ol className="lg:pt-[38vh]">
            {OUTILS.map((o, i) => (
              <li
                key={o.titre}
                ref={(el) => {
                  itemsRef.current[i] = el;
                }}
                className="flex min-h-[50vh] flex-col justify-center border-b border-bordure py-14 last:border-b-0"
              >
                <Rev>
                  <div className="flex items-baseline gap-4">
                    <span
                      className="chiffre text-[15px] tabular-nums text-vert-frais lg:hidden"
                      aria-hidden="true"
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <p className="surtitre text-gris-clair">{o.cle}</p>
                  </div>
                  <h3 className="h3 mt-5 max-w-[18ch] text-[clamp(1.5rem,3.2vw,2.1rem)]">
                    {o.titre}
                  </h3>
                  <p className="mt-5 max-w-[46ch] text-[16px] leading-[1.8] text-gris">
                    {o.texte}
                  </p>
                </Rev>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ============================================================
          5. CAPTURE FINALE
      ============================================================ */}
      <section className="relative overflow-hidden bg-vert-profond px-6 py-28 sm:px-10 sm:py-32">
        <div className="mx-auto max-w-2xl text-center">
          <Rev>
            <p className="surtitre text-vert-frais">Le guide, gratuitement</p>
          </Rev>
          <Rev delai={110}>
            <h2 className="h2 mx-auto mt-5 max-w-[16ch] text-white">
              Vous le lisez ce soir, vous l’utilisez demain
            </h2>
          </Rev>
          <Rev delai={220}>
            <div className="mt-10 text-left">
              <Formulaire id="email-bas" sombre />
            </div>
          </Rev>
        </div>
      </section>

      {/* ============================================================
          6. FOOTER
      ============================================================ */}
      <footer className="bg-creme px-6 py-12 pb-28 sm:px-10 sm:pb-12">
        <p className="surtitre mx-auto max-w-6xl text-gris-clair">
          Proposition indépendante — non commanditée par Mind-Eat
        </p>
      </footer>

      {/* CTA collant — mobile uniquement */}
      <div
        className={`fixed inset-x-0 bottom-0 z-50 border-t border-bordure bg-creme/95 px-4 py-3 backdrop-blur-md transition-transform duration-500 sm:hidden ${
          barre ? "translate-y-0" : "translate-y-full"
        }`}
        style={{ transitionTimingFunction: "var(--ease)" }}
      >
        <Formulaire id="email-barre" compact />
      </div>
    </>
  );
}
