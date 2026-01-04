import { redirect } from "next/navigation";

export default function RootPage() {
  // This will be intercepted by the middleware and redirected to the default locale
  redirect("/en");
}

