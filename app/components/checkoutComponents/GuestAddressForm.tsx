"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { AddressProps, CityCategory } from "@/app/types/types";
import { ChevronDown } from "lucide-react";

interface GuestAddressFormProps {
  onAddressChange: (address: AddressProps | null) => void;
  onCityCategoryChange?: (category: CityCategory) => void;
  initialAddress?: AddressProps | null;
}

const GuestAddressForm = ({
  onAddressChange,
  onCityCategoryChange,
  initialAddress,
}: GuestAddressFormProps) => {
  const tShipping = useTranslations("shipping");
  const tCheckout = useTranslations("checkout");
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const isInitialMount = useRef(true);

  // Determine initial city category from initialAddress
  const getInitialCityCategory = (): CityCategory => {
    if (!initialAddress?.city) return "cairo";
    const cityLower = initialAddress.city.toLowerCase();
    if (cityLower === "cairo" || cityLower === "القاهرة") return "cairo";
    if (cityLower === "giza" || cityLower === "الجيزة") return "giza";
    return "other";
  };

  const [formData, setFormData] = useState({
    name: initialAddress?.name || "",
    phone: initialAddress?.phone || "",
    address: initialAddress?.address || "",
    city: initialAddress?.city || "",
    state: initialAddress?.state || "",
  });
  const [cityCategory, setCityCategory] = useState<CityCategory>(
    getInitialCityCategory()
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  // Notify parent of city category on initial mount
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      if (onCityCategoryChange) {
        onCityCategoryChange(cityCategory);
      }
    }
  }, [cityCategory, onCityCategoryChange]);

  const getCityName = useCallback(
    (category: CityCategory, customCity: string) => {
      if (category === "cairo") return tShipping("form.cityOptions.cairo");
      if (category === "giza") return tShipping("form.cityOptions.giza");
      return customCity;
    },
    [tShipping]
  );

  const validateForm = useCallback(
    (data: typeof formData, category: CityCategory) => {
      const newErrors: Record<string, string> = {};
      let isValid = true;

      if (!data.name.trim()) {
        newErrors.name = tShipping("form.validation.nameRequired");
        isValid = false;
      }
      if (!data.phone.trim()) {
        newErrors.phone = tShipping("form.validation.phoneRequired");
        isValid = false;
      }
      if (!data.address.trim()) {
        newErrors.address = tShipping("form.validation.addressRequired");
        isValid = false;
      }
      if (category === "other" && !data.city.trim()) {
        newErrors.city = tShipping("form.validation.cityRequired");
        isValid = false;
      }
      if (!data.state.trim()) {
        newErrors.state = tShipping("form.validation.stateRequired");
        isValid = false;
      }

      return { isValid, errors: newErrors };
    },
    [tShipping]
  );

  const buildAddress = useCallback(
    (data: typeof formData, category: CityCategory): AddressProps => {
      return {
        _id: `temp-${Date.now()}`,
        name: data.name,
        phone: data.phone,
        address: data.address,
        city: getCityName(category, data.city),
        state: data.state,
        cityCategory: category,
      };
    },
    [getCityName]
  );

  // Debounced update for text inputs - only validates and updates parent after typing stops
  const debouncedUpdate = useCallback(
    (data: typeof formData, category: CityCategory) => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      debounceRef.current = setTimeout(() => {
        const { isValid, errors: newErrors } = validateForm(data, category);
        setErrors(newErrors);

        if (isValid) {
          onAddressChange(buildAddress(data, category));
        } else {
          onAddressChange(null);
        }
      }, 1000); // 500ms debounce
    },
    [validateForm, buildAddress, onAddressChange]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const newFormData = { ...formData, [name]: value };
    setFormData(newFormData);

    // Clear error immediately when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }

    // Debounced validation and parent update
    debouncedUpdate(newFormData, cityCategory);
  };

  // Immediately validate on blur (when user leaves input) to ensure address is set before button click
  const handleBlur = useCallback(() => {
    // Cancel pending debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }

    // Validate and update parent immediately
    const { isValid, errors: newErrors } = validateForm(formData, cityCategory);
    setErrors(newErrors);

    if (isValid) {
      onAddressChange(buildAddress(formData, cityCategory));
    } else {
      onAddressChange(null);
    }
  }, [formData, cityCategory, validateForm, buildAddress, onAddressChange]);

  const handleCityCategoryChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const newCategory = e.target.value as CityCategory;
    setCityCategory(newCategory);

    // Auto-fill city name based on selection
    let cityName = formData.city;
    if (newCategory === "cairo") {
      cityName = tShipping("form.cityOptions.cairo");
    } else if (newCategory === "giza") {
      cityName = tShipping("form.cityOptions.giza");
    } else {
      cityName = "";
    }

    const newFormData = { ...formData, city: cityName };
    setFormData(newFormData);

    // Clear city error
    if (errors.city) {
      setErrors((prev) => ({ ...prev, city: "" }));
    }

    // Immediately notify parent of city category change for shipping fee
    if (onCityCategoryChange) {
      onCityCategoryChange(newCategory);
    }

    // Cancel any pending debounce and validate immediately for dropdown change
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    const { isValid, errors: newErrors } = validateForm(
      newFormData,
      newCategory
    );
    setErrors(newErrors);

    if (isValid) {
      onAddressChange(buildAddress(newFormData, newCategory));
    } else {
      onAddressChange(null);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        {tCheckout("addressForOrder")}
      </h3>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {tShipping("form.fullNameRequired")}
        </label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder={tShipping("form.fullNamePlaceholder")}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange ${
            errors.name ? "border-red-500" : "border-gray-300"
          }`}
        />
        {errors.name && (
          <p className="text-red-500 text-xs mt-1">{errors.name}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {tShipping("form.phoneNumberRequired")}
        </label>
        <input
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder={tShipping("form.phoneNumberPlaceholder")}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange ${
            errors.phone ? "border-red-500" : "border-gray-300"
          }`}
        />
        {errors.phone && (
          <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {tShipping("form.streetAddressRequired")}
        </label>
        <input
          type="text"
          name="address"
          value={formData.address}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder={tShipping("form.streetAddressPlaceholder")}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange ${
            errors.address ? "border-red-500" : "border-gray-300"
          }`}
        />
        {errors.address && (
          <p className="text-red-500 text-xs mt-1">{errors.address}</p>
        )}
      </div>

      {/* City Category Dropdown */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {tShipping("form.cityRequired")}
        </label>
        <div className="relative">
          <select
            value={cityCategory}
            onChange={handleCityCategoryChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange appearance-none bg-white cursor-pointer"
          >
            <option value="cairo">{tShipping("form.cityOptions.cairo")}</option>
            <option value="giza">{tShipping("form.cityOptions.giza")}</option>
            <option value="other">{tShipping("form.cityOptions.other")}</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
        </div>
      </div>

      {/* Show city input only when "other" is selected */}
      {cityCategory === "other" && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {tShipping("form.otherCityName")}
          </label>
          <input
            type="text"
            name="city"
            value={formData.city}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder={tShipping("form.otherCityPlaceholder")}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange ${
              errors.city ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.city && (
            <p className="text-red-500 text-xs mt-1">{errors.city}</p>
          )}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {tShipping("form.stateRequired")}
        </label>
        <input
          type="text"
          name="state"
          value={formData.state}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder={tShipping("form.statePlaceholder")}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange ${
            errors.state ? "border-red-500" : "border-gray-300"
          }`}
        />
        {errors.state && (
          <p className="text-red-500 text-xs mt-1">{errors.state}</p>
        )}
      </div>
    </div>
  );
};

export default GuestAddressForm;
