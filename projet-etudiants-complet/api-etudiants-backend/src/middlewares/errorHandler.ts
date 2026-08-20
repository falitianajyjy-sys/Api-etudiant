import { Request, Response, NextFunction } from "express";
import { ApiError } from "./ApiError";

// Middleware pour les routes non trouvées (404)
export function notFoundHandler(req: Request, res: Response, next: NextFunction) {
  next(new ApiError(404, `Route non trouvée : ${req.method} ${req.originalUrl}`));
}

// Middleware centralisé de gestion des erreurs (doit avoir 4 paramètres pour qu'Express le reconnaisse)
export function errorHandler(
  err: Error | ApiError,
  req: Request,
  res: Response,
  next: NextFunction
) {
  const statusCode = err instanceof ApiError ? err.statusCode : 500;
  const message = err.message || "Erreur interne du serveur";

  console.error(`[Erreur] ${req.method} ${req.originalUrl} -> ${statusCode} : ${message}`);

  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
  });
}
