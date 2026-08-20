import { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { pool } from "../config/database";
import { ApiError } from "../middlewares/ApiError";

const JWT_SECRET = process.env.JWT_SECRET as string;
const JWT_EXPIRATION = process.env.JWT_EXPIRATION || "2h";
const TOURS_DE_HASH = 10; // "coût" du hashage bcrypt : plus haut = plus lent mais plus sûr

// POST /auth/register — créer un compte utilisateur
export async function inscrire(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, mot_de_passe } = req.body;

    if (!email || !mot_de_passe) {
      return next(new ApiError(400, "Email et mot de passe sont requis."));
    }
    if (mot_de_passe.length < 6) {
      return next(new ApiError(400, "Le mot de passe doit contenir au moins 6 caractères."));
    }

    // On ne stocke JAMAIS le mot de passe en clair : bcrypt.hash produit un
    // "hash" à sens unique (impossible de retrouver le mot de passe original
    // à partir du hash, même en cas de fuite de la base de données).
    const motDePasseHashe = await bcrypt.hash(mot_de_passe, TOURS_DE_HASH);

    const resultat = await pool.query(
      "INSERT INTO utilisateurs (email, mot_de_passe) VALUES ($1, $2) RETURNING id, email",
      [email, motDePasseHashe]
    );

    res.status(201).json({ success: true, data: resultat.rows[0] });
  } catch (err: any) {
    if (err.code === "23505") {
      return next(new ApiError(400, "Un compte existe déjà avec cet email."));
    }
    next(err);
  }
}

// POST /auth/login — se connecter et recevoir un token JWT
export async function connecter(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, mot_de_passe } = req.body;

    if (!email || !mot_de_passe) {
      return next(new ApiError(400, "Email et mot de passe sont requis."));
    }

    const resultat = await pool.query("SELECT * FROM utilisateurs WHERE email = $1", [email]);
    const utilisateur = resultat.rows[0];

    // Message volontairement IDENTIQUE que l'email soit inconnu ou le mot
    // de passe faux : ça évite de révéler à un attaquant si un email donné
    // existe ou non dans la base (bonne pratique de sécurité).
    if (!utilisateur) {
      return next(new ApiError(401, "Email ou mot de passe incorrect."));
    }

    // bcrypt.compare hash le mot de passe fourni avec le même algorithme,
    // puis compare les deux hashs — on ne peut jamais "déhasher" pour comparer.
    const motDePasseValide = await bcrypt.compare(mot_de_passe, utilisateur.mot_de_passe);
    if (!motDePasseValide) {
      return next(new ApiError(401, "Email ou mot de passe incorrect."));
    }

    // On signe un token contenant l'id et l'email (jamais le mot de passe).
    // La signature (avec JWT_SECRET) garantit que ce token ne peut pas être
    // falsifié par le client : toute modification invaliderait la signature.
    const token = jwt.sign(
      { id: utilisateur.id, email: utilisateur.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRATION as jwt.SignOptions["expiresIn"] }
    );

    res.status(200).json({
      success: true,
      data: { token, utilisateur: { id: utilisateur.id, email: utilisateur.email } },
    });
  } catch (err) {
    next(err);
  }
}
