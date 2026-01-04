import { Metadata } from "next";

export interface SEOConfig {
  title: string;
  description: string;
  keywords?: string[];
  canonical?: string;
  ogImage?: string;
  ogType?: "website" | "article" | "product";
  twitterCard?: "summary" | "summary_large_image" | "app" | "player";
  noIndex?: boolean;
  noFollow?: boolean;
  structuredData?: Record<string, unknown>;
}

export interface ProductSEOData {
  name: string;
  description: string;
  price: number;
  oldPrice?: number;
  currency?: string;
  availability?: "in_stock" | "out_of_stock" | "preorder";
  condition?: "new" | "used" | "refurbished";
  brand: string;
  category: string;
  images: string[];
  rating?: number;
  reviewCount?: number;
  sku?: string;
  mpn?: string;
  gtin?: string;
}

export interface OrganizationSEOData {
  name: string;
  description: string;
  url: string;
  logo: string;
  contactPoint?: {
    telephone?: string;
    contactType?: string;
    email?: string;
  };
  sameAs?: string[];
}

const defaultConfig = {
  siteName: "Espesyal Shop",
  siteUrl:
    process.env.NEXT_PUBLIC_SITE_URL || "https://espesyal-shop.vercel.app",
  defaultDescription:
    "Premium e-commerce store offering high-quality products with exceptional customer service.",
  defaultKeywords: [
    "e-commerce",
    "online shopping",
    "premium products",
    "quality goods",
  ],
  twitterHandle: "@espesyalshop",
  facebookAppId: process.env.NEXT_PUBLIC_FACEBOOK_APP_ID,
};

export function generateMetadata(config: SEOConfig): Metadata {
  const {
    title,
    description,
    keywords = [],
    canonical,
    ogImage,
    ogType = "website",
    twitterCard = "summary_large_image",
    noIndex = false,
    noFollow = false,
  } = config;

  const fullTitle = title.includes(defaultConfig.siteName)
    ? title
    : `${title} | ${defaultConfig.siteName}`;

  const fullDescription = description || defaultConfig.defaultDescription;
  const fullKeywords = [...defaultConfig.defaultKeywords, ...keywords];
  const canonicalUrl = canonical || defaultConfig.siteUrl;
  const ogImageUrl = ogImage || `${defaultConfig.siteUrl}/og-image.jpg`;

  return {
    title: fullTitle,
    description: fullDescription,
    keywords: fullKeywords.join(", "),
    authors: [{ name: defaultConfig.siteName }],
    creator: defaultConfig.siteName,
    publisher: defaultConfig.siteName,
    robots: {
      index: !noIndex,
      follow: !noFollow,
      googleBot: {
        index: !noIndex,
        follow: !noFollow,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      type: ogType === "product" ? "website" : ogType,
      locale: "en_US",
      url: canonicalUrl,
      title: fullTitle,
      description: fullDescription,
      siteName: defaultConfig.siteName,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: fullTitle,
        },
      ],
    },
    twitter: {
      card: twitterCard,
      site: defaultConfig.twitterHandle,
      creator: defaultConfig.twitterHandle,
      title: fullTitle,
      description: fullDescription,
      images: [ogImageUrl],
    },
    verification: {
      google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
      yandex: process.env.NEXT_PUBLIC_YANDEX_VERIFICATION,
      yahoo: process.env.NEXT_PUBLIC_YAHOO_VERIFICATION,
    },
  };
}

export function generateProductStructuredData(product: ProductSEOData) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.images,
    brand: {
      "@type": "Brand",
      name: product.brand,
    },
    category: product.category,
    offers: {
      "@type": "Offer",
      price: product.price,
      priceCurrency: product.currency || "USD",
      availability: `https://schema.org/${product.availability || "InStock"}`,
      condition: `https://schema.org/${product.condition || "NewCondition"}`,
      seller: {
        "@type": "Organization",
        name: defaultConfig.siteName,
      },
    },
    ...(product.oldPrice && {
      offers: {
        "@type": "Offer",
        price: product.price,
        priceCurrency: product.currency || "USD",
        availability: `https://schema.org/${product.availability || "InStock"}`,
        condition: `https://schema.org/${product.condition || "NewCondition"}`,
        seller: {
          "@type": "Organization",
          name: defaultConfig.siteName,
        },
        priceValidUntil: new Date(
          Date.now() + 30 * 24 * 60 * 60 * 1000
        ).toISOString(),
      },
    }),
    ...(product.rating && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: product.rating,
        reviewCount: product.reviewCount || 0,
        bestRating: 5,
        worstRating: 1,
      },
    }),
    ...(product.sku && { sku: product.sku }),
    ...(product.mpn && { mpn: product.mpn }),
    ...(product.gtin && { gtin: product.gtin }),
  };
}

export function generateOrganizationStructuredData(org: OrganizationSEOData) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: org.name,
    description: org.description,
    url: org.url,
    logo: org.logo,
    ...(org.contactPoint && {
      contactPoint: {
        "@type": "ContactPoint",
        telephone: org.contactPoint.telephone,
        contactType: org.contactPoint.contactType || "customer service",
        email: org.contactPoint.email,
      },
    }),
    ...(org.sameAs && { sameAs: org.sameAs }),
  };
}

export function generateBreadcrumbStructuredData(
  items: Array<{ name: string; url: string }>
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function generateWebSiteStructuredData() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: defaultConfig.siteName,
    url: defaultConfig.siteUrl,
    description: defaultConfig.defaultDescription,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${defaultConfig.siteUrl}/shop?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function generateCollectionStructuredData(category: {
  name: string;
  description?: string;
  url: string;
  productCount?: number;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: category.name,
    description: category.description,
    url: category.url,
    ...(category.productCount && {
      mainEntity: {
        "@type": "ItemList",
        numberOfItems: category.productCount,
      },
    }),
  };
}

export function generateFAQStructuredData(
  faqs: Array<{ question: string; answer: string }>
) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function generateCanonicalUrl(path: string): string {
  return `${defaultConfig.siteUrl}${path.startsWith("/") ? path : `/${path}`}`;
}

export function generateProductUrl(
  productId: string,
  productName: string
): string {
  const slug = slugify(productName);
  return `/product/${productId}/${slug}`;
}

export function generateCategoryUrl(categorySlug: string): string {
  return `/shop?category=${categorySlug}`;
}
