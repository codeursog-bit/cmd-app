# CMDG — Communauté des Messagers de Dieu
**Application de gestion d'église — Next.js 14 + PostgreSQL**

## Installation rapide

```bash
cd cmdg-final
npm install
cp .env.example .env
# Remplissez les variables dans .env
npx prisma db push
npx tsx prisma/seed.ts
npm run dev
```

## Comptes par défaut
| Rôle | Email | Mot de passe |
|------|-------|-------------|
| Berger Principal | admin@cmdg.org | Admin@2024! |
| Pasteur | pasteur@cmdg.org | Pasteur@2024! |
| Gestionnaire Média | media@cmdg.org | Media@2024! |
| Enseignant Baptême | bapteme@cmdg.org | Bapteme@2024! |

## Rôles et permissions
| Rôle | Membres | Posts/Events | Baptêmes | Cours Baptême | Dons | Départements | Créer users | Églises |
|------|---------|-------------|---------|--------------|------|-------------|------------|--------|
| SUPER_ADMIN | ✅ tous | ✅ | ✅ | ✅ | ✅ | ✅ tous | ✅ tous | ✅ |
| PASTOR | ✅ son église | ✅ | ✅ | ✅ | ✅ | ✅ son église | ✅ (DEPT_LEADER, MEDIA, BAPTISM, SECRETARY) | ❌ |
| DEPT_LEADER | ✅ son dept | ❌ | ❌ | ❌ | ❌ | ✅ son dept | ❌ | ❌ |
| MEDIA_MANAGER | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| BAPTISM_TEACHER | ❌ | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| SECRETARY | lecture | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |

## Variables d'environnement
Voir `.env.example`

Après le seed, copiez l'ID de l'église dans `NEXT_PUBLIC_DEFAULT_CHURCH_ID` pour activer la page de don.

## Cloudinary (upload médias)
1. Créez un compte sur cloudinary.com
2. Settings → Upload → Add upload preset → nommez-le `cmdg_unsigned`, mode `Unsigned`
3. Copiez votre Cloud Name dans `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`

## Déploiement Vercel + Neon
1. Poussez sur GitHub
2. Importez sur vercel.com
3. Ajoutez toutes les variables d'environnement
4. Le build fait `prisma generate && prisma migrate deploy && next build`
