import Link from "next/link";
import React from "react";

const PrimaryBtn = ({
  text,
  href,
  customClass,
}: {
  text: string;
  href: string;
  customClass?: string;
}) => {
  return (
    <Link
      href={href}
      className={`bg-orange  ${customClass}`}
    >
      {text}
    </Link>
  );
};

export default PrimaryBtn;
