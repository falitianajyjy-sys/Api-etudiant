import { Pool } from "pg";
import "dotenv/config";

// Le pool gère plusieurs connexions à la base de données de façon efficace,
// plutôt que d'en ouvrir une nouvelle à chaque requête.
export const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT) || 5432,
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "postgres",
  database: process.env.DB_NAME || "api_etudiants",
});

// Petit test de connexion au démarrage, pour avoir un message clair en cas d'erreur
pool
  .connect()
  .then((client) => {
    console.log("Connexion à PostgreSQL réussie.");
    client.release();
  })
  .catch((err) => {
    console.error("Erreur de connexion à PostgreSQL :", err.message);
  });
