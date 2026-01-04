import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Suspense, lazy } from "react";
import LoadingSpinner from "../../UI/LoadingSpinner";
import { generateMetadata as generateSEOMetadata } from "../../utils/seo";
import { Breadcrumb } from "../../components/seo/SEOComponents";

// Lazy load components for better code splitting
const MissionSection = lazy(() => import("../../components/aboutComponents/MissionSection"));
const ValuesSection = lazy(() => import("../../components/aboutComponents/ValuesSection"));
const TeamSection = lazy(() => import("../../components/aboutComponents/TeamSection"));
const ContactUsSection = lazy(() => import("../../components/aboutComponents/ContactUsSection"));

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "about" });

  return generateSEOMetadata({
    title: t("metaTitle"),
    description: t("metaDescription"),
    keywords: [
      "about us",
      "company",
      "mission",
      "values",
      "team",
      "story",
      "e-commerce",
      "premium products",
    ],
    canonical: `/${locale}/about`,
  });
}

const AboutPage = async ({
  params,
}: {
  params: Promise<{ locale: string }>;
}) => {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "about" });
  const tNav = await getTranslations({ locale, namespace: "nav" });

  const breadcrumbItems = [
    { name: tNav("home"), url: `/${locale}` },
    { name: t("breadcrumb"), url: `/${locale}/about`, current: true },
  ];

  return (
    <div className="min-h-screen mx-auto lg:max-w-7xl sm:w-[95%]">
      <Breadcrumb items={breadcrumbItems} />

      {/* Team Section */}
      <Suspense fallback={<LoadingSpinner />}>
        <TeamSection />
      </Suspense>

      {/* Mission Section */}
      <Suspense fallback={<LoadingSpinner />}>
        <MissionSection />
      </Suspense>

      {/* Values Section */}
      <Suspense fallback={<LoadingSpinner />}>
        <ValuesSection />
      </Suspense>

      {/* Contact CTA */}
      <Suspense fallback={<LoadingSpinner />}>
        <ContactUsSection />
      </Suspense>
    </div>
  );
};

export default AboutPage;
