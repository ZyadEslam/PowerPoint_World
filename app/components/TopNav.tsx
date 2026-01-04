"use client";

import React, { memo } from "react";
import { usePathname } from "next/navigation";
import LanguageSwitcher from "./LanguageSwitcher";

const TopNav = memo(() => {
  const pathname = usePathname();
  const isAdminPage =
    pathname?.includes("/dashboard") || pathname?.includes("/admin");

  return (
    <nav
      className={`py-1 ${
        isAdminPage ? "top-nav bg-background" : "top-nav bg-background"
      }`}
    >
      <div className="w-[95%] mx-auto sm:container sm:mx-auto sm:px-6 lg:px-8">
        <div className="flex items-center w-full justify-end">
          <div>
            <LanguageSwitcher />
          </div>
        </div>
      </div>
    </nav>
  );
});

TopNav.displayName = "TopNav";

export default TopNav;
