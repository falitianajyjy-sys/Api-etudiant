const BASE_URL = "http://localhost:3000/auth";

interface ReponseConnexion {
  token: string;
  utilisateur: { id: number; email: string };
}

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

export const authApi = {
  connecter: (email: string, mot_de_passe: string): Promise<ReponseConnexion> =>
    fetch(`${BASE_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, mot_de_passe }),
    }).then((res) => traiterReponse<ReponseConnexion>(res)),
};
