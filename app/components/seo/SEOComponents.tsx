"use client";

import React from "react";
import Link from "next/link";

interface StructuredDataProps {
  data: Record<string, unknown>;
}

export function StructuredData({ data }: StructuredDataProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string[];
  canonical?: string;
  ogImage?: string;
  ogType?: "website" | "article" | "product";
  twitterCard?: "summary" | "summary_large_image" | "app" | "player";
  noIndex?: boolean;
  noFollow?: boolean;
  structuredData?: Record<string, unknown>[];
}

export function SEOHead({
  title,
  description,
  keywords = [],
  canonical,
  ogImage,
  ogType = "website",
  twitterCard = "summary_large_image",
  noIndex = false,
  noFollow = false,
  structuredData = [],
}: SEOHeadProps) {
  const siteName = "Espesyal Shop";
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://espesyal-shop.vercel.app";
  const fullTitle = title ? `${title} | ${siteName}` : siteName;
  const fullDescription =
    description ||
    "Premium e-commerce store offering high-quality products with exceptional customer service.";
  const fullKeywords = [
    "e-commerce",
    "online shopping",
    "premium products",
    "quality goods",
    ...keywords,
  ];
  const canonicalUrl = canonical || siteUrl;
  const ogImageUrl = ogImage || `${siteUrl}/og-image.jpg`;

  return (
    <>
      <title>{fullTitle}</title>
      <meta name="description" content={fullDescription} />
      <meta name="keywords" content={fullKeywords.join(", ")} />
      <meta name="author" content={siteName} />
      <meta
        name="robots"
        content={`${noIndex ? "noindex" : "index"}, ${
          noFollow ? "nofollow" : "follow"
        }`}
      />

      {/* Canonical URL */}
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph */}
      <meta property="og:type" content={ogType} />
      <meta property="og:locale" content="en_US" />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={fullDescription} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:image" content={ogImageUrl} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={fullTitle} />

      {/* Twitter */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:site" content="@espesyalshop" />
      <meta name="twitter:creator" content="@espesyalshop" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={fullDescription} />
      <meta name="twitter:image" content={ogImageUrl} />

      {/* Additional meta tags */}
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="theme-color" content="#000000" />
      <meta name="msapplication-TileColor" content="#000000" />

      {/* Structured Data */}
      {structuredData.map((data, index) => (
        <StructuredData key={index} data={data} />
      ))}
    </>
  );
}

interface BreadcrumbProps {
  items: Array<{
    name: string;
    url: string;
    current?: boolean;
  }>;
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className="my-6 px-4 sm:px-0">
      <ol className="flex items-center space-x-2 text-sm text-gray-600">
        {items.map((item, index) => (
          <li key={index} className="flex items-center">
            {index > 0 && (
              <svg
                className="w-4 h-4 mx-2 text-gray-400"
                fill="currentColor"
                viewBox="0 0 20 20"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            )}
            {item.current ? (
              <span className="font-medium text-gray-900" aria-current="page">
                {item.name} 
              </span>
            ) : (
              <Link
                href={item.url}
                className="hover:text-gray-900 transition-colors duration-200"
              >
                {item.name}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

interface ProductSchemaProps {
  product: {
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
  };
}

export function ProductSchema({ product }: ProductSchemaProps) {
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://espesyal-shop.vercel.app";

  const structuredData = {
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
        name: "Espesyal Shop",
        url: siteUrl,
      },
    },
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

  return <StructuredData data={structuredData} />;
}

interface OrganizationSchemaProps {
  organization: {
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
  };
}

export function OrganizationSchema({ organization }: OrganizationSchemaProps) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: organization.name,
    description: organization.description,
    url: organization.url,
    logo: organization.logo,
    ...(organization.contactPoint && {
      contactPoint: {
        "@type": "ContactPoint",
        telephone: organization.contactPoint.telephone,
        contactType:
          organization.contactPoint.contactType || "customer service",
        email: organization.contactPoint.email,
      },
    }),
    ...(organization.sameAs && { sameAs: organization.sameAs }),
  };

  return <StructuredData data={structuredData} />;
}

interface WebSiteSchemaProps {
  siteUrl?: string;
}

export function WebSiteSchema({ siteUrl }: WebSiteSchemaProps) {
  const url =
    siteUrl ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    "https://espesyal-shop.vercel.app";

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Espesyal Shop",
    url: url,
    description:
      "Premium e-commerce store offering high-quality products with exceptional customer service.",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${url}/shop?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  return <StructuredData data={structuredData} />;
}
