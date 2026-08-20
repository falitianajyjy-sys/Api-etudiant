# API REST /etudiants — TypeScript + Express + PostgreSQL

CRUD complet, gestion centralisée des erreurs, conforme aux conventions REST,
connecté à une vraie base de données PostgreSQL.

## Prérequis

- Node.js
- PostgreSQL installé et démarré

## Installation

```bash
npm install
```

## Configuration de la base de données

1. Créer la base de données :
```bash
psql -U postgres -c "CREATE DATABASE api_etudiants;"
```

2. Créer la table et insérer des données de test :
```sql
CREATE TABLE etudiants (
  id SERIAL PRIMARY KEY,
  nom VARCHAR(100) NOT NULL,
  prenom VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  age INTEGER NOT NULL CHECK (age > 0)
);

INSERT INTO etudiants (nom, prenom, email, age) VALUES
  ('Rakoto', 'Jean', 'jean.rakoto@example.mg', 21),
  ('Rasoa', 'Marie', 'marie.rasoa@example.mg', 23);
```

3. Copier `.env.example` en `.env` et adapter les identifiants si besoin :
```bash
cp .env.example .env
```

## Lancer en développement (rechargement automatique)

```bash
npm run dev
```

## Lancer en production

```bash
npm run build
npm start
```

Le serveur démarre sur `http://localhost:3000`.

## Routes disponibles

| Action                       | Méthode | URL              | Code succès |
|-------------------------------|---------|------------------|-------------|
| Lister tous les étudiants     | GET     | /etudiants       | 200         |
| Lire un étudiant précis       | GET     | /etudiants/:id   | 200         |
| Créer un étudiant             | POST    | /etudiants       | 201         |
| Modifier un étudiant (complet)| PUT     | /etudiants/:id   | 200         |
| Modifier un étudiant (partiel)| PATCH   | /etudiants/:id   | 200         |
| Supprimer un étudiant         | DELETE  | /etudiants/:id   | 204         |

Corps JSON attendu pour POST / PUT :
```json
{
  "nom": "Randria",
  "prenom": "Sofia",
  "email": "sofia.randria@example.mg",
  "age": 22
}
```

## Gestion des erreurs

Toutes les erreurs passent par un middleware centralisé (`src/middlewares/errorHandler.ts`)
et renvoient un format uniforme :
```json
{
  "success": false,
  "statusCode": 404,
  "message": "Aucun étudiant trouvé avec l'id 999."
}
```
- **400** : données invalides ou champs manquants
- **404** : ressource ou route non trouvée

## Tester avec Postman

1. Ouvrir Postman.
2. Cliquer sur **Import** puis choisir le fichier `API-Etudiants.postman_collection.json`.
3. Lancer le serveur (`npm run dev`).
4. Exécuter les requêtes de la collection dans l'ordre (elle couvre les 6 routes CRUD
   ainsi que deux cas d'erreur : 404 sur un id inexistant et 400 sur un corps invalide).

Vous pouvez faire exactement la même chose avec **Thunder Client** dans VS Code
en important le même fichier JSON.

## Structure du projet

```
src/
  types/etudiant.types.ts        -> types TypeScript de la ressource
  config/database.ts             -> pool de connexion PostgreSQL
  controllers/etudiants.controller.ts -> logique CRUD (requêtes SQL) + validation
  routes/etudiants.routes.ts     -> déclaration des routes REST
  middlewares/ApiError.ts        -> classe d'erreur personnalisée
  middlewares/errorHandler.ts    -> gestion centralisée des erreurs (404 + 500...)
  server.ts                      -> point d'entrée Express
.env                              -> identifiants de connexion à la base (non versionné)
```

## Authentification (JWT)

L'API est protégée par un système d'authentification par token JWT.
Toutes les routes `/etudiants/*` exigent un token valide.

### Créer un compte

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"prof@example.mg","mot_de_passe":"motdepasse123"}'
```

### Se connecter

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"prof@example.mg","mot_de_passe":"motdepasse123"}'
```

Réponse :
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "utilisateur": { "id": 1, "email": "prof@example.mg" }
  }
}
```

### Utiliser le token

Ajouter l'en-tête `Authorization: Bearer <token>` à chaque requête vers `/etudiants` :

```bash
curl http://localhost:3000/etudiants \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

Sans ce token (ou avec un token invalide/expiré), l'API répond `401 Unauthorized`.

### Table utilisateurs (à créer en base)

```sql
CREATE TABLE utilisateurs (
  id SERIAL PRIMARY KEY,
  email VARCHAR(150) NOT NULL UNIQUE,
  mot_de_passe VARCHAR(255) NOT NULL,
  date_creation TIMESTAMP DEFAULT NOW()
);
```
