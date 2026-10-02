# Deployment Guide: Only Books on Vercel + Neon

## Overview
This guide walks you through deploying your Only Books Next.js app with PostgreSQL on **Vercel** (hosting) and **Neon** (database).

**Estimated time:** 15 minutes

---

## ✅ Prerequisites
- GitHub account with your only-books repo pushed
- The schema update is already committed ✓

---

## Part 1: Set Up Neon Database

### Step 1.1: Create Neon Account
1. Go to **https://neon.tech**
2. Click "Sign Up" → Sign in with GitHub
3. Authorize the Neon app

### Step 1.2: Create a New Project
1. Click "New Project"
2. Name it: **only-books**
3. Select region: **US East (N. Virginia)** (default is fine)
4. Click "Create Project" (takes ~1 minute)

### Step 1.3: Copy Your Database Connection String
1. Once the project is created, you'll see the **Connect** tab
2. In the **Connection string** section, select **Prisma** from the dropdown
3. **Copy the entire connection string** (looks like):
   ```
   postgresql://neon_user:password@ep-XXXXX.us-east-1.neon.tech/neondb?sslmode=require
   ```
4. **Keep this safe** — you'll need it in the next step

### Step 1.4: Test the Connection Locally (Optional)
Before deploying, you can test your database locally:

```bash
# Replace with your actual Neon connection string
export DATABASE_URL="postgresql://neon_user:password@ep-XXXXX.us-east-1.neon.tech/neondb?sslmode=require"

# Run migrations to set up tables
npx prisma migrate deploy

# If this is first time, run:
# npx prisma migrate dev --name init
```

If you see errors about migration history, run:
```bash
npx prisma migrate resolve --rolled-back init
npx prisma migrate deploy
```

---

## Part 2: Deploy to Vercel

### Step 2.1: Connect GitHub Repository
1. Go to **https://vercel.com**
2. Click "Sign Up" → Sign in with GitHub
3. Authorize Vercel to access your repositories

### Step 2.2: Import Your Project
1. Click "Add New..." → **Project**
2. Find **only-books** repository
3. Click "Import"

### Step 2.3: Configure Environment Variables
**This is crucial!** Vercel needs your database credentials.

On the "Configure Project" page, scroll to **Environment Variables**:

Add these variables:

| Key | Value | Notes |
|-----|-------|-------|
| `DATABASE_URL` | Paste your Neon connection string | From Step 1.3 |
| `NEXTAUTH_SECRET` | `jyTUiwuKUCdP7w39GV6KSsjFsOtQrhZUS82DlOl8MM8=` | Already generated |
| `NEXTAUTH_URL` | `https://your-app-name.vercel.app` | Replace with actual domain* |
| `EMAIL_SERVER` | (leave empty) | Optional - for production |
| `EMAIL_FROM` | `Only Books <no-reply@example.com>` | Optional |
| `UNLOCK_THRESHOLD` | `3` | From your existing config |
| `MIN_OVERLAP` | `2` | From your existing config |
| `POPULAR_BOOK_CAP` | `100` | From your existing config |
| `CRON_SECRET` | `94063b9fa83446fcca4f45400b9988b35bc89d9f29262e39` | From your existing config |

*Your Vercel domain will be something like `only-books-xxxxx.vercel.app` — you can update this after deployment if needed.

### Step 2.4: Deploy!
1. Click **"Deploy"** button
2. Wait for the build to complete (~2-3 minutes)
3. Once done, you'll see a "Success" message with your live URL

---

## Part 3: Verify Deployment

### Step 3.1: Check Your Live App
1. Click the "Visit" button or go to your Vercel URL
2. App should load! 🎉

### Step 3.2: Test Database Connection
1. Try signing up or viewing data
2. Check that the database is working

### Step 3.3: View Logs (if issues)
In Vercel dashboard:
1. Go to your project
2. Click "Deployments" → select the latest deployment
3. Click "Logs" to see error messages

---

## Part 4: Update NEXTAUTH_URL

After deployment, update your `NEXTAUTH_URL` environment variable:

### Option A: Auto-Domain (Recommended)
Vercel provides a default domain like `only-books-xxxxx.vercel.app`. If you want to use this:

1. In Vercel dashboard → Project Settings → Environment Variables
2. Edit `NEXTAUTH_URL` and set it to your actual Vercel domain
3. Trigger a redeployment: Push any commit to main branch

### Option B: Custom Domain
If you want your own domain (e.g., `onlybooks.com`):

1. In Vercel dashboard → Settings → Domains
2. Add your custom domain
3. Follow DNS instructions from your domain registrar
4. Update `NEXTAUTH_URL` to your custom domain
5. Redeploy

---

## Part 5: Update Code After Each Change

To deploy updates to your live app:

```bash
# Make your code changes
# Test locally if needed
git add .
git commit -m "Your commit message"
git push origin main

# Vercel automatically deploys on push!
# Check Vercel dashboard to see the deployment
```

---

## Troubleshooting

### ❌ "DATABASE_URL is not set"
- Make sure you added `DATABASE_URL` in Vercel Environment Variables
- Redeploy after adding it

### ❌ "NEXTAUTH_SECRET is not set"
- Add `NEXTAUTH_SECRET` to environment variables
- Redeploy

### ❌ "Database connection failed"
- Check your Neon connection string is correct
- Verify Neon project is still active (free tier may auto-pause)
- Test locally first: `npx prisma db push`

### ❌ "Build failed"
- Check Vercel logs for error messages
- Common issues:
  - Missing `prisma` in devDependencies
  - TypeScript errors
  - Missing environment variables

### ✅ Neon Auto-Pause
Free tier databases pause after 1 week of inactivity. When you access the app, the database wakes up automatically (might take 10-30 seconds first time).

---

## Security Checklist ✓

- [ ] `.env` and `.env.local` are in `.gitignore` ✓ (already set up)
- [ ] `NEXTAUTH_SECRET` is only in Vercel, not in git
- [ ] `DATABASE_URL` is only in Vercel, not in git
- [ ] No secrets in source code or commit history

---

## Next Steps

Once deployed:

1. **Add a custom domain** (optional) — follow Part 4, Option B
2. **Set up email sending** — update `EMAIL_SERVER` for production
3. **Monitor with Vercel Analytics** — built-in at vercel.com
4. **Upgrade from free tier** when ready — Vercel & Neon both have paid plans

---

## Quick Command Reference

```bash
# Test local database connection
export DATABASE_URL="your-neon-url"
npx prisma db push

# View database
npx prisma studio

# Create new migration
npx prisma migrate dev --name your_migration_name

# View deployment logs
# (Use Vercel dashboard → Deployments → Logs)
```

---

## Support

- **Vercel Issues**: https://vercel.com/support
- **Neon Issues**: https://neon.tech/docs/
- **Prisma Issues**: https://prisma.io/docs/

Good luck! 🚀
