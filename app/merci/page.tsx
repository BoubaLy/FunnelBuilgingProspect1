"use client";

import { useEffect, useState } from "react";

/* Emplacement du guide. Le fichier n'existe pas encore : le produire, le
   déposer dans public/, puis remplacer cette valeur par son chemin. */
const LIEN_GUIDE = "";

/* Adresse d'expédition à faire ajouter aux contacts. La délivrabilité est
   le premier poste de perte d'un aimant : un guide qui tombe en
   indésirables est un contact perdu et une séquence qui ne démarre pas. */
const EXPEDITEUR = "[ADRESSE D’ENVOI À RENSEIGNER]";

const PROFESSIONS = [
  { tag: "prof-medecin", label: "Médecin" },
  { tag: "prof-dieteticien", label: "Diététicien nutritionniste" },
  { tag: "prof-psychologue", label: "Psychologue" },
  { tag: "prof-infirmier", label: "Infirmier" },
  { tag: "prof-sage-femme", label: "Sage-femme" },
  { tag: "prof-autre", label: "Autre profession de santé" },
];

const DEMARRAGE = [
  {
    situation: "Il ne comprend pas ses propres prises alimentaires",
    outil: "Commencez par les quatre faims",
    texte:
      "« Je ne sais pas pourquoi j’ai mangé ça. » Donner un vocabulaire à ce qu’il vit comme opaque est souvent le premier soulagement de la consultation.",
  },
  {
    situation: "Il connaît les recommandations et ne les applique pas",
    outil: "Commencez par l’échelle de faim",
    texte:
      "Le problème n’est pas le savoir, c’est l’accès aux sensations. Deux questions posées au bon moment déplacent l’attention là où elle manque.",
  },
  {
    situation: "Il mange vite, debout, en travaillant",
    outil: "Commencez par la dégustation guidée",
    texte:
      "Trois minutes en consultation valent mieux qu’une consigne de ralentir qu’il aura oubliée en sortant de votre cabinet.",
  },
];

export default function Merci() {
  const [email, setEmail] = useState<string | null>(null);
  const [choix, setChoix] = useState<string | null>(null);
  const [etat, setEtat] = useState<"attente" | "envoi" | "fait">("attente");

  /* L'adresse est déposée par la page de capture au moment de la
     soumission. Sans elle, on ne peut rattacher aucun tag : le bloc de
     segmentation ne s'affiche pas plutôt que d'échouer en silence. */
  useEffect(() => {
    try {
      setEmail(window.sessionStorage.getItem("mindeat.email"));
    } catch {
      setEmail(null);
    }
  }, []);

  const segmenter = async (tag: string) => {
    if (!email || etat !== "attente") return;
    setChoix(tag);
    setEtat("envoi");
    try {
      await fetch("/api/inscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, tags: [tag] }),
      });
    } catch {
      /* La segmentation est un confort, pas une étape bloquante :
         un échec réseau ne doit pas être signalé au praticien. */
    }
    setEtat("fait");
  };

  return (
    <>
      {/* ============================================================
          1. CONFIRMATION ET LIVRAISON IMMÉDIATE
      ============================================================ */}
      <section className="bg-creme px-6 pb-20 pt-20 sm:px-10 sm:pb-24 sm:pt-28">
        <div className="mx-auto max-w-3xl">
          <p
            className="fondu surtitre text-vert-profond"
            style={{ "--d": "80ms" } as React.CSSProperties}
          >
            Étape 2 sur 2 · C’est confirmé
          </p>

          <h1
            className="fondu h1 mt-6"
            style={{ "--d": "200ms" } as React.CSSProperties}
          >
            Votre guide est <span className="accent-titre">prêt</span>
          </h1>

          <p
            className="fondu mt-6 max-w-[52ch] text-[17px] leading-[1.8] text-gris"
            style={{ "--d": "320ms" } as React.CSSProperties}
          >
            Vous pouvez le télécharger tout de suite, sans attendre l’email. Une
            copie part également vers votre boîte de réception.
          </p>

          <div
            className="fondu mt-10"
            style={{ "--d": "440ms" } as React.CSSProperties}
          >
            {LIEN_GUIDE ? (
              <a href={LIEN_GUIDE} download className="cta inline-block">
                Télécharger le guide
              </a>
            ) : (
              <div className="rounded-md border border-dashed border-bordure bg-white p-6">
                <p className="surtitre text-gris-clair">
                  Fichier à déposer
                </p>
                <p className="mt-3 max-w-[52ch] text-[15px] leading-relaxed text-gris">
                  Le guide n’existe pas encore. Une fois produit, le déposer dans
                  <code className="mx-1 rounded bg-sable px-1.5 py-0.5 text-[13px]">
                    public/
                  </code>
                  et renseigner la constante
                  <code className="mx-1 rounded bg-sable px-1.5 py-0.5 text-[13px]">
                    LIEN_GUIDE
                  </code>
                  en tête de ce fichier : le bouton de téléchargement remplacera
                  automatiquement cet encadré.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ============================================================
          2. DÉLIVRABILITÉ
      ============================================================ */}
      <section className="border-y border-bordure bg-sable px-6 py-10 sm:px-10">
        <div className="mx-auto max-w-3xl">
          <p className="surtitre text-vert-profond">Avant de fermer cette page</p>
          <p className="mt-4 max-w-[58ch] text-[16px] leading-relaxed text-gris">
            Ajoutez{" "}
            <span className="font-semibold text-encre">{EXPEDITEUR}</span> à vos
            contacts. Les messageries professionnelles filtrent sévèrement, et un
            guide qui atterrit dans les indésirables ne s’y retrouve jamais.
            L’opération prend cinq secondes et vaut pour tous les envois suivants.
          </p>
        </div>
      </section>

      {/* ============================================================
          3. SEGMENTATION — un clic, une question
      ============================================================ */}
      {email && (
        <section className="bg-creme px-6 py-20 sm:px-10 sm:py-24">
          <div className="mx-auto max-w-3xl">
            {etat === "fait" ? (
              <div className="fondu rounded-md border border-vert-frais bg-vert-pale p-7">
                <p className="surtitre text-vert-profond">C’est noté</p>
                <p className="mt-3 max-w-[54ch] text-[16px] leading-relaxed text-encre">
                  Vous ne recevrez que ce qui concerne votre exercice —
                  notamment sur le financement, dont les dispositifs diffèrent
                  d’une profession à l’autre.
                </p>
              </div>
            ) : (
              <>
                <p className="surtitre text-vert-profond">Une question, un clic</p>
                <h2 className="h2 mt-5 max-w-[24ch]">
                  Quelle est votre profession ?
                </h2>
                <p className="mt-5 max-w-[54ch] text-[16px] leading-relaxed text-gris">
                  Cela nous évite de vous envoyer des informations qui ne vous
                  concernent pas. Les dispositifs de prise en charge, en
                  particulier, ne sont pas les mêmes selon les professions.
                </p>

                <div className="mt-9 flex flex-wrap gap-3">
                  {PROFESSIONS.map((p) => (
                    <button
                      key={p.tag}
                      type="button"
                      onClick={() => segmenter(p.tag)}
                      disabled={etat === "envoi"}
                      aria-busy={etat === "envoi" && choix === p.tag}
                      className="rounded-md border border-bordure bg-white px-5 py-3 text-[15px] font-medium text-encre transition-colors duration-300 hover:border-vert-frais hover:bg-vert-pale disabled:opacity-60"
                      style={{ transitionTimingFunction: "var(--ease)" }}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </section>
      )}

      {/* ============================================================
          4. PAR OÙ COMMENCER — valeur immédiate
      ============================================================ */}
      <section className="border-t border-bordure bg-ivoire px-6 py-20 sm:px-10 sm:py-24">
        <div className="mx-auto max-w-4xl">
          <p className="surtitre text-vert-profond">Pendant que le guide arrive</p>
          <h2 className="h2 mt-5 max-w-[22ch]">
            Par quel outil commencer, selon le patient
          </h2>

          <ol className="mt-12 border-t border-bordure">
            {DEMARRAGE.map((d, i) => (
              <li
                key={d.outil}
                className="grid gap-x-8 gap-y-3 border-b border-bordure py-8 md:grid-cols-[3rem_1fr]"
              >
                <span className="chiffre text-[15px] text-vert-profond">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <p className="text-[15px] leading-relaxed text-gris-clair">
                    {d.situation}
                  </p>
                  <h3 className="h3 mt-2 text-[19px]">{d.outil}</h3>
                  <p className="mt-3 max-w-[58ch] text-[16px] leading-relaxed text-gris">
                    {d.texte}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ============================================================
          5. L'ÉTAPE SUIVANTE
      ============================================================ */}
      <section className="bg-vert-profond px-6 py-24 sm:px-10 sm:py-28">
        <div className="mx-auto max-w-3xl">
          <p className="surtitre text-vert-frais">Si vous voulez aller plus loin</p>
          <h2 className="h2 mt-5 max-w-[22ch] text-white">
            Le guide s’arrête là où commence la conduite d’entretien
          </h2>

          <div className="mt-8 max-w-[58ch] space-y-5 text-[16px] leading-[1.8] text-white/80">
            <p>
              Les cinq outils sont utilisables seuls. Ce qu’un document ne peut
              pas transmettre, c’est la façon de recueillir l’expérience d’un
              patient sans lui suggérer ce qu’il aurait dû ressentir — un geste
              qui se corrige en situation, pas à la lecture.
            </p>
            <p>
              C’est l’objet de la formation d’instructeur : neuf séances de
              3 h 30 en visioconférence, seize participants au maximum, réservée
              aux professionnels de santé.
            </p>
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <a href="/" className="cta cta-clair inline-block">
              Voir le programme
            </a>
            <span className="text-[15px] text-white/60">
              Aucun engagement, la page détaille les dates et le prérequis.
            </span>
          </div>
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
