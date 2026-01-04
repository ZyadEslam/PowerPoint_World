# Localization Setup Guide

## What Has Been Implemented

### 1. Translation Files

- ✅ `messages/en.json` - English translations
- ✅ `messages/ar.json` - Arabic translations
- ✅ Both files include translations for shop, common, nav, product, cart, and footer sections

### 2. Configuration Files

- ✅ `i18n.ts` - Next-intl configuration
- ✅ `middleware.ts` - Locale routing middleware
- ✅ `app/[locale]/layout.tsx` - Locale-aware layout with RTL support
- ✅ `app/components/LanguageSwitcher.tsx` - Language switching component

### 3. Updated Components

- ✅ `ShopLayout.tsx` - Uses translations for shop page
- ✅ `CategoryFilter.tsx` - Translated category buttons
- ✅ `ProductFilters.tsx` - Translated filter labels
- ✅ `ProductsGrid.tsx` - Updated to work with translations
- ✅ `app/style/globals.css` - Added RTL support

### 4. Features

- ✅ Automatic locale detection from URL (`/en` or `/ar`)
- ✅ RTL (Right-to-Left) layout for Arabic
- ✅ Language switcher component
- ✅ Translations for all shop components

## Next Steps

### 1. Restructure App Folder

Move your existing pages into the `[locale]` folder:

```
app/
  [locale]/
    layout.tsx (already created)
    page.tsx (move from app/page.tsx)
    shop/
      page.tsx (move from app/shop/page.tsx)
    about/
    contact/
    ... (other routes)
```

### 2. Update Root Layout

The existing `app/layout.tsx` should be removed or simplified since we now have `app/[locale]/layout.tsx`.

### 3. Add Language Switcher to Navigation

Import and add the `LanguageSwitcher` component to your `UserNav.tsx`:

```tsx
import LanguageSwitcher from "./LanguageSwitcher";

// Add it to your nav component
<LanguageSwitcher />;
```

### 4. Update Next.js Config

Add to `next.config.js`:

```js
const nextConfig = {
  // ... existing config
  // No additional config needed for next-intl
};
```

### 5. Test the Implementation

1. Start the dev server: `npm run dev`
2. Visit `http://localhost:3000/en` for English
3. Visit `http://localhost:3000/ar` for Arabic
4. Use the language switcher to change languages

## How to Use Translations

### In Client Components

```tsx
import { useTranslations } from "next-intl";

function MyComponent() {
  const t = useTranslations("shop");
  return <h1>{t("title")}</h1>;
}
```

### Adding New Translations

1. Add the key to `messages/en.json`
2. Add the same key to `messages/ar.json`
3. Use it in your component: `t('yourKey')`

## Important Notes

1. **URLs**: All pages now need locale prefix (`/en` or `/ar`)
2. **RTL**: Arabic automatically applies RTL layout
3. **Future Pages**: Create all new pages inside `app/[locale]/` folder
4. **Middleware**: The middleware handles locale routing automatically

## Troubleshooting

### Issue: Pages not found after adding locale

- Make sure you moved pages to `app/[locale]/` folder
- Check that paths in components use locale-aware routing

### Issue: Translations not showing

- Ensure you're accessing pages with locale prefix (`/en` or `/ar`)
- Check that translation keys exist in both `en.json` and `ar.json`
- Verify `NextIntlClientProvider` wraps your component tree

### Issue: RTL not working properly

- Check that `app/[locale]/layout.tsx` has `dir={locale === 'ar' ? 'rtl' : 'ltr'}` on the `<html>` tag
- Some Tailwind classes need manual RTL handling
