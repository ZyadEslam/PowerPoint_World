import { getSession } from "next-auth/react";
import { sanitizeVariants } from "./variantUtils";

function getBaseUrl(): string {
  return "";
}

export const addProduct = async (formData: FormData) => {
  try {
    const image1: File | null = formData.get("image1") as File | null;
    const image2: File | null = formData.get("image2") as File | null;
    const image3: File | null = formData.get("image3") as File | null;
    const image4: File | null = formData.get("image4") as File | null;

    // Convert image files to base64 strings for JSON serialization
    // Only process files that exist and have content
    const convertImageToBase64 = async (
      file: File | null
    ): Promise<string | null> => {
      // Check if file exists, has content, and is a valid file
      if (
        !file ||
        file.size === 0 ||
        file.name === "" ||
        file.type === "" ||
        !file.type.startsWith("image/")
      ) {
        return null;
      }
      try {
        const arrayBuffer = await file.arrayBuffer();
        // Additional check: ensure arrayBuffer has content
        if (arrayBuffer.byteLength === 0) {
          return null;
        }
        const buffer = Buffer.from(arrayBuffer);
        return buffer.toString("base64");
      } catch {
        return null;
      }
    };

    const [base64Image1, base64Image2, base64Image3, base64Image4] =
      await Promise.all([
        convertImageToBase64(image1),
        convertImageToBase64(image2),
        convertImageToBase64(image3),
        convertImageToBase64(image4),
      ]);

    // Filter out null values and create array of base64 strings
    const imgFiles = [
      base64Image1,
      base64Image2,
      base64Image3,
      base64Image4,
    ].filter((img): img is string => img !== null && img !== undefined);

    // Validate that at least one image is provided
    if (imgFiles.length === 0) {
      throw new Error("At least one product image is required");
    }

    let variantsPayload: unknown = [];
    const variantsField = formData.get("variants");

    if (variantsField) {
      try {
        variantsPayload = JSON.parse(variantsField as string);
      } catch {
        // Error handled silently for production
      }
    }

    const product = {
      name: formData.get("name"),
      description: formData.get("description"),
      rating: Number(formData.get("rating")),
      price: Number(formData.get("price")),
      oldPrice: formData.get("oldPrice")
        ? Number(formData.get("oldPrice"))
        : undefined,
      discount: formData.get("discount")
        ? Number(formData.get("discount"))
        : undefined,
      category: formData.get("category"),
      brand: formData.get("brand"),
      imgSrc: imgFiles,
      variants: sanitizeVariants(variantsPayload),
    };

    const res = await fetch("/api/product", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(product),
    });

    if (!res.ok) {
      throw new Error("Failed to add product");
    }
    return res.json();
  } catch (error) {
    throw error;
  }
};

// shippingFormAction - creates a shipping address for the logged-in user
export const shippingFormAction = async (
  formState: { success: boolean; message: string },
  formData: FormData
) => {
  const session = await getSession();
  try {
    if (!session?.user?.id) {
      return { success: false, message: "User not authenticated." };
    }

    const addressData = {
      userId: session.user.id,
      name: formData.get("name") as string,
      phone: formData.get("phone") as string,
      address: formData.get("address") as string,
      city: formData.get("city") as string,
      state: formData.get("state") as string,
    };

    // Validate required fields
    if (!addressData.name || !addressData.phone || !addressData.address || !addressData.city || !addressData.state) {
      return { success: false, message: "Please fill in all required fields." };
    }

    const response = await fetch(`${getBaseUrl()}/api/address`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(addressData),
    });

    const result = await response.json();

    if (response.ok && result.success) {
      return { success: true, message: "Address created successfully!" };
    } else {
      return {
        success: false,
        message: result.message || "Failed to create address.",
      };
    }
  } catch {
    return {
      success: false,
      message: "Failed to create address. Please try again.",
    };
  }
};

// placeOrderAction - now uses inline address instead of addressId
export const placeOrderAction = async (
  formState: { success: boolean; message: string },
  formData: FormData
) => {
  const session = await getSession();
  try {
    const promoCode = formData.get("promoCode") as string;
    const discountAmount = formData.get("discountAmount") as string;
    const discountPercentage = formData.get("discountPercentage") as string;

    // Parse address from form data
    const address = {
      name: formData.get("addressName") as string,
      phone: formData.get("addressPhone") as string,
      address: formData.get("addressStreet") as string,
      city: formData.get("addressCity") as string,
      state: formData.get("addressState") as string,
    };

    const orderData = {
      address,
      userId: session?.user.id as string,
      products: JSON.parse(formData.get("products") as string),
      totalPrice: Number(formData.get("totalPrice")),
      ...(promoCode && { promoCode }),
      ...(discountAmount && { discountAmount: Number(discountAmount) }),
      ...(discountPercentage && {
        discountPercentage: Number(discountPercentage),
      }),
    };

    // Validate address
    if (!address.name || !address.phone || !address.address || !address.city || !address.state) {
      return { success: false, message: "Please fill in all address fields." };
    }
    if (!orderData.userId) {
      return { success: false, message: "User not authenticated." };
    }
    if (orderData.products.length === 0) {
      return { success: false, message: "No products in the order." };
    }
    const response = await fetch(`${getBaseUrl()}/api/order`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(orderData),
    });
    const result = await response.json();

    if (result.success) {
      return { success: true, message: "Order placed successfully!" };
    } else {
      return {
        success: false,
        message: result.message || "Failed to place order",
      };
    }
  } catch {
    return {
      success: false,
      message: "Failed to place order. Please try again.",
    };
  }
};
