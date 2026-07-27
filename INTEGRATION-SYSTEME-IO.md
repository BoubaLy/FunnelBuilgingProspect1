# Connecter la page à Systeme.io

Marche à suivre pour que le formulaire alimente réellement Systeme.io et
déclenche la séquence décrite dans [`sequence-emails.md`](sequence-emails.md).

---

## Le point à comprendre avant de commencer

La clé d'API Systeme.io **ne doit jamais se trouver dans le code envoyé au
navigateur**. Une clé publiée dans une page permet à n'importe qui de lire, créer
et supprimer les contacts du compte.

La page étant un site statique, elle ne peut pas garder de secret. Il faut donc
un intermédiaire côté serveur : une **fonction Netlify**, déjà écrite dans
`netlify/functions/inscription.mjs`. Elle reçoit l'adresse, lit la clé dans les
variables d'environnement Netlify, et appelle Systeme.io.

**Conséquence pratique :** les fonctions ne sont pas embarquées dans un dépôt par
glisser-déposer du dossier `out/`. Il faut passer à un déploiement connecté à Git
ou utiliser la CLI Netlify. C'est l'étape 3.

Tant que la clé n'est pas renseignée, la fonction répond en mode démonstration :
rien n'est transmis et la page conserve sa mention de maquette. Renseigner la clé
suffit à basculer en production, sans toucher au code.

---

## Étape 1 — Préparer le compte Systeme.io

1. **Créer le tag d'entrée.** Dans *Contacts → Tags*, créer un tag nommé
   `guide-5-outils`. C'est lui qui déclenchera la séquence.

   **Créer aussi les six tags de profession**, utilisés par la page de
   remerciement pour segmenter en un clic. Les noms doivent être exacts, la
   fonction les résout par leur libellé :

   ```
   prof-medecin        prof-dieteticien    prof-psychologue
   prof-infirmier      prof-sage-femme     prof-autre
   ```

   Ils servent principalement à router l'email de financement : les
   dispositifs diffèrent selon la profession (FIF PL pour les diététiciens,
   psychologues, infirmiers et sages-femmes ; FAF-PM pour les médecins).

2. **Créer la séquence.** Dans *Emails → Campagnes*, créer une campagne et y
   saisir les onze emails de `sequence-emails.md` avec leurs délais respectifs
   (J+0, J+2, J+5, J+8, J+12, J+15, J+19, J+23, J+27, J+31, J+34).

3. **Créer la règle d'automatisation.** Dans *Automatisations → Règles* :
   - Déclencheur : `Tag ajouté` → `guide-5-outils`
   - Action : `S'abonner à la campagne` → la campagne créée à l'étape 2

4. **Déposer le guide.** Le PDF n'existe pas encore. Le produire, le charger dans
   Systeme.io, et insérer son lien de téléchargement dans l'email E0.

---

## Étape 2 — Récupérer la clé et l'identifiant du tag

**La clé d'API.** Dans Systeme.io, *Paramètres du profil → Clés d'API publiques*
→ créer une clé, lui donner un nom et une date d'expiration. Trois clés maximum
par compte. Copier la valeur : elle n'est affichée qu'une fois.

**L'identifiant du tag.** Il n'apparaît pas dans l'interface. Le récupérer par
l'API, depuis un terminal :

```bash
curl -s 'https://api.systeme.io/api/tags' -H 'X-API-Key: VOTRE_CLE'
```

Repérer dans la réponse l'objet dont le `name` vaut `guide-5-outils` et noter son
`id` — un nombre.

---

## Étape 3 — Passer Netlify en déploiement connecté

Le glisser-déposer ne publie que des fichiers statiques. Deux options.

### Option recommandée — dépôt Git

1. Publier le dossier `mind-eat-capture/` sur GitHub, GitLab ou Bitbucket.
2. Sur Netlify : *Site configuration → Build & deploy → Link repository*.
3. Netlify lit `netlify.toml` et applique automatiquement :
   - commande de build : `npm run build:statique`
   - dossier publié : `out`
   - dossier des fonctions : `netlify/functions`
   - Node 22

Chaque `git push` redéploiera le site.

### Option sans Git — CLI Netlify

```bash
cd "chemin/vers/mind-eat-capture"
npx netlify-cli login
npx netlify-cli link
npm run build:statique
npx netlify-cli deploy --prod
```

La CLI embarque les fonctions, contrairement au glisser-déposer.

---

## Étape 4 — Renseigner les variables d'environnement

Sur Netlify, *Site configuration → Environment variables*, ajouter :

| Variable | Valeur | Rôle |
|---|---|---|
| `SYSTEME_IO_API_KEY` | la clé de l'étape 2 | Authentifie les appels. **Sans elle, mode démonstration.** |
| `SYSTEME_IO_TAG_ID` | l'identifiant numérique du tag | Déclenche la séquence |
| `NEXT_PUBLIC_SITE_URL` | l'URL publique du site | Corrige les aperçus de lien |

Redéployer après ajout : les variables ne sont lues qu'au démarrage des
fonctions.

---

## Étape 5 — Vérifier

1. Soumettre une adresse de test sur la page en ligne.
2. La confirmation doit afficher « C'est enregistré » et non « Maquette de
   démonstration ». Si le message de maquette persiste, la clé n'est pas lue :
   vérifier son nom exact et redéployer.
3. Dans Systeme.io, *Contacts* : l'adresse doit apparaître, avec le tag
   `guide-5-outils`.
4. Sur la page de remerciement, cliquer une profession. Le contact doit
   recevoir le tag `prof-*` correspondant. Si le tag n'existe pas dans
   Systeme.io, la fonction l'ignore et l'écrit dans ses journaux plutôt que
   d'échouer.
5. L'email E0 doit arriver dans les minutes qui suivent.
6. En cas d'échec, les journaux de la fonction sont dans *Netlify → Functions →
   inscription*. La fonction y écrit le code de retour et le corps de la réponse
   Systeme.io.

---

## Détails techniques de l'API

Source : [documentation publique Systeme.io](https://developer.systeme.io/reference).

| | |
|---|---|
| Base | `https://api.systeme.io/api` |
| Authentification | en-tête `X-API-Key: votre_cle` |
| Créer un contact | `POST /contacts` |
| Poser un tag | `POST /contacts/{id}/tags` |
| Lister les tags | `GET /tags` |
| Mise à jour partielle | `PATCH`, avec `Content-Type: application/merge-patch+json` |

**Point à valider.** La documentation consultée ne détaille pas la liste exacte
des champs acceptés à la création d'un contact au-delà de `email`. La fonction
n'envoie donc que l'adresse, ce qui suffit au fonctionnement. Pour transmettre
aussi un prénom ou une profession, vérifier le format attendu dans la référence
avant d'étendre le corps de la requête — un champ mal nommé fait échouer la
requête entière.

**Contact déjà connu.** Systeme.io renvoie une erreur si l'adresse existe déjà.
La fonction traite ce cas comme normal : elle retrouve le contact et se contente
de lui appliquer le tag. Un praticien qui redemande le guide n'est donc ni
dupliqué ni bloqué.

---

## Alternative sans code

Si le passage à un déploiement Git n'est pas envisageable, deux solutions
existent, avec leurs contreparties.

**Formulaire Systeme.io embarqué.** Créer le formulaire dans Systeme.io et
insérer son code d'intégration à la place du formulaire actuel. Aucune fonction,
aucune clé à gérer. En revanche le champ perd le style de la page, et l'apparence
dépend de Systeme.io.

**Netlify Forms plus une passerelle.** Ajouter `data-netlify="true"` au
formulaire, puis relier les soumissions à Systeme.io via Zapier ou Make. Cela
suppose de renoncer à la soumission React actuelle et d'ajouter un abonnement à
un service tiers.

La fonction Netlify reste préférable : elle conserve le design, ne dépend
d'aucun service supplémentaire, et garde la clé hors du navigateur.
