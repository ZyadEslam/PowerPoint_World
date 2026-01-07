"use client";
import React, { useState } from "react";
import { AddressProps, CityCategory } from "@/app/types/types";
import GuestAddressForm from "./GuestAddressForm";

interface CheckoutAddressSectionProps {
  onAddressChange: (address: AddressProps | null) => void;
  onCityCategoryChange?: (category: CityCategory) => void;
  selectedAddress?: AddressProps | null;
}

const CheckoutAddressSection = ({
  onAddressChange,
  onCityCategoryChange,
}: CheckoutAddressSectionProps) => {
  const [manualAddress, setManualAddress] = useState<AddressProps | null>(null);

  const handleManualAddressChange = (address: AddressProps | null) => {
    setManualAddress(address);
    onAddressChange(address);
  };

  return (
    <div className="bg-black rounded-2xl shadow-sm border border-gray-800 p-6">
      <GuestAddressForm
        onAddressChange={handleManualAddressChange}
        onCityCategoryChange={onCityCategoryChange}
        initialAddress={manualAddress || undefined}
      />
    </div>
  );
};

export default CheckoutAddressSection;
