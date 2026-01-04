"use client";
import { team } from "@/app/utils/staticData";
import React from "react";
import { useTranslations } from "next-intl";
import { User } from "lucide-react";

const TeamSection = () => {
  const t = useTranslations("about.team");

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12 underlined-header after:mx-auto">
          {t("title")}
        </h2>
        <div className="grid md:grid-cols-2 gap-8">
          {team.map((member, index) => (
            <div key={index} className="text-center">
              <div className="relative w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                <User className="w-16 h-16 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800">
                {member.name}
              </h3>
              <p className="text-orange mb-2">{member.role}</p>
              <p className="text-gray-600 text-sm">{member.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TeamSection;
