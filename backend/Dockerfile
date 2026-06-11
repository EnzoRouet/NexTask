# Étape 1 : Le Builder (Environnement lourd pour compiler)
FROM node:22-alpine AS builder

WORKDIR /app

# Copie des fichiers de dépendances
COPY package*.json ./
COPY prisma ./prisma/

# Installation de TOUTES les dépendances (même les devDependencies pour Nest CLI)
RUN npm install

# Copie du reste du code source
COPY . .

# Génération du client Prisma indispensable avant le build
RUN npx prisma generate

# Compilation du code TypeScript en JavaScript pur (dossier /dist)
RUN npm run build

# Étape 2 : Le Runner (Environnement léger pour la production)
FROM node:22-alpine

WORKDIR /app

# On ne récupère que les éléments strictement nécessaires générés par l'étape 1
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

# Exposition du port du serveur NestJS (par défaut 3000, à adapter si besoin)
EXPOSE 4000

# Commande de démarrage en production
CMD ["npm", "run", "start:prod"]