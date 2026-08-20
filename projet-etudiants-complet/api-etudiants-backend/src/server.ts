import "dotenv/config";
import express from "express";
import cors from "cors";
import etudiantsRouter from "./routes/etudiants.routes";
import authRouter from "./routes/auth.routes";
import { notFoundHandler, errorHandler } from "./middlewares/errorHandler";
import "./config/database";

const app = express();
const PORT = process.env.PORT || 3000;

// Autorise le frontend (autre port) à appeler cette API
app.use(cors());

// Middleware pour parser le JSON envoyé dans le corps des requêtes
app.use(express.json());

// Route de test rapide
app.get("/", (req, res) => {
  res.status(200).json({ message: "API des étudiants opérationnelle. Voir /etudiants" });
});

// Routes d'authentification (PAS protégées : il faut pouvoir se connecter
// avant d'avoir un token !)
app.use("/auth", authRouter);

// Routes de la ressource "etudiants" (protégées par JWT, voir etudiants.routes.ts)
app.use("/etudiants", etudiantsRouter);

// Gestion centralisée des erreurs (toujours en dernier)
app.use(notFoundHandler);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});
