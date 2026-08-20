export interface Etudiant {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  age: number;
}

// Champs autorisés lors de la création (id généré automatiquement)
export type EtudiantCreation = Omit<Etudiant, "id">;

// Champs autorisés lors d'une mise à jour partielle (PATCH)
export type EtudiantMiseAJour = Partial<EtudiantCreation>;
