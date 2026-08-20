import { Router } from "express";
import {
  listerEtudiants,
  lireEtudiant,
  creerEtudiant,
  modifierEtudiantComplet,
  modifierEtudiantPartiel,
  supprimerEtudiant,
} from "../controllers/etudiants.controller";
import { verifierAuthentification } from "../middlewares/authMiddleware";

const router = Router();

// verifierAuthentification est placé AVANT chaque fonction du contrôleur.
// Express exécute les middlewares d'une route dans l'ordre où ils sont
// listés : si le token est invalide, verifierAuthentification appelle
// next(erreur) et la fonction du contrôleur (ex: listerEtudiants) n'est
// JAMAIS exécutée.
router.get("/", verifierAuthentification, listerEtudiants);          // GET    /etudiants
router.get("/:id", verifierAuthentification, lireEtudiant);          // GET    /etudiants/:id
router.post("/", verifierAuthentification, creerEtudiant);           // POST   /etudiants
router.put("/:id", verifierAuthentification, modifierEtudiantComplet);   // PUT    /etudiants/:id
router.patch("/:id", verifierAuthentification, modifierEtudiantPartiel); // PATCH  /etudiants/:id
router.delete("/:id", verifierAuthentification, supprimerEtudiant);  // DELETE /etudiants/:id

export default router;
