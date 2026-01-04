"use client";
import React from "react";
import {
  AddressHeroSection,
  ImageSection,
  ShippingFormSection,
} from "../../components/shippingComponents";

const ShippingPage = () => {
  return (
    <div className="min-h-screen bg-white px-[8.5%]">
      {/* Hero Section */}
      <AddressHeroSection />

      {/* Form and Image Section */}
      <section className="grid md:grid-cols-2 ">
        {/* Shipping Address Form */}
        <ShippingFormSection />

        {/* Image Section */}
        <ImageSection />
      </section>
    </div>
  );
};

export default ShippingPage;
