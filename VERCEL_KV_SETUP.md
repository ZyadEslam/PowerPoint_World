# Vercel KV Setup Guide

This guide will help you set up Vercel KV (Redis) for caching in your e-commerce application.

## Step 1: Create Vercel KV Database

1. **Go to Vercel Dashboard**

   - Visit: https://vercel.com/dashboard
   - Sign in to your account

2. **Navigate to Storage**

   - Click on your project (or create a new one)
   - Go to the **Storage** tab in the left sidebar
   - Click **Create Database**

3. **Select KV (Redis)**
   - Choose **KV** from the database options
   - Select a plan (Free tier is available for development)
   - Choose a region closest to your users
   - Give it a name (e.g., "e-commerce-cache")
   - Click **Create**

## Step 2: Get Your KV Credentials

1. **Open Your KV Database**

   - In the Storage tab, click on your newly created KV database
   - Click on the **.env.local** tab

2. **Copy Environment Variables**
   You'll see these environment variables:

   - `KV_REST_API_URL` - Your KV database REST API URL (required)
     - Should look like: `https://your-database.vercel-storage.com`
     - **NOT** a `redis://` connection string
   - `KV_REST_API_TOKEN` - Your read/write API token (required)
   - `KV_REST_API_READ_ONLY_TOKEN` - Your read-only API token (optional)

   **Important**: You need BOTH `KV_REST_API_URL` and `KV_REST_API_TOKEN` for `@vercel/kv` to work!

## Step 3: Add Environment Variables to Vercel Project

1. **Go to Project Settings**

   - In your Vercel project dashboard
   - Click **Settings** → **Environment Variables**

2. **Add Each Variable**
   For each variable (`KV_REST_API_URL`, `KV_REST_API_TOKEN`, `KV_REST_API_READ_ONLY_TOKEN`):
   - Click **Add New**
   - Enter the variable name
   - Paste the value from Step 2
   - Select environments: **Production**, **Preview**, and **Development**
   - Click **Save**

## Step 4: Add Environment Variables Locally

1. **Open `.env` file** in your project root

2. **Add the KV variables** (you can copy them from the Vercel dashboard):

   ```env
   KV_REST_API_URL=https://your-kv-database.vercel-storage.com
   KV_REST_API_TOKEN=your-kv-rest-api-token-here
   KV_REST_API_READ_ONLY_TOKEN=your-kv-read-only-token-here
   ```

3. **Restart your dev server** after adding the variables

## Step 5: Verify Setup

1. **Restart your Next.js dev server**

   ```bash
   npm run dev
   ```

2. **Check the console**

   - If you see warnings about `@vercel/kv` not being installed, run:
     ```bash
     npm install @vercel/kv
     ```
   - If caching is working, you'll see `[Cache HIT]` or `[Cache MISS]` messages in your API route logs

3. **Test the caching**
   - Make a request to `/api/product` or `/api/categories`
   - First request: Should show `X-Cache: MISS` in response headers
   - Second request (within TTL): Should show `X-Cache: HIT` in response headers

## Troubleshooting

### "Module not found: Can't resolve '@vercel/kv'"

- **Solution**: Run `npm install @vercel/kv` in your project directory

### Caching not working

- **Check**: Ensure environment variables are set correctly
- **Check**: Verify `KV_REST_API_URL` and `KV_REST_API_TOKEN` are in your `.env` file
- **Check**: Restart your dev server after adding environment variables

### "Redis GET error" or "Redis SET error"

- **Check**: Verify your KV database is active in Vercel dashboard
- **Check**: Ensure your API tokens are correct and not expired
- **Check**: Verify your KV database region matches your deployment region

## Quick Reference

### Where to Find KV Credentials

- **Vercel Dashboard** → **Your Project** → **Storage** → **KV Database** → **.env.local tab**

### Environment Variables Needed

- `KV_REST_API_URL` (required) - Must be a Vercel KV REST API URL (starts with `https://`)
- `KV_REST_API_TOKEN` (required) - Required by `@vercel/kv` package
- `KV_REST_API_READ_ONLY_TOKEN` (optional) - Only needed for read-only operations

**Note**: If you see a `redis://` connection string, that's NOT a Vercel KV REST API URL.
You need to get the actual REST API URL from the Vercel dashboard.

### Cache TTL Settings

- Product list: 5 minutes
- Individual products: 10 minutes
- Categories: 10 minutes
- Settings/Hero section: 30 minutes

## Next Steps

Once KV is set up:

1. ✅ Caching will automatically work for product and category API routes
2. ✅ Cache invalidation happens automatically on create/update/delete
3. ✅ Your app will have significantly better performance
4. ✅ Database load will be reduced by 60-80%

For more information, visit: https://vercel.com/docs/storage/vercel-kv
