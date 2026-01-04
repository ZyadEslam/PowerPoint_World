# Migration Quick Reference

A quick checklist of all keys and values to replace when migrating this project.

## 🔐 Environment Variables (.env.local)

```env
# Database
MONGODB_URI=mongodb+srv://...

# Authentication
NEXTAUTH_SECRET=...
NEXTAUTH_URL=...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
FIRST_ADMIN_EMAIL=...

# Payment (Paymob)
PAYMOB_API_KEY=...
PAYMOB_INTEGRATION_ID=...
PAYMOB_IFRAME_ID=...
PAYMOB_HMAC_SECRET=...

# Cache/Redis
KV_REST_API_URL=... (or REDIS_URL=...)

# URLs
NEXT_PUBLIC_APP_URL=...
NEXT_PUBLIC_SITE_URL=...
```

## 📝 Files to Update

### 1. Project Name
- `package.json` → `"name": "your-project-name"`

### 2. Brand Name (Search & Replace: "Espesyal Shop")
- `app/utils/seo.ts` (line 48)
- `app/components/seo/SEOComponents.tsx` (lines 44, 200, 272)
- `app/components/UserNav.tsx` (line 169)
- `app/components/Footer.tsx` (lines 152, 312)
- `app/[locale]/layout.tsx` (line 37)
- `app/[locale]/product/[id]/page.tsx` (lines 56, 155)
- `messages/en.json` (multiple)
- `messages/ar.json` (multiple)

### 3. Domain URLs (Search & Replace)
- `"quick-cart-e-commerce-pi.vercel.app"` → Your domain
- `"espesyal-shop.vercel.app"` → Your domain
- Files: `next.config.js`, `app/sitemap.ts`, `app/robots.ts`, `app/utils/seo.ts`, `app/components/seo/SEOComponents.tsx`, `app/[locale]/product/[id]/page.tsx`

### 4. NavBar Brand
- `app/components/NavBar.tsx` (line 51) → Change "SlidesMaster"

### 5. Social Media
- `app/components/Footer.tsx` (lines 106, 116, 254, 260)
- `app/components/homeComponents/SubscriptionOffer.tsx` (lines 225, 237)
- `app/components/aboutComponents/ContactUsSection.tsx` (lines 14, 33)

### 6. Twitter Handle
- `app/utils/seo.ts` (line 59) → Change "@espesyalshop"
- `app/components/seo/SEOComponents.tsx` (lines 91, 92)

### 7. Redis Variable (if using custom name)
- `lib/redis.ts` (lines 5, 50) → Change `espesyal_REDIS_URL` to your variable name

## 🎯 Quick Search Terms

Search for these in your codebase:
1. `"Espesyal Shop"` (67+ matches)
2. `"espesyal"` (case-insensitive)
3. `"quick-cart-e-commerce-pi.vercel.app"`
4. `"espesyal-shop.vercel.app"`
5. `"SlidesMaster"`
6. `"@espesyalshop"`
7. `"espesyaleg@gmail.com"`

## 📦 Assets to Replace

- `public/espesyal/` - All brand images
- `app/favicon.ico` & `public/favicon.ico` - Favicon
- Logo references in `app/components/UserNav.tsx`

## ✅ Priority Order

1. **Environment Variables** - Critical for app to run
2. **Database Connection** - `MONGODB_URI`
3. **Authentication** - Google OAuth + NextAuth
4. **Brand Name** - Search & replace "Espesyal Shop"
5. **Domain URLs** - All hardcoded domains
6. **Social Links** - Footer and components
7. **Assets** - Logos and images

---

See `MIGRATION_GUIDE.md` for detailed instructions.


