import { Request, Response, NextFunction } from "express";
import { ApiError } from "../middlewares/ApiError";
import { pool } from "../config/database";

// Petite fonction de validation réutilisable
function validerDonneesEtudiant(data: any, partiel = false): string[] {
  const erreurs: string[] = [];
  const champsRequis = ["nom", "prenom", "email", "age"];

  if (!partiel) {
    for (const champ of champsRequis) {
      if (data[champ] === undefined || data[champ] === null || data[champ] === "") {
        erreurs.push(`Le champ "${champ}" est requis.`);
      }
    }
  }

  if (data.age !== undefined && (typeof data.age !== "number" || data.age <= 0)) {
    erreurs.push('Le champ "age" doit être un nombre positif.');
  }
  if (data.email !== undefined && typeof data.email === "string" && !data.email.includes("@")) {
    erreurs.push('Le champ "email" doit être une adresse email valide.');
  }

  return erreurs;
}

// GET /etudiants
export async function listerEtudiants(req: Request, res: Response, next: NextFunction) {
  try {
    const resultat = await pool.query("SELECT * FROM etudiants ORDER BY id");
    res.status(200).json({ success: true, data: resultat.rows });
  } catch (err) {
    next(err);
  }
}

// GET /etudiants/:id
export async function lireEtudiant(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id);
    const resultat = await pool.query("SELECT * FROM etudiants WHERE id = $1", [id]);

    if (resultat.rows.length === 0) {
      return next(new ApiError(404, `Aucun étudiant trouvé avec l'id ${id}.`));
    }
    res.status(200).json({ success: true, data: resultat.rows[0] });
  } catch (err) {
    next(err);
  }
}

// POST /etudiants
export async function creerEtudiant(req: Request, res: Response, next: NextFunction) {
  try {
    const { nom, prenom, email, age } = req.body;
    const erreurs = validerDonneesEtudiant(req.body);
    if (erreurs.length > 0) {
      return next(new ApiError(400, erreurs.join(" ")));
    }

    const resultat = await pool.query(
      "INSERT INTO etudiants (nom, prenom, email, age) VALUES ($1, $2, $3, $4) RETURNING *",
      [nom, prenom, email, age]
    );
    res.status(201).json({ success: true, data: resultat.rows[0] });
  } catch (err: any) {
    // Code 23505 = violation de contrainte UNIQUE (ex: email déjà utilisé)
    if (err.code === "23505") {
      return next(new ApiError(400, "Cet email est déjà utilisé par un autre étudiant."));
    }
    next(err);
  }
}

// PUT /etudiants/:id (remplacement complet)
export async function modifierEtudiantComplet(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id);
    const { nom, prenom, email, age } = req.body;
    const erreurs = validerDonneesEtudiant(req.body);
    if (erreurs.length > 0) {
      return next(new ApiError(400, erreurs.join(" ")));
    }

    const resultat = await pool.query(
      "UPDATE etudiants SET nom = $1, prenom = $2, email = $3, age = $4 WHERE id = $5 RETURNING *",
      [nom, prenom, email, age, id]
    );

    if (resultat.rows.length === 0) {
      return next(new ApiError(404, `Aucun étudiant trouvé avec l'id ${id}.`));
    }
    res.status(200).json({ success: true, data: resultat.rows[0] });
  } catch (err) {
    next(err);
  }
}

// PATCH /etudiants/:id (modification partielle)
export async function modifierEtudiantPartiel(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id);
    const erreurs = validerDonneesEtudiant(req.body, true);
    if (erreurs.length > 0) {
      return next(new ApiError(400, erreurs.join(" ")));
    }

    // On récupère l'étudiant existant, puis on fusionne avec les champs envoyés
    const existant = await pool.query("SELECT * FROM etudiants WHERE id = $1", [id]);
    if (existant.rows.length === 0) {
      return next(new ApiError(404, `Aucun étudiant trouvé avec l'id ${id}.`));
    }

    const fusion = { ...existant.rows[0], ...req.body };
    const resultat = await pool.query(
      "UPDATE etudiants SET nom = $1, prenom = $2, email = $3, age = $4 WHERE id = $5 RETURNING *",
      [fusion.nom, fusion.prenom, fusion.email, fusion.age, id]
    );
    res.status(200).json({ success: true, data: resultat.rows[0] });
  } catch (err) {
    next(err);
  }
}

// DELETE /etudiants/:id
export async function supprimerEtudiant(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id);
    const resultat = await pool.query("DELETE FROM etudiants WHERE id = $1 RETURNING id", [id]);

    if (resultat.rows.length === 0) {
      return next(new ApiError(404, `Aucun étudiant trouvé avec l'id ${id}.`));
    }
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
