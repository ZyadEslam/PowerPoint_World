import React from "react";
import { redirect } from "next/navigation";
import { checkAdminAccess } from "@/lib/adminAuth";
import DashboardSidebar from "../../components/dashboardComponents/DashboardSidebar";
import DashboardHeader from "../../components/dashboardComponents/DashboardHeader";

const DashboardLayout = async ({ children }: { children: React.ReactNode }) => {
  // Check admin access
  const { isAdmin } = await checkAdminAccess();

  if (!isAdmin) {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Gradient background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary-600/5 rounded-full blur-3xl" />
      </div>

      <div className="flex relative z-10">
        {/* Sidebar */}
        <DashboardSidebar />

        {/* Main content - use RTL-aware margin: ms (margin-start) instead of ml */}
        <div className="flex-1 flex flex-col min-h-screen lg:ms-72">
          {/* Header */}
          <DashboardHeader />

          {/* Page content */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
