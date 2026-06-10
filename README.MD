# Project Manager - Application Kanban Fullstack

Application de gestion de projet agile. Une architecture totalement découplée avec un frontend réactif pensé pour l'expérience utilisateur et un backend robuste orienté entreprise.

<div align="center">
  <img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  <br />
  <img src="https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white" alt="NestJS" />
  <img src="https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white" alt="Prisma" />
  <img src="https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Jest-323330?style=for-the-badge&logo=Jest&logoColor=white" alt="Jest" />
</div>

## Contexte & Objectifs

Ce projet vient consolider ma première année de bachelor à CODA. Après avoir travaillé sur des moteurs graphiques en JavaScript natif pour assimiler la logique de bas niveau, l'objectif ici était de s'éloigner du développement purement front-end pour adopter les standards architecturaux actuels de l'industrie.

Il s'agissait d'assimiler une stack technique totalement nouvelle (Next.js, NestJS, Prisma) et de relever le défi de la conception d'une API sécurisée, tout en maintenant une interface client fluide et complexe (manipulation asynchrone, Drag & Drop).

**Objectifs techniques validés :**

- Maîtrise du paradigme orienté objet et de l'injection de dépendances côté serveur.
- Séparation des responsabilités sur l'ensemble de la stack.
- Implémentation d'une couverture de tests automatisés.
- Modélisation de base de données relationnelle et typage de bout en bout.

## Stack Technique

**Frontend :** Next.js (App Router), React, TypeScript, Tailwind CSS, Dnd-kit.
**Backend :** NestJS, TypeScript, Prisma (ORM), PostgreSQL, Jest (Tests).
**Infrastructure :** Pipeline CI/CD, Git.

## Challenges Techniques Résolus

### 1. Complexité Algorithmique

**Le problème :** L'algorithme de Drag & Drop centralisait la gestion de l'interface React, les appels API et les calculs mathématiques d'insertion de tickets (moyennes de positionnement). Cela générait un composant monolithique avec une complexité cognitive très élevée et des risques de rendus en cascade.
**La solution :** Extraction totale de la logique métier dans des Custom Hooks et découpage en fonctions mathématiques pures. Cette refactorisation a permis d'isoler l'état local du cycle de vie global, rendant le composant purement visuel et garantissant l'exactitude des calculs de positionnement avec une stricte validation des types.

### 2. Sécurisation des Flux de Données et Intégrité

**Le problème :** Passer d'un environnement purement front-end à une architecture Fullstack expose l'application aux failles classiques.
**La solution :** Implémentation d'une politique de sécurité stricte côté NestJS. Utilisation systématique de Data Transfer Objects (DTO) pour valider la forme et le type de chaque requête entrante avant toute interaction avec la base de données. Mise en place de Guards pour vérifier l'authenticité des tokens JWT et configuration fine des règles CORS.

### 3. Fiabilité Industrielle et Prévention des Régressions

**Le problème :** Assurer qu'une modification sur une route de l'API ou sur une logique de permission ne casse pas le reste de l'application, un défi majeur lors de la découverte d'un framework backend complexe.
**La solution :** Rédaction d'une suite de plus de 60 tests unitaires sur le backend (avec Jest). Ces tests sont couplés à une pipeline d'Intégration Continue qui valide automatiquement l'intégrité de la logique métier à chaque nouvelle modification du code source.

## Architecture du Projet

```
/
├── /frontend          # Application Next.js (Interface Client)
│   ├── /src/components # Composants UI isolés (Modales, Kanban, etc.)
│   ├── /src/hooks      # Logique métier extraite (ex: useKanbanDragAndDrop)
│   └── /src/lib        # Utilitaires réseaux et configuration
│
└── /backend           # API NestJS (Logique Serveur)
    ├── /src/modules    # Découpage métier (Auth, Projects, Tickets)
    ├── /prisma         # Schémas de base de données relationnelle
    └── /test           # Suite de tests unitaires et e2e

```

## Installation & Lancement

Le projet est divisé en deux environnements distincts nécessitant chacun leur propre configuration.

### Prérequis

- **Node.js** : v22.x ou supérieure (Testé sur v22.19.0)
- **NPM** ou **Yarn**
- **PostgreSQL** (en local ou via un conteneur Docker)

1. **Cloner le dépôt :**

```bash
git clone https://github.com/EnzoRouet/NexTask.git

```

2. **Configuration Globale :**
   Des fichiers `.env.example` sont fournis à la racine des répertoires `/frontend` et `/backend`.
   Dupliquez-les en les renommant `.env` et renseignez vos variables (notamment `DATABASE_URL` pour PostgreSQL et les secrets JWT).
3. **Lancement de l'API (Backend) :**

```bash
cd backend
npm install
npx prisma db push
npm run start:dev

```

4. **Lancement du Client (Frontend) :**

```bash
cd frontend
npm install
npm run dev

```
