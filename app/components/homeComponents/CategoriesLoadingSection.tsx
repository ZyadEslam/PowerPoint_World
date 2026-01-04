"use client";

import React from "react";

const CategoriesLoadingSection: React.FC = () => {
  return (
    <section className="py-12 bg-gradient-to-b from-slate-50/60 to-white">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div className="h-8 w-40 rounded-full bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 animate-pulse" />
          <div className="hidden md:flex gap-2">
            <div className="h-8 w-24 rounded-full bg-slate-100 animate-pulse" />
            <div className="h-8 w-24 rounded-full bg-slate-100 animate-pulse" />
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div
              key={index}
              className="group overflow-hidden rounded-2xl border border-slate-100 bg-white/80 shadow-sm backdrop-blur-sm"
            >
              <div className="relative h-40 overflow-hidden bg-slate-100">
                <div className="absolute inset-0 animate-[pulse_1.5s_ease-in-out_infinite] bg-gradient-to-r from-slate-100 via-slate-200 to-slate-100" />
              </div>
              <div className="space-y-3 px-4 py-4">
                <div className="h-4 w-28 rounded-full bg-slate-100 animate-pulse" />
                <div className="h-3 w-full rounded-full bg-slate-100 animate-pulse" />
                <div className="h-3 w-3/4 rounded-full bg-slate-100 animate-pulse" />
                <div className="mt-2 flex items-center justify-between">
                  <div className="h-3 w-16 rounded-full bg-slate-100 animate-pulse" />
                  <div className="h-9 w-9 rounded-full bg-slate-100 animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoriesLoadingSection;


