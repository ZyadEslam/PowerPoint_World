# Project Migration Guide

This guide lists all the keys, configurations, and project-specific values you need to replace when migrating this project to a new client/work.

## 📋 Table of Contents

1. [Environment Variables](#environment-variables)
2. [Project Metadata](#project-metadata)
3. [Database Configuration](#database-configuration)
4. [Authentication Configuration](#authentication-configuration)
5. [Payment Gateway Configuration](#payment-gateway-configuration)
6. [Redis/Cache Configuration](#rediscache-configuration)
7. [SEO & Branding](#seo--branding)
8. [Hardcoded URLs & Domains](#hardcoded-urls--domains)
9. [Social Media Links](#social-media-links)
10. [File Locations](#file-locations)

---

## 🔐 Environment Variables

Create a `.env.local` file (or update your existing one) with the following variables:

### Database

```env
# MongoDB Connection String
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database-name
```

### Authentication (NextAuth)

```env
# NextAuth Secret (generate a new one: openssl rand -base64 32)
NEXTAUTH_SECRET=your-new-secret-key-here
NEXTAUTH_URL=http://localhost:3000  # or your production URL

# Google OAuth (get from Google Cloud Console)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# First Admin Email (the first user with this email will be granted admin access)
FIRST_ADMIN_EMAIL=admin@yourdomain.com
```

### Payment Gateway (Paymob)

```env
# Paymob API Credentials (get from Paymob dashboard)
PAYMOB_API_KEY=your-paymob-api-key
PAYMOB_INTEGRATION_ID=your-integration-id
PAYMOB_IFRAME_ID=your-iframe-id
PAYMOB_HMAC_SECRET=your-hmac-secret
```

### Redis/Cache

```env
# Option 1: Vercel KV (recommended for Vercel deployments)
KV_REST_API_URL=https://your-kv-database.vercel-storage.com
KV_REST_API_TOKEN=your-kv-rest-api-token

# Option 2: Direct Redis Connection (Redis Labs, etc.)
REDIS_URL=redis://username:password@host:port
# OR use custom name (currently uses: espesyal_REDIS_URL)
YOUR_PROJECT_REDIS_URL=redis://username:password@host:port
```

### Application URLs

```env
# Your application URL (used for webhooks, redirects, SEO)
NEXT_PUBLIC_APP_URL=https://your-domain.com
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

### SEO Verification (Optional)

```env
NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=your-google-verification-code
NEXT_PUBLIC_YANDEX_VERIFICATION=your-yandex-verification-code
NEXT_PUBLIC_YAHOO_VERIFICATION=your-yahoo-verification-code
NEXT_PUBLIC_FACEBOOK_APP_ID=your-facebook-app-id
```

---

## 📦 Project Metadata

### 1. `package.json`

**File:** `package.json` (line 2)

```json
{
  "name": "your-new-project-name",  // Change from "e-commerce"
  "version": "0.1.0",
  ...
}
```

---

## 🗄️ Database Configuration

### Files to Check:

- `lib/mongoose.ts` - Uses `MONGODB_URI`
- `app/utils/db.ts` - Uses `MONGODB_URI`

**Action:** Update `MONGODB_URI` environment variable with your new database connection string.

---

## 🔑 Authentication Configuration

### Files to Check:

- `lib/auth.ts` - Contains Google OAuth configuration
- `app/api/auth/[...nextauth]/route.ts` - NextAuth route handler

**Environment Variables to Update:**

- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`
- `FIRST_ADMIN_EMAIL`

**Action:**

1. Create a new Google OAuth app in [Google Cloud Console](https://console.cloud.google.com/)
2. Generate a new `NEXTAUTH_SECRET` using: `openssl rand -base64 32`
3. Update `FIRST_ADMIN_EMAIL` with the email that should have admin access

---

## 💳 Payment Gateway Configuration

### Files to Check:

- `app/api/paymob/create-payment/route.ts`
- `app/api/paymob/webhook/route.ts`

**Environment Variables to Update:**

- `PAYMOB_API_KEY`
- `PAYMOB_INTEGRATION_ID`
- `PAYMOB_IFRAME_ID`
- `PAYMOB_HMAC_SECRET`

**Action:**

1. Create a new Paymob account or use existing credentials
2. Get credentials from Paymob dashboard: [accept.paymob.com/portal2](https://accept.paymob.com/portal2)
3. Configure webhook URL in Paymob dashboard: `https://your-domain.com/api/paymob/webhook`

**Note:** If you're using a different payment gateway, you'll need to replace the Paymob integration entirely.

---

## 🔴 Redis/Cache Configuration

### Files to Check:

- `lib/redis.ts` - Currently checks for `espesyal_REDIS_URL` or `REDIS_URL`

**Environment Variables:**

- Option 1: `KV_REST_API_URL` + `KV_REST_API_TOKEN` (Vercel KV)
- Option 2: `REDIS_URL` (Direct Redis connection)
- Option 3: Custom name like `YOUR_PROJECT_REDIS_URL` (requires code change)

**Action:**

1. If using Vercel KV: Create a new KV database in Vercel and get credentials
2. If using direct Redis: Update `REDIS_URL` or change the variable name in `lib/redis.ts` (line 5, 50)

**To change the custom Redis variable name:**

```typescript
// In lib/redis.ts, replace:
const redisUrl = process.env.espesyal_REDIS_URL || process.env.REDIS_URL;
// With:
const redisUrl = process.env.YOUR_PROJECT_REDIS_URL || process.env.REDIS_URL;
```

---

## 🎨 SEO & Branding

### Files to Update:

#### 1. `app/utils/seo.ts` (lines 48-59)

```typescript
const defaultConfig = {
  siteName: "Your New Site Name", // Change from "Espesyal Shop"
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "https://your-domain.com",
  defaultDescription: "Your new site description",
  defaultKeywords: ["your", "keywords", "here"],
  twitterHandle: "@yourtwitterhandle", // Change from "@espesyalshop"
  facebookAppId: process.env.NEXT_PUBLIC_FACEBOOK_APP_ID,
};
```

#### 2. `app/components/seo/SEOComponents.tsx` (lines 44-46, 91-92, 179, 200, 267, 272)

```typescript
const siteName = "Your New Site Name"; // Change from "Espesyal Shop"
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://your-domain.com";
// ... and update Twitter handles
```

#### 3. `app/[locale]/layout.tsx` (lines 37-39)

```typescript
title: "Your Site Name - Your Tagline",
description: "Your new description",
```

#### 4. `app/components/NavBar.tsx` (line 51)

```typescript
<span className="text-xl font-bold gradient-text">Your Brand Name</span>
// Change from "SlidesMaster"
```

#### 5. `app/components/UserNav.tsx` (lines 159, 169)

```typescript
alt = "Your Site Logo";
// And update brand name
```

#### 6. `app/components/Footer.tsx` (line 152, 312)

```typescript
// Update "Espesyal Shop" to your brand name
```

#### 7. `messages/en.json` and `messages/ar.json`

Search and replace all instances of:

- "Espesyal Shop" → "Your Brand Name"
- Update meta titles and descriptions
- Update social media handles

---

## 🌐 Hardcoded URLs & Domains

### Files to Update:

#### 1. `next.config.js` (line 34)

```javascript
remotePatterns: [
  // ... existing patterns ...
  {
    protocol: "https",
    hostname: "your-new-domain.vercel.app",  // Change from "quick-cart-e-commerce-pi.vercel.app"
    pathname: "/api/product/image/**",
    search: "**",
  },
],
```

#### 2. `app/sitemap.ts` (line 7)

```typescript
const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://your-domain.com";
// Change from "https://espesyal-shop.vercel.app"
```

#### 3. `app/robots.ts` (line 5)

```typescript
const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://your-domain.com";
// Change from "https://espesyal-shop.vercel.app"
```

#### 4. `app/utils/seo.ts` (line 50)

```typescript
siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "https://your-domain.com",
// Change from "https://espesyal-shop.vercel.app"
```

#### 5. `app/components/seo/SEOComponents.tsx` (line 46, 179, 267)

```typescript
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://your-domain.com";
// Change from "https://espesyal-shop.vercel.app"
```

#### 6. `app/[locale]/product/[id]/page.tsx` (lines 47, 56, 131, 155)

Update all references to:

- `https://espesyal-shop.vercel.app` → `https://your-domain.com`
- `"Espesyal Shop"` → `"Your Brand Name"`

---

## 📱 Social Media Links

### Files to Update:

#### 1. `app/components/Footer.tsx` (lines 106, 116, 254, 260)

```typescript
// Update Instagram link
href: "https://www.instagram.com/your-instagram-handle",

// Update TikTok link
href: "https://www.tiktok.com/@your-tiktok-handle",

// Update email
href="mailto:your-email@domain.com"
<span>your-email@domain.com</span>
```

#### 2. `app/components/homeComponents/SubscriptionOffer.tsx` (lines 225, 237)

Update Instagram and TikTok links

#### 3. `app/components/aboutComponents/ContactUsSection.tsx` (lines 14, 33)

Update social media links

---

## 📁 File Locations

### Brand Assets

**Location:** `public/espesyal/` directory

**Action:**

1. Replace all images in `public/espesyal/` with your new brand assets
2. Update image references in:
   - `app/components/homeComponents/SubscriptionOffer.tsx` (line 367)
   - `app/components/aboutComponents/HeroSection.tsx` (line 21)
   - `public/assets/assets.js` (all imports)

### Logo Files

- Update logo references in `app/components/UserNav.tsx`
- Update favicon: `app/favicon.ico` and `public/favicon.ico`

---

## ✅ Checklist

Use this checklist to ensure you've updated everything:

### Environment Variables

- [ ] `MONGODB_URI` - New database connection string
- [ ] `NEXTAUTH_SECRET` - New secret generated
- [ ] `NEXTAUTH_URL` - Updated to new domain
- [ ] `GOOGLE_CLIENT_ID` - New OAuth credentials
- [ ] `GOOGLE_CLIENT_SECRET` - New OAuth credentials
- [ ] `FIRST_ADMIN_EMAIL` - Admin email set
- [ ] `PAYMOB_API_KEY` - New payment gateway credentials
- [ ] `PAYMOB_INTEGRATION_ID` - New payment gateway credentials
- [ ] `PAYMOB_IFRAME_ID` - New payment gateway credentials
- [ ] `PAYMOB_HMAC_SECRET` - New payment gateway credentials
- [ ] `KV_REST_API_URL` or `REDIS_URL` - New cache credentials
- [ ] `NEXT_PUBLIC_APP_URL` - New domain
- [ ] `NEXT_PUBLIC_SITE_URL` - New domain

### Code Files

- [ ] `package.json` - Project name updated
- [ ] `next.config.js` - Domain in remotePatterns updated
- [ ] `app/utils/seo.ts` - Site name, URL, description updated
- [ ] `app/components/seo/SEOComponents.tsx` - Site name, URL, Twitter handle updated
- [ ] `app/components/NavBar.tsx` - Brand name updated
- [ ] `app/components/UserNav.tsx` - Logo and brand name updated
- [ ] `app/components/Footer.tsx` - Brand name, social links, email updated
- [ ] `app/[locale]/layout.tsx` - Title and description updated
- [ ] `app/sitemap.ts` - Base URL updated
- [ ] `app/robots.ts` - Base URL updated
- [ ] `messages/en.json` - All brand references updated
- [ ] `messages/ar.json` - All brand references updated
- [ ] `lib/redis.ts` - Redis variable name updated (if using custom name)

### Assets

- [ ] Logo files replaced
- [ ] Favicon replaced
- [ ] Brand images in `public/espesyal/` replaced
- [ ] Image references in components updated

### Payment Gateway

- [ ] Paymob webhook URL configured in dashboard
- [ ] Test payment flow works

### Testing

- [ ] Database connection works
- [ ] Authentication (Google OAuth) works
- [ ] Payment gateway works
- [ ] Cache/Redis works
- [ ] All URLs redirect correctly
- [ ] SEO metadata displays correctly

---

## 🔍 Quick Find & Replace

To quickly find all instances of old project names, use these search terms:

1. **"Espesyal Shop"** - Brand name (67+ instances)
2. **"espesyal"** - Various references (case-insensitive)
3. **"quick-cart-e-commerce-pi.vercel.app"** - Old domain
4. **"espesyal-shop.vercel.app"** - Old domain
5. **"SlidesMaster"** - Old brand name in NavBar
6. **"@espesyalshop"** - Twitter handle
7. **"espesyaleg@gmail.com"** - Old email

---

## 📝 Notes

1. **Redis Variable Name**: The code currently uses `espesyal_REDIS_URL` as a fallback. If you want to use a custom name, update `lib/redis.ts` lines 5 and 50.

2. **Payment Gateway**: If you're not using Paymob, you'll need to replace the entire payment integration in `app/api/paymob/`.

3. **Localization**: Make sure to update both `messages/en.json` and `messages/ar.json` for all brand references.

4. **Environment Variables**: Never commit `.env.local` to version control. Use Vercel's environment variables dashboard for production.

5. **Database**: Make sure your new MongoDB database has the same schema/models. The models are in `app/models/`.

---

## 🚀 After Migration

1. Test all authentication flows
2. Test payment processing (use test mode)
3. Verify all URLs work correctly
4. Check SEO metadata in page source
5. Test cache functionality
6. Verify social media links
7. Check email addresses are correct

---

**Last Updated:** 2025-01-27
