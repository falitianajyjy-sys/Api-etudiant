export interface Utilisateur {
  id: number;
  email: string;
  mot_de_passe: string; // toujours hashé en base, jamais en clair
}

export interface IdentifiantsConnexion {
  email: string;
  mot_de_passe: string;
}

// Ce qu'on encode dans le JWT (le "payload") — pas de données sensibles ici,
// car un JWT est signé mais PAS chiffré : n'importe qui peut le décoder et
// lire son contenu (juste pas le modifier sans casser la signature).
export interface PayloadJWT {
  id: number;
  email: string;
}
