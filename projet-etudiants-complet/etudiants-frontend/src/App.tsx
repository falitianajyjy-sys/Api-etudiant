import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { etudiantsApi } from "./api/etudiants.api";
import { authApi } from "./api/auth.api";
import type { Etudiant, EtudiantFormData } from "./types/etudiant.types";
import "./App.css";

const FORM_VIDE: EtudiantFormData = { nom: "", prenom: "", email: "", age: 0 };

export default function App() {
  // Le token JWT est gardé UNIQUEMENT en mémoire (useState), jamais dans
  // localStorage/sessionStorage ici par choix de simplicité pédagogique.
  // Conséquence : le token est perdu si la page est rafraîchie (F5) —
  // il faut se reconnecter. En production, on le persisterait plus
  // durablement (avec des précautions de sécurité supplémentaires).
  const [token, setToken] = useState<string | null>(null);
  const [emailConnexion, setEmailConnexion] = useState("");
  const [motDePasseConnexion, setMotDePasseConnexion] = useState("");
  const [erreurConnexion, setErreurConnexion] = useState<string | null>(null);
  const [connexionEnCours, setConnexionEnCours] = useState(false);

  const [etudiants, setEtudiants] = useState<Etudiant[]>([]);
  const [chargement, setChargement] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [formulaireOuvert, setFormulaireOuvert] = useState(false);
  const [enEdition, setEnEdition] = useState<Etudiant | null>(null);
  const [formData, setFormData] = useState<EtudiantFormData>(FORM_VIDE);
  const [envoiEnCours, setEnvoiEnCours] = useState(false);

  async function chargerEtudiants(tokenActif: string) {
    setChargement(true);
    setErreur(null);
    try {
      const data = await etudiantsApi.lister(tokenActif);
      setEtudiants(data);
    } catch (err) {
      setErreur(err instanceof Error ? err.message : "Erreur inconnue.");
    } finally {
      setChargement(false);
    }
  }

  // Se déclenche à chaque fois que "token" change (donc juste après une
  // connexion réussie) — c'est ce qui charge automatiquement la liste dès
  // que l'utilisateur est authentifié, sans bouton "Charger" séparé.
  useEffect(() => {
    if (token) {
      chargerEtudiants(token);
    }
  }, [token]);

  async function gererConnexion(e: FormEvent) {
    e.preventDefault();
    setConnexionEnCours(true);
    setErreurConnexion(null);
    try {
      const { token: nouveauToken } = await authApi.connecter(emailConnexion, motDePasseConnexion);
      setToken(nouveauToken);
    } catch (err) {
      setErreurConnexion(err instanceof Error ? err.message : "Erreur inconnue.");
    } finally {
      setConnexionEnCours(false);
    }
  }

  function deconnecter() {
    setToken(null);
    setEtudiants([]);
    setEmailConnexion("");
    setMotDePasseConnexion("");
  }

  function ouvrirCreation() {
    setEnEdition(null);
    setFormData(FORM_VIDE);
    setFormulaireOuvert(true);
  }

  function ouvrirEdition(etudiant: Etudiant) {
    setEnEdition(etudiant);
    setFormData({
      nom: etudiant.nom,
      prenom: etudiant.prenom,
      email: etudiant.email,
      age: etudiant.age,
    });
    setFormulaireOuvert(true);
  }

  function fermerFormulaire() {
    setFormulaireOuvert(false);
    setEnEdition(null);
    setErreur(null);
  }

  async function gererSoumission(e: FormEvent) {
    e.preventDefault();
    if (!token) return;
    setEnvoiEnCours(true);
    setErreur(null);
    try {
      if (enEdition) {
        await etudiantsApi.modifier(enEdition.id, formData, token);
      } else {
        await etudiantsApi.creer(formData, token);
      }
      await chargerEtudiants(token);
      fermerFormulaire();
    } catch (err) {
      setErreur(err instanceof Error ? err.message : "Erreur inconnue.");
    } finally {
      setEnvoiEnCours(false);
    }
  }

  async function gererSuppression(etudiant: Etudiant) {
    if (!token) return;
    const confirme = window.confirm(`Radier ${etudiant.prenom} ${etudiant.nom} du registre ?`);
    if (!confirme) return;

    try {
      await etudiantsApi.supprimer(etudiant.id, token);
      await chargerEtudiants(token);
    } catch (err) {
      setErreur(err instanceof Error ? err.message : "Erreur inconnue.");
    }
  }

  // Tant qu'il n'y a pas de token, on affiche UNIQUEMENT l'écran de
  // connexion — le registre lui-même n'est jamais monté dans le DOM,
  // donc aucune requête vers /etudiants ne peut partir sans être authentifié.
  if (!token) {
    return (
      <div className="ecran-connexion">
        <div className="carte-connexion">
          <p className="eyebrow">Institut &mdash; Antananarivo</p>
          <h1>Connexion au registre</h1>
          <p className="sous-titre">Authentification requise pour consulter les entrées.</p>

          {erreurConnexion && <div className="bandeau-erreur">{erreurConnexion}</div>}

          <form onSubmit={gererConnexion} className="formulaire">
            <label>
              Email
              <input
                required
                type="email"
                value={emailConnexion}
                onChange={(e) => setEmailConnexion(e.target.value)}
              />
            </label>
            <label>
              Mot de passe
              <input
                required
                type="password"
                value={motDePasseConnexion}
                onChange={(e) => setMotDePasseConnexion(e.target.value)}
              />
            </label>
            <button type="submit" className="bouton bouton-primaire" disabled={connexionEnCours}>
              {connexionEnCours ? "Connexion…" : "Se connecter"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="registre">
      <header className="entete">
        <div className="entete-texte">
          <p className="eyebrow">Institut &mdash; Antananarivo</p>
          <h1>Registre des étudiants</h1>
          <p className="sous-titre">Tenue à jour des inscriptions, entrée par entrée.</p>
        </div>
        <div className="cachet" aria-hidden="true">
          <span className="cachet-nombre">{etudiants.length}</span>
          <span className="cachet-label">inscrits</span>
        </div>
      </header>

      <div className="trait-double" aria-hidden="true"></div>

      <div className="barre-actions">
        <button className="bouton bouton-primaire" onClick={ouvrirCreation}>
          + Nouvelle entrée
        </button>
        <button className="bouton bouton-fantome" onClick={() => chargerEtudiants(token)} disabled={chargement}>
          Actualiser
        </button>
        <button className="bouton bouton-fantome" onClick={deconnecter} style={{ marginLeft: "auto" }}>
          Se déconnecter
        </button>
      </div>

      {erreur && !formulaireOuvert && <div className="bandeau-erreur">{erreur}</div>}

      <div className="table-conteneur">
        {chargement ? (
          <p className="etat-vide">Consultation du registre…</p>
        ) : etudiants.length === 0 ? (
          <p className="etat-vide">Aucune entrée pour l'instant. Ouvrez le registre avec « Nouvelle entrée ».</p>
        ) : (
          <table className="table-registre">
            <thead>
              <tr>
                <th className="col-num">N°</th>
                <th>Nom</th>
                <th>Prénom</th>
                <th>Email</th>
                <th className="col-age">Âge</th>
                <th className="col-actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {etudiants.map((etudiant, index) => (
                <tr key={etudiant.id}>
                  <td className="col-num mono">{String(index + 1).padStart(3, "0")}</td>
                  <td>{etudiant.nom}</td>
                  <td>{etudiant.prenom}</td>
                  <td className="mono col-email">{etudiant.email}</td>
                  <td className="col-age mono">{etudiant.age}</td>
                  <td className="col-actions">
                    <button className="lien-action" onClick={() => ouvrirEdition(etudiant)}>
                      Modifier
                    </button>
                    <button
                      className="lien-action lien-danger"
                      onClick={() => gererSuppression(etudiant)}
                    >
                      Radier
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {formulaireOuvert && (
        <div className="voile" onClick={fermerFormulaire}>
          <div className="fiche" onClick={(e) => e.stopPropagation()}>
            <p className="eyebrow">{enEdition ? "Modification" : "Nouvelle fiche"}</p>
            <h2>{enEdition ? "Modifier l'entrée" : "Créer une entrée"}</h2>

            {erreur && <div className="bandeau-erreur">{erreur}</div>}

            <form onSubmit={gererSoumission} className="formulaire">
              <label>
                Nom
                <input
                  required
                  value={formData.nom}
                  onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                />
              </label>
              <label>
                Prénom
                <input
                  required
                  value={formData.prenom}
                  onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                />
              </label>
              <label>
                Email
                <input
                  required
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </label>
              <label>
                Âge
                <input
                  required
                  type="number"
                  min={1}
                  value={formData.age || ""}
                  onChange={(e) => setFormData({ ...formData, age: Number(e.target.value) })}
                />
              </label>

              <div className="fiche-actions">
                <button type="button" className="bouton bouton-fantome" onClick={fermerFormulaire}>
                  Annuler
                </button>
                <button type="submit" className="bouton bouton-primaire" disabled={envoiEnCours}>
                  {envoiEnCours ? "Enregistrement…" : enEdition ? "Enregistrer" : "Ajouter au registre"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
