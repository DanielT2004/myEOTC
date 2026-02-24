# Setting Up Environment Variables in Vercel

## The Problem

When you deploy to Vercel, your app needs environment variables (like API keys) to work. Make sure you set the required environment variables in Vercel.

## Environment Variables You Need

Your app needs these environment variables in Vercel:

### Required (for database to work):
1. **VITE_SUPABASE_URL** - Your Supabase project URL
2. **VITE_SUPABASE_ANON_KEY** - Your Supabase anonymous/public key

## How to Set Environment Variables in Vercel

### Step 1: Go to Your Vercel Project
1. Log in to [vercel.com](https://vercel.com)
2. Go to your project dashboard
3. Click on your project (myEOTC or ethiopian-orthodox-church-finder)

### Step 2: Add Environment Variables
1. Click on **Settings** (in the top navigation)
2. Click on **Environment Variables** (in the left sidebar)
3. Click **Add New**

### Step 3: Add Each Variable

For each variable, click "Add New" and fill in:

**Variable 1:**
- **Name:** `VITE_SUPABASE_URL`
- **Value:** Your Supabase URL (e.g., `https://xxxxx.supabase.co`)
- **Environment:** Select all (Production, Preview, Development)
- Click **Save**

**Variable 2:**
- **Name:** `VITE_SUPABASE_ANON_KEY`
- **Value:** Your Supabase anon key (starts with `eyJ...`)
- **Environment:** Select all
- Click **Save**

### Step 4: Redeploy
After adding all variables:
1. Go to the **Deployments** tab
2. Click the **⋯** (three dots) on your latest deployment
3. Click **Redeploy**
4. Or push a new commit to trigger a new deployment

## Where to Find Your Keys

### Supabase Keys:
1. Go to [supabase.com](https://supabase.com)
2. Select your project
3. Go to **Settings** → **API**
4. Copy:
   - **Project URL** → Use for `VITE_SUPABASE_URL`
   - **anon/public key** → Use for `VITE_SUPABASE_ANON_KEY`

## Important Notes

- **VITE_ prefix is required** - In Vite, only environment variables starting with `VITE_` are exposed to the browser
- **Never commit `.env` files** - These should be in `.gitignore`
- **Redeploy after adding variables** - Vercel needs to rebuild with the new variables

## Testing Locally

Create a `.env.local` file in your project root:
```
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-key
```

This file should be in `.gitignore` and never committed to Git.
