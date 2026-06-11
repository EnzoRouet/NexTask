# Étape 1 : Builder
FROM node:22-alpine AS builder

WORKDIR /app

# Copie des fichiers de dépendances
COPY package*.json ./

# Installation
RUN npm install

# Copie du reste du code source
COPY . .

# Build de l'application Next.js
RUN npm run build

# Étape 2 : Runner (Production)
FROM node:22-alpine

WORKDIR /app

# Next.js a besoin de ces dossiers pour s'exécuter en production
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/next.config.ts ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules

# Exposition du port (généralement 3000 pour Next.js)
EXPOSE 3000

# Lancement en mode production
CMD ["npm", "run", "start"]