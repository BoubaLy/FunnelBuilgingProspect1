# Page de capture — guide MB-EAT

> **Proposition indépendante — non commanditée par Mind-Eat.**
>
> Maquette de démonstration. Elle n'a pas été commandée par Mind-Eat et ne constitue pas
> une communication officielle. Aucun logo ni élément de marque n'est utilisé, aucun
> contenu n'est repris de leur site. Le guide, les portraits et le contenu éditorial sont
> des emplacements à compléter, signalés comme tels.

Page unique destinée à un seul objectif : recueillir l'adresse électronique d'un
professionnel de santé en échange d'un guide clinique gratuit. Aucun menu, aucune
navigation, aucun lien sortant.

---

## Installation

```bash
npm install
npm run dev
```

`http://localhost:3000`

| Commande | Effet |
|---|---|
| `npm run dev` | serveur de développement |
| `npm run build` | build standard, pour un hébergeur Next |
| `npm run build:statique` | génère en plus `out/`, déposable sur tout hébergeur |

**Stack** — Next.js 15.5.22, Tailwind CSS v4, TypeScript. Aucune librairie d'animation :
tout repose sur CSS natif et Intersection Observer.

```
app/
  layout.tsx                    polices, métadonnées SEO, Open Graph, JSON-LD Course
  page.tsx                      page de capture
  merci/page.tsx                page de remerciement
  merci/layout.tsx              métadonnées de la page de remerciement (noindex)
  globals.css                   jetons de design, typographie, animations
netlify/functions/
  inscription.mjs               passerelle vers Systeme.io, garde la clé côté serveur
public/
  hero-bol.jpg                  photographie du hero
netlify.toml                    configuration de build et de déploiement
sequence-emails.md              les onze emails et les branches de relance
INTEGRATION-SYSTEME-IO.md       marche à suivre pour brancher le formulaire
```

---

## Emails et automatisation

Le formulaire alimente **Systeme.io**, qui héberge la séquence et l'envoi.

- [`sequence-emails.md`](sequence-emails.md) — les onze emails rédigés, leurs
  délais et les trois branches conditionnelles.
- [`INTEGRATION-SYSTEME-IO.md`](INTEGRATION-SYSTEME-IO.md) — les cinq étapes de
  branchement.

La clé d'API ne peut pas vivre dans un site statique : elle serait lisible par
n'importe quel visiteur. Elle est donc lue par une fonction Netlify
(`netlify/functions/inscription.mjs`) qui relaie l'inscription.

**Tant que `SYSTEME_IO_API_KEY` n'est pas renseignée, le formulaire reste en mode
démonstration** : rien n'est transmis et la page conserve sa mention de maquette.
Renseigner la variable suffit à basculer en production, sans modifier le code.

**Attention au mode de déploiement.** Les fonctions ne sont pas embarquées dans un
dépôt par glisser-déposer du dossier `out/`. Le branchement Systeme.io suppose un
déploiement connecté à Git ou lancé via la CLI Netlify.

---

## Direction artistique

### Photographie

`public/hero-bol.jpg` — photographie de Brooke Lark, publiée sur Unsplash sous licence
Unsplash : usage commercial libre, aucune attribution requise. Le fichier est servi en
local, ce qui évite toute dépendance réseau et toute configuration de domaine d'images.

Elle occupe la moitié droite du hero en pleine hauteur, avec un mouvement de recadrage
lent de 30 secondes. Sur mobile, elle passe en bandeau sous le formulaire, de façon que
le champ de saisie reste le premier élément visible.

### Couleur

La palette est prélevée dans la photographie, ce qui garantit la cohérence de l'ensemble.

| Jeton | Valeur | Usage |
|---|---|---|
| `--color-creme` | `#FAF7F1` | Fond principal |
| `--color-sable` | `#F2ECE1` | Section des étapes |
| `--color-ivoire` | `#FFFFFF` | Cartes, section du guide |
| `--color-vert-profond` | `#2E6B4F` | Boutons, bloc de conversion |
| `--color-vert-frais` | `#63B98A` | Accents, compteurs |
| `--color-bleu-bol` | `#4E7A96` | Accent secondaire |
| `--color-tomate` | `#C8503A` | Messages d'erreur |
| `--color-encre` | `#1F1D1A` | Texte |
| `--color-gris` | `#6F6A61` | Texte secondaire |

La page est claire dans son ensemble. Le bloc de conversion final est le seul aplat
profond, ce qui isole visuellement le dernier formulaire.

### Typographie

- **Fraunces** — titres. Axes `WONK` et `SOFT` fixés à 0. H1 jusqu'à 72 px, graisse 700,
  interlettrage `-0.035em`, équilibrage des lignes par `text-wrap: balance`.
- **Public Sans** — corps de texte, 17 px, interligne 1.75.
- **JetBrains Mono** — libellés, numéros et compteurs, 13 px en capitales.

---

## Structure et interactions

**1. Hero** — accroche, sous-titre, formulaire à un champ. Le titre se révèle mot à mot
au chargement ; la photographie se dévoile par volet.

**2. Étapes — Méthode · Usage · Accès** — parcours en trois étapes à défilement
automatique toutes les 5,2 secondes. Un anneau de progression se referme autour de la
pastille active, le glyphe se retrace, le détail se déplie. Le survol met le cycle en
pause, le clic sélectionne une étape, et la minuterie ne tourne que lorsque la section
est visible à l'écran.

**3. Autorité** — les trois formateurs, certifications mises en avant. Les cartes
réagissent au pointeur par un halo.

**4. Contenu du guide** — cinq outils présentés avec un index latéral fixe : le compteur
passe de 01 à 05 et une barre de progression accompagne la lecture.

**5. Conversion** — reprise du formulaire sur aplat vert.

**6. Pied de page** — mention du statut de la proposition.

Un rappel d'appel à l'action apparaît en bas d'écran sur mobile, une fois le hero dépassé.

### Page de remerciement — `/merci`

La soumission du formulaire redirige vers `/merci`, URL distincte qui sert
d'événement de conversion pour la mesure. La page enchaîne cinq blocs :

1. **Livraison immédiate** du guide, sans attendre l'email — l'email est la
   copie de secours, pas le canal principal.
2. **Consigne de délivrabilité.** Faire ajouter l'expéditeur aux contacts. Un
   guide tombé en indésirables est un contact perdu et une séquence qui ne
   démarre jamais.
3. **Segmentation en un clic.** Une question, six boutons : la profession. Le
   choix pose un tag `prof-*` dans Systeme.io et permet de router l'email de
   financement. Le bloc ne s'affiche que si l'adresse est connue.
4. **Valeur immédiate.** Par quel outil commencer selon le patient — de quoi
   occuper utilement le temps d'arrivée de l'email.
5. **Étape suivante.** La formation, présentée à partir de la limite du guide.

La page est en `noindex` : atteignable sans passer par le formulaire, elle
fausserait la mesure et laisserait fuir la ressource.

### Accessibilité et performance

- `prefers-reduced-motion` neutralise l'intégralité des animations.
- Les champs portent des libellés associés ; les états d'erreur et de confirmation sont
  annoncés par `role="alert"` et `role="status"`.
- Les animations continues (jauge de lecture, parallaxe) utilisent les timelines de
  défilement CSS natives, encapsulées dans `@supports`. Sur les navigateurs qui ne les
  prennent pas encore en charge, la page reste complète et fonctionnelle.
- Page statique prérendue, 108 Ko de JavaScript au premier chargement.

---

## Éléments à compléter avant mise en ligne

### Contenu

- [ ] **Le guide.** Le fichier n'existe pas : le produire, le déposer dans `public/` et
      déclencher le téléchargement après validation du formulaire.
- [ ] **Portraits des trois formateurs.** Les cartes portent un emplacement marqué.
      Aucune photographie de substitution n'a été utilisée.
- [ ] **Contenu des cinq outils et des trois étapes.** Rédigé à partir de la structure
      publiée du protocole MB-EAT, à valider par l'équipe pédagogique.
- [ ] **Titres et certifications** des formateurs, à confirmer à la source.

### Technique

- [ ] Renseigner `SYSTEME_IO_API_KEY` et `SYSTEME_IO_TAG_ID` sur Netlify, et passer
      en déploiement Git ou CLI. Voir [`INTEGRATION-SYSTEME-IO.md`](INTEGRATION-SYSTEME-IO.md).
- [ ] Saisir les onze emails de [`sequence-emails.md`](sequence-emails.md) dans
      Systeme.io et créer la règle d'automatisation sur le tag `guide-5-outils`.
- [ ] Faire relire et signer les emails par l'un des trois formateurs — les mentions
      `[SIGNATAIRE]` sont volontairement vides.
- [ ] Renseigner `URL_SITE` et retirer `robots: { index: false }` dans `app/layout.tsx`.
- [ ] Ajouter une image Open Graph (`app/opengraph-image.png`).
- [ ] Renseigner le nom de l'organisme dans le JSON-LD.
- [ ] Mentions légales et politique de confidentialité, obligatoires dès lors qu'une
      adresse électronique est collectée. Elles impliquent un lien sortant : à arbitrer,
      probablement en pied de page.
- [ ] Vérifier la conformité RGPD : base légale, durée de conservation, consentement.

---

## Point de vigilance éditoriale

La bande de réassurance indique « Protocole MB-EAT, évalué en essais contrôlés ».

Cette formulation a été préférée à « validé scientifiquement ». Les données publiées,
notamment l'essai randomisé de Kristeller, Wolever et Sheets paru en 2014 dans
*Mindfulness*, documentent une réduction des épisodes de crise chez des patients
présentant une hyperphagie boulimique ; les effets sur le poids restent en revanche
modestes et inconstants, sur des effectifs limités. Le lectorat visé étant composé de
cliniciens, une affirmation non qualifiée exposerait l'ensemble de la page à la critique.

Cette mention engageant la parole de l'organisme, elle doit être relue et validée avant
toute mise en ligne.

---

## Environnement

Testé sous Node 26. Next.js 15 supporte officiellement Node 18.18, 20 et 22 ; en cas
d'instabilité du serveur de développement, utiliser Node 22 LTS.

ESLint n'est pas installé, afin que la règle `react/no-unescaped-entities` ne bloque pas
le build sur les apostrophes typographiques françaises employées dans les textes.
