# Guide de déploiement — CMDG App
## Stack : Next.js 14 → Vercel | PostgreSQL → Neon

---

## 1. Base de données — Neon

1. Créer un compte sur [neon.tech](https://neon.tech)
2. Créer un **nouveau projet** (ex: `cmdg-production`)
3. Copier la **Connection String** format :
   ```
   postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```

> ⚠️ **Important Neon** : ajouter `?sslmode=require` à la fin de l'URL si pas déjà présent.

---

## 2. Variables d'environnement

Créer un fichier `.env` à la racine (jamais commité) :

```env
DATABASE_URL="postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require"
JWT_SECRET="votre-secret-jwt-tres-long-et-aleatoire-min-32-chars"
NEXT_PUBLIC_APP_URL="https://votre-domaine.vercel.app"
```

Pour générer un JWT_SECRET sécurisé :
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## 3. Déploiement initial (local → Neon)

```bash
# Installer les dépendances
npm install

# Générer le client Prisma
npx prisma generate

# Pousser le schéma vers Neon (crée toutes les tables)
npx prisma db push

# Peupler la base avec les données de démo
npm run db:seed
```

**Comptes créés par le seed :**
| Email | Mot de passe | Rôle |
|-------|-------------|------|
| admin@cmdg.org | Admin@2024! | Berger Principal |
| pasteur@cmdg.org | Pasteur@2024! | Pasteur |

---

## 4. Déploiement Vercel

### Option A — Via CLI (recommandé)
```bash
# Installer Vercel CLI
npm i -g vercel

# Déployer
vercel

# En production
vercel --prod
```

### Option B — Via GitHub
1. Pusher le code sur GitHub
2. Sur [vercel.com](https://vercel.com) → **New Project** → importer le repo
3. Framework : **Next.js** (détecté automatiquement)

### Variables d'environnement sur Vercel
Dans le dashboard Vercel → **Settings → Environment Variables** :
```
DATABASE_URL      = (votre URL Neon avec ?sslmode=require)
JWT_SECRET        = (votre secret généré)
NEXT_PUBLIC_APP_URL = (votre URL Vercel ex: https://cmdg.vercel.app)
```

### Build Command (Vercel le détecte automatiquement)
```
prisma generate && next build
```
C'est déjà configuré dans `package.json` → `"build": "prisma generate && next build"`

---

## 5. Après le premier déploiement

Lancer le seed UNE SEULE FOIS depuis votre machine locale avec l'URL Neon :
```bash
DATABASE_URL="votre-url-neon" npm run db:seed
```

Ou depuis Vercel : **Settings → Functions → Run** (si vous avez Vercel Pro).

---

## 6. Prisma sur Vercel — Points importants

### Connection Pooling (recommandé en production)
Neon propose un **connection pooler** (port 5432 vs 5432 standard).
Dans Neon, aller sur **Connection Details** → activer **Pooled connection**.
Utiliser l'URL pooler pour `DATABASE_URL` en production.

### Prisma Accelerate (optionnel)
Pour de meilleures performances serverless :
```bash
npm install @prisma/extension-accelerate
```
Puis dans `src/lib/prisma.ts` ajouter l'extension.

---

## 7. Domaine personnalisé

Dans Vercel → **Settings → Domains** → ajouter votre domaine.
Mettre à jour `NEXT_PUBLIC_APP_URL` avec le nouveau domaine.

---

## 8. Checklist de mise en production

- [ ] `DATABASE_URL` pointe vers Neon avec `?sslmode=require`
- [ ] `JWT_SECRET` est un secret long et aléatoire (jamais le même qu'en dev)
- [ ] `NEXT_PUBLIC_APP_URL` est l'URL publique finale
- [ ] Seed exécuté une seule fois
- [ ] Vérifier `/login` → connexion avec `admin@cmdg.org`
- [ ] Vérifier `/api/dashboard` répond correctement
- [ ] Activer le **connection pooler** Neon en production

---

## 9. Commandes utiles en prod

```bash
# Voir les données en prod (via Neon dashboard ou Prisma Studio local)
DATABASE_URL="url-neon" npx prisma studio

# Appliquer des migrations futures
npx prisma migrate deploy

# Réinitialiser la base (⚠️ DANGER — efface tout)
npx prisma db push --force-reset && npm run db:seed
```
