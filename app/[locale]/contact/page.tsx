import { Metadata } from "next";
import React, {
  Suspense,
  //  lazy
} from "react";
import { getTranslations } from "next-intl/server";
import LoadingSpinner from "../../UI/LoadingSpinner";
import { ContactForm, ContactHeroSection, ContactInfo } from "../../components";
import { generateMetadata as generateSEOMetadata } from "../../utils/seo";
import { Breadcrumb } from "../../components/seo/SEOComponents";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "contact" });

  return generateSEOMetadata({
    title: t("metaTitle"),
    description: t("metaDescription"),
    keywords: [
      "contact us",
      "customer service",
      "support",
      "help",
      "questions",
      "inquiry",
      "e-commerce support",
    ],
    canonical: `/${locale}/contact`,
  });
}

const ContactPage = async ({
  params,
}: {
  params: Promise<{ locale: string }>;
}) => {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "contact" });
  const tNav = await getTranslations({ locale, namespace: "nav" });

  const breadcrumbItems = [
    { name: tNav("home"), url: `/${locale}` },
    { name: t("breadcrumb"), url: `/${locale}/contact`, current: true },
  ];

  return (
    <div className="min-h-screen bg-white mx-auto lg:max-w-7xl sm:w-[95%]">
      <Breadcrumb items={breadcrumbItems} />

      {/* Hero Section */}
      <Suspense fallback={<LoadingSpinner />}>
        <ContactHeroSection />
      </Suspense>

      {/* Contact Form and Info Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12">
            {/* Contact Form */}
            <Suspense fallback={<LoadingSpinner />}>
              <ContactForm />
            </Suspense>

            {/* Contact Information */}
            <ContactInfo />
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactPage;
