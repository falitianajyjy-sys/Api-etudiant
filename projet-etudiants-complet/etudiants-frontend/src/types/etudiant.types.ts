export interface Etudiant {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  age: number;
}

export type EtudiantFormData = Omit<Etudiant, "id">;
