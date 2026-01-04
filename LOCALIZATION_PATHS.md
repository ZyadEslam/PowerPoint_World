# Exact Paths After Localization Setup

## URL Structure

All pages now require a locale prefix in the URL:

### English (EN)

- Home: `http://localhost:3000/en`
- Shop: `http://localhost:3000/en/shop`
- Shop with category: `http://localhost:3000/en/shop?category=electronics`
- About: `http://localhost:3000/en/about`
- Contact: `http://localhost:3000/en/contact`
- Cart: `http://localhost:3000/en/cart`
- Wishlist: `http://localhost:3000/en/wishlist`
- Product: `http://localhost:3000/en/product/[id]`
- Dashboard: `http://localhost:3000/en/dashboard`
- Shipping Address: `http://localhost:3000/en/shipping-address`

### Arabic (AR)

- Home: `http://localhost:3000/ar`
- Shop: `http://localhost:3000/ar/shop`
- Shop with category: `http://localhost:3000/ar/shop?category=electronics`
- About: `http://localhost:3000/ar/about`
- Contact: `http://localhost:3000/ar/contact`
- Cart: `http://localhost:3000/ar/cart`
- Wishlist: `http://localhost:3000/ar/wishlist`
- Product: `http://localhost:3000/ar/product/[id]`
- Dashboard: `http://localhost:3000/ar/dashboard`
- Shipping Address: `http://localhost:3000/ar/shipping-address`

## Directory Structure

```
app/
  [locale]/
    layout.tsx          # Locale-aware layout with RTL support
    page.tsx            # Home page
    about/
      page.tsx          # About page
    contact/
      page.tsx          # Contact page
    shop/
      page.tsx          # Shop page
    cart/
      page.tsx          # Cart page
    wishlist/
      page.tsx          # Wishlist page
    product/
      [id]/
        page.tsx        # Product detail page
    shipping-address/
      page.tsx          # Shipping address page
    dashboard/
      layout.tsx        # Dashboard layout
      page.tsx          # Dashboard home
      product-list/
        page.tsx        # Product list
      orders/
        page.tsx        # Orders
```

## Important Notes

1. **Root redirect**: Visiting `http://localhost:3000` will redirect to `/en` by default
2. **Language switcher**: Automatically switches between `/en` and `/ar` while maintaining the current page
3. **RTL**: Arabic pages automatically use RTL layout
4. **Links**: All internal links in components need to use locale prefix

## How to Link to Pages

In your components, always use the locale prefix:

```tsx
// ❌ Wrong
<Link href="/shop">Shop</Link>;

// ✅ Correct
const locale = useLocale();
<Link href={`/${locale}/shop`}>Shop</Link>;

// Or using helper function
const getLocalizedPath = (path: string) => `/${locale}${path}`;
<Link href={getLocalizedPath("/shop")}>Shop</Link>;
```

## Middleware Behavior

The middleware automatically:

- Redirects `/` to `/en` (default locale)
- Handles locale routing for all paths
- Validates locale and returns 404 for invalid locales
- Preserves URL parameters during locale switching

## Testing

1. Start dev server: `npm run dev`
2. Visit `http://localhost:3000` → Redirects to `/en`
3. Click language switcher → Switches to `/ar` with RTL
4. Navigate to `/en/shop` → English shop page
5. Switch language → Changes to `/ar/shop` with Arabic text
