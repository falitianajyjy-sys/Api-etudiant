import type { Etudiant, EtudiantFormData } from "../types/etudiant.types";

const BASE_URL = "http://localhost:3000/etudiants";

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

async function traiterReponse<T>(res: Response): Promise<T> {
  const texte = await res.text();
  const corps: ApiResponse<T> = texte ? JSON.parse(texte) : { success: true };

  if (!res.ok) {
    throw new Error(corps.message || `Erreur ${res.status}`);
  }
  return corps.data as T;
}

// Construit les en-têtes communs à toutes les requêtes protégées : le
// Content-Type JSON, PLUS l'en-tête Authorization avec le token JWT.
// Sans ce token, le backend renverra systématiquement une erreur 401
// (voir authMiddleware.ts côté serveur).
function enTetes(token: string): HeadersInit {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

export const etudiantsApi = {
  lister: (token: string): Promise<Etudiant[]> =>
    fetch(BASE_URL, { headers: enTetes(token) }).then((res) => traiterReponse<Etudiant[]>(res)),

  creer: (donnees: EtudiantFormData, token: string): Promise<Etudiant> =>
    fetch(BASE_URL, {
      method: "POST",
      headers: enTetes(token),
      body: JSON.stringify(donnees),
    }).then((res) => traiterReponse<Etudiant>(res)),

  modifier: (id: number, donnees: EtudiantFormData, token: string): Promise<Etudiant> =>
    fetch(`${BASE_URL}/${id}`, {
      method: "PUT",
      headers: enTetes(token),
      body: JSON.stringify(donnees),
    }).then((res) => traiterReponse<Etudiant>(res)),

  supprimer: (id: number, token: string): Promise<void> =>
    fetch(`${BASE_URL}/${id}`, {
      method: "DELETE",
      headers: enTetes(token),
    }).then((res) => traiterReponse<void>(res)),
};
