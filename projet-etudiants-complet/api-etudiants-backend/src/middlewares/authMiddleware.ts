import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { ApiError } from "./ApiError";
import { PayloadJWT } from "../types/utilisateur.types";

const JWT_SECRET = process.env.JWT_SECRET as string;

// On étend le type Request d'Express pour pouvoir attacher l'utilisateur
// décodé dessus (req.utilisateur), et y accéder ensuite dans les contrôleurs
// avec l'auto-complétion TypeScript, sans "any" ni erreur de compilation.
declare global {
  namespace Express {
    interface Request {
      utilisateur?: PayloadJWT;
    }
  }
}

export function verifierAuthentification(req: Request, res: Response, next: NextFunction) {
  // Le token est attendu dans l'en-tête HTTP "Authorization", au format
  // standard : "Bearer eyJhbGciOiJIUzI1NiIs..."
  const enTete = req.headers.authorization;

  if (!enTete || !enTete.startsWith("Bearer ")) {
    return next(new ApiError(401, "Authentification requise. En-tête Authorization manquant."));
  }

  const token = enTete.split(" ")[1]; // retire le préfixe "Bearer "

  try {
    // jwt.verify vérifie DEUX choses à la fois : que la signature du token
    // correspond bien à JWT_SECRET (donc qu'il a été émis par CE serveur,
    // et non falsifié), ET que le token n'est pas expiré.
    const payload = jwt.verify(token, JWT_SECRET) as PayloadJWT;
    req.utilisateur = payload; // rendu disponible pour les contrôleurs suivants
    next(); // token valide : on laisse passer la requête vers la route demandée
  } catch (err) {
    return next(new ApiError(401, "Token invalide ou expiré."));
  }
}
