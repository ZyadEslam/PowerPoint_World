"use client";
import React, { createContext, useContext, useState, ReactNode } from "react";

interface DashboardMenuContextType {
  isDashboardMenuOpen: boolean;
  setIsDashboardMenuOpen: (open: boolean) => void;
  toggleDashboardMenu: () => void;
}

const DashboardMenuContext = createContext<DashboardMenuContextType | null>(
  null
);

export const DashboardMenuProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [isDashboardMenuOpen, setIsDashboardMenuOpen] = useState(false);

  const toggleDashboardMenu = () => {
    setIsDashboardMenuOpen((prev) => !prev);
  };

  return (
    <DashboardMenuContext.Provider
      value={{
        isDashboardMenuOpen,
        setIsDashboardMenuOpen,
        toggleDashboardMenu,
      }}
    >
      {children}
    </DashboardMenuContext.Provider>
  );
};

export const useDashboardMenu = () => {
  const context = useContext(DashboardMenuContext);
  if (!context) {
    // Return default values if context is not available (shouldn't happen, but safe fallback)
    return {
      isDashboardMenuOpen: false,
      setIsDashboardMenuOpen: () => {},
      toggleDashboardMenu: () => {},
    };
  }
  return context;
};
