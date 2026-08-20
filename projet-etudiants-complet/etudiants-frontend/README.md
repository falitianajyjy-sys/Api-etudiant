# Registre des étudiants — Frontend React

Interface React + TypeScript (Vite) connectée à l'API REST /etudiants.

## Prérequis

- Le backend api-etudiants doit tourner sur http://localhost:3000
  (voir son propre README pour l'installation).

## Installation

```bash
npm install
```

## Lancer en développement

```bash
npm run dev
```

Ouvre ensuite l'URL affichée dans le terminal (par défaut http://localhost:5173).

## Build de production

```bash
npm run build
npm run preview
```

## Ce que fait l'interface

- Liste tous les étudiants (GET /etudiants)
- Ajoute un étudiant via un formulaire modal (POST /etudiants)
- Modifie un étudiant existant (PUT /etudiants/:id)
- Supprime un étudiant avec confirmation (DELETE /etudiants/:id)
- Affiche les erreurs renvoyées par l'API (validation, email dupliqué, etc.)

## Structure

```
src/
  types/etudiant.types.ts   -> types partagés avec le backend
  api/etudiants.api.ts      -> client fetch qui appelle l'API
  App.tsx                   -> interface (tableau + formulaire)
  App.css                   -> styles
```

## Remarque CORS

Le backend doit avoir le middleware cors() activé (déjà fait dans server.ts)
pour que le navigateur autorise les requêtes depuis localhost:5173 vers localhost:3000.

## Authentification

L'interface exige maintenant une connexion (email + mot de passe) avant
d'afficher le registre. Le token JWT reçu est gardé en mémoire (useState)
pour la durée de la session — il est perdu si la page est rafraîchie,
il faut alors se reconnecter.

Créez d'abord un compte côté backend avec `POST /auth/register`
(voir le README du backend) avant de pouvoir vous connecter ici.
