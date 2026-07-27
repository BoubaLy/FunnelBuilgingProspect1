/**
 * Passerelle entre le formulaire de la page et Systeme.io.
 *
 * Raison d'être : la clé d'API Systeme.io ne doit jamais se trouver dans le
 * code envoyé au navigateur. Cette fonction s'exécute côté serveur, lit la
 * clé dans les variables d'environnement Netlify et relaie l'inscription.
 *
 * Tant que SYSTEME_IO_API_KEY n'est pas renseignée, la fonction répond en
 * mode démonstration : rien n'est transmis, et la page conserve sa mention
 * de maquette. Renseigner la clé suffit à passer en production.
 *
 * Référence API : https://developer.systeme.io/reference
 *   POST /contacts             → crée le contact
 *   POST /contacts/{id}/tags   → lui applique un tag
 *   En-tête d'authentification : X-API-Key
 */

const API = "https://api.systeme.io/api";

const entetes = {
  "content-type": "application/json",
  "cache-control": "no-store",
};

const reponse = (corps, statut = 200) =>
  new Response(JSON.stringify(corps), { status: statut, headers: entetes });

const emailValide = (v) =>
  typeof v === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());

export default async (req) => {
  if (req.method !== "POST") {
    return reponse({ erreur: "Méthode non autorisée" }, 405);
  }

  let donnees;
  try {
    donnees = await req.json();
  } catch {
    return reponse({ erreur: "Corps de requête illisible" }, 400);
  }

  const email = String(donnees?.email ?? "").trim().toLowerCase();
  if (!emailValide(email)) {
    return reponse({ erreur: "Adresse électronique invalide" }, 422);
  }

  // Tags supplémentaires demandés par la page, désignés par leur nom.
  // Sert à la segmentation par profession depuis la page de remerciement.
  const tagsDemandes = Array.isArray(donnees?.tags)
    ? donnees.tags.map((t) => String(t).trim()).filter(Boolean).slice(0, 4)
    : [];

  const cle = process.env.SYSTEME_IO_API_KEY;
  const tagId = process.env.SYSTEME_IO_TAG_ID;

  // Mode démonstration : aucune clé configurée, rien n'est transmis.
  if (!cle) {
    return reponse({ mode: "demo" });
  }

  try {
    // 1. Création du contact.
    const creation = await fetch(`${API}/contacts`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-API-Key": cle },
      body: JSON.stringify({ email }),
    });

    // 422 = contact déjà connu : ce n'est pas une erreur pour nous, on
    // veut simplement s'assurer qu'il porte le bon tag.
    if (!creation.ok && creation.status !== 422) {
      const detail = await creation.text();
      console.error("Systeme.io — création contact", creation.status, detail);
      return reponse({ erreur: "Enregistrement impossible" }, 502);
    }

    let contactId = null;
    if (creation.ok) {
      const cree = await creation.json().catch(() => null);
      contactId = cree?.id ?? null;
    } else {
      // Contact existant : on le retrouve par son adresse.
      const recherche = await fetch(
        `${API}/contacts?email=${encodeURIComponent(email)}`,
        { headers: { "X-API-Key": cle } },
      );
      const trouve = await recherche.json().catch(() => null);
      contactId = trouve?.items?.[0]?.id ?? trouve?.[0]?.id ?? null;
    }

    if (!contactId) {
      console.error("Systeme.io — contact introuvable après création");
      return reponse({ mode: "live" });
    }

    const poser = async (id) => {
      const pose = await fetch(`${API}/contacts/${contactId}/tags`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-API-Key": cle },
        body: JSON.stringify({ tagId: Number(id) }),
      });
      if (!pose.ok) {
        console.error("Systeme.io — pose du tag", id, pose.status, await pose.text());
      }
    };

    // 2. Tag d'entrée : c'est lui qui déclenche la séquence.
    if (tagId) await poser(tagId);

    // 3. Tags de segmentation, résolus par leur nom.
    if (tagsDemandes.length) {
      const liste = await fetch(`${API}/tags`, { headers: { "X-API-Key": cle } });
      const tags = await liste.json().catch(() => null);
      const inventaire = tags?.items ?? tags ?? [];
      for (const nom of tagsDemandes) {
        const trouve = inventaire.find?.(
          (t) => String(t?.name).toLowerCase() === nom.toLowerCase(),
        );
        if (trouve?.id) await poser(trouve.id);
        else console.warn("Systeme.io — tag inconnu, ignoré :", nom);
      }
    }

    return reponse({ mode: "live" });
  } catch (e) {
    console.error("Systeme.io — appel réseau", e);
    return reponse({ erreur: "Service temporairement indisponible" }, 502);
  }
};

export const config = { path: "/api/inscription" };
