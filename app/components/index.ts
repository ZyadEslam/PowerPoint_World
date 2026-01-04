import { lazy } from "react";
// General Components ///////////
export const ProductsGroup = lazy(() =>
  import("./productComponents/ProductsGroup")
);
export { default as ProductCard } from "./productComponents/ProductCard";
export { default as Footer } from "./Footer";
export { default as AuthButtons } from "./AuthButton";
export { default as Provider } from "./providers/AuthProvider";
export { default as ToggleMenuBtn } from "./ToggleMenuBtn";
export { default as TopNav } from "./TopNav";
export { default as UserNav } from "./UserNav";
export { default as DashboardSideNav } from "./dashboardComponents/DashboardSideNav";

// Home Components ///////////////
export { default as FeaturedProductCard } from "./homeComponents/FeaturedProductCard";
export { default as SubscriptionOffer } from "./homeComponents/SubscriptionOffer";
export { default as NewCollectionsSection } from "./homeComponents/NewCollectionsSection";
export const FeaturedProductsList = lazy(() =>
  import("./homeComponents/FeaturedProductsList")
);
export const AdvSlider = lazy(() => import("./homeComponents/HeroSection"));
export const AdvBar = lazy(() => import("./homeComponents/AdvBar"));

// About Components //////////////
export { default as HeroSection } from "./aboutComponents/HeroSection";
export { default as MissionSection } from "./aboutComponents/MissionSection";
export { default as ValuesSection } from "./aboutComponents/ValuesSection";
export { default as TeamSection } from "./aboutComponents/TeamSection";
export { default as ContactUsSection } from "./aboutComponents/ContactUsSection";

//Contact Components //////////////////
export { default as ContactHeroSection } from "./contactComponents/ContactHeroSection";
export { default as ContactForm } from "./contactComponents/ContactForm";
export { default as ContactInfo } from "./contactComponents/ContactInfo";


// Cart Components ///////////////////
export const CartTable = lazy(() => import("./cartComponents/CartTable"));
