import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { generateMetadata as generateSEOMetadata } from "../../utils/seo";
import ShopProductsProvider from "../../components/providers/ShopProductsProvider";
import { fetchInitialProducts, fetchShopCategories } from "./shop-data";
import ShopContent from "./ShopContent";

// Add ISR revalidation
export const revalidate = 60; // Revalidate every 60 seconds
interface ShopPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    category?: string;
    q?: string;
    sort?: string;
    page?: string;
  }>;
}

export async function generateMetadata({
  searchParams,
}: ShopPageProps): Promise<Metadata> {
  const searchParamsData = await searchParams;
  const { category, q } = searchParamsData;
  const t = await getTranslations("shop");
  const tNav = await getTranslations("nav");

  let title = t("title") + " - " + tNav("shop");
  let description = t("defaultDescription");
  let keywords = [
    "shop",
    "products",
    "e-commerce",
    "online shopping",
    "premium goods",
  ];

  if (category) {
    title = `${category.charAt(0).toUpperCase() + category.slice(1)} ${t(
      "products"
    )} - Espesyal Shop`;
    description = t("categoryDescription", { category });
    keywords = [category, "products", "shop", "buy", "premium"];
  }

  if (q) {
    title = `${t("searchResults")} "${q}" - Espesyal Shop`;
    description = t("searchDescription", { query: q });
    keywords = [q, "search", "products", "results"];
  }

  return generateSEOMetadata({
    title,
    description,
    keywords,
    canonical: `/shop${category ? `?category=${category}` : ""}${
      q ? `?q=${q}` : ""
    }`,
  });
}

const ShopPage = async ({ params, searchParams }: ShopPageProps) => {
  const { locale } = await params;
  const searchParamsData = await searchParams;
  const { category, q } = searchParamsData;

  // Use getTranslations for server components
  const t = await getTranslations("shop");
  const tNav = await getTranslations("nav");

  // Fetch initial products and categories in parallel (server-side)
  const [initialData, initialCategories] = await Promise.all([
    fetchInitialProducts(category),
    fetchShopCategories(),
  ]);

  const breadcrumbItems = [
    { name: tNav("home"), url: `/${locale}` },
    { name: tNav("shop"), url: `/${locale}/shop`, current: true },
  ];

  if (category) {
    breadcrumbItems.splice(-1, 0, {
      name: category.charAt(0).toUpperCase() + category.slice(1),
      url: `/${locale}/shop?category=${category}`,
    });
  }

  if (q) {
    breadcrumbItems.splice(-1, 0, {
      name: `${t("searchLabel")}: "${q}"`,
      url: `/${locale}/shop?q=${q}`,
    });
  }

  // Preload critical images for above-fold products (first 4)
  const criticalImageUrls = initialData.products
    .slice(0, 4)
    .map((product) => {
      if (product._id && product.imgSrc && product.imgSrc.length > 0) {
        return `/api/product/image/${product._id}?index=0&w=320&h=320&q=80`;
      }
      return null;
    })
    .filter((url): url is string => url !== null);

  return (
    <ShopProductsProvider
      initialProducts={initialData.products}
      initialPagination={initialData.pagination}
      initialFilters={initialData.filters}
    >
      <ShopContent
        category={category}
        q={q}
        breadcrumbItems={breadcrumbItems}
        initialCategories={initialCategories}
        criticalImageUrls={criticalImageUrls}
      />
    </ShopProductsProvider>
  );
};

export default ShopPage;
