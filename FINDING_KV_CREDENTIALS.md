# Finding Your Vercel KV Credentials

If you only see `espesyal_REDIS_URL` in your Vercel project, here's how to find the correct `KV_REST_API_URL` and `KV_REST_API_TOKEN`:

## Step 1: Navigate to Your KV Database

1. Go to **Vercel Dashboard**: https://vercel.com/dashboard
2. Click on **your project**
3. Click on the **Storage** tab (left sidebar)
4. Click on **your KV database** (the one you created)

## Step 2: Find the .env.local Tab

1. In your KV database page, look for tabs at the top:

   - **Overview**
   - **.env.local** ← **Click this tab!**
   - **Settings**
   - etc.

2. Click on the **.env.local** tab

## Step 3: Copy the Variables

In the `.env.local` tab, you should see environment variables. Look for:

- `KV_REST_API_URL` - This is what you need (should start with `https://`)
- `KV_REST_API_TOKEN` - This is what you need (a long token string)

**Important**:

- The variable names should be exactly `KV_REST_API_URL` and `KV_REST_API_TOKEN`
- If you only see `espesyal_REDIS_URL`, that might be a different variable or a custom name
- `@vercel/kv` package specifically requires `KV_REST_API_URL` and `KV_REST_API_TOKEN`

## Step 4: If You Only See espesyal_REDIS_URL

If you only see `espesyal_REDIS_URL` and not the standard KV variables, try:

1. **Check if there are multiple tabs or sections** - Sometimes the variables are in different places
2. **Check the Settings tab** - Sometimes credentials are shown there
3. **Create a new KV database** - If the current one doesn't show the right variables, create a new one
4. **Check if you're using a different Redis service** - `espesyal_REDIS_URL` might be from Redis Labs or another service, not Vercel KV

## Alternative: Using espesyal_REDIS_URL

If `espesyal_REDIS_URL` is a Redis connection string (starts with `redis://`), you would need a different Redis client library, not `@vercel/kv`.

However, `@vercel/kv` is specifically designed for Vercel KV and requires the REST API format (`KV_REST_API_URL` and `KV_REST_API_TOKEN`).

## What the Variables Should Look Like

**KV_REST_API_URL:**

```
https://your-database-name-abc123.vercel-storage.com
```

**KV_REST_API_TOKEN:**

```
Axxx...long-token-string...xxx
```

## Still Can't Find Them?

1. Make sure you're looking at a **KV database** (not Postgres, Blob, etc.)
2. Try creating a **new KV database** in Vercel
3. Check Vercel's documentation: https://vercel.com/docs/storage/vercel-kv

## Quick Check

Run this in your terminal to see what environment variables Vercel provides:

```bash
# In your project directory
vercel env pull .env.local
cat .env.local | grep KV
```

This will download all environment variables from Vercel and show you the KV-related ones.
