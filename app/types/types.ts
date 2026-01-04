import { StaticImageData } from "next/image";

export interface ProductVariant {
  _id?: string;
  color: string;
  size: string;
  quantity: number;
  sku?: string;
}

export interface ProductCardProps {
  _id?: string;
  name: string;
  description: string;
  rating: number;
  price: number;
  oldPrice?: number;
  discount?: string;
  category?: string;
  categoryName?: string;
  brand?: string;
  color?: string;
  quantity?: number;
  quantityInCart?: number;
  variants?: ProductVariant[];
  totalStock?: number;
  selectedVariantId?: string;
  selectedColor?: string;
  selectedSize?: string;
  maxAvailable?: number;
  variantSku?: string;
  imgSrc: StaticImageData[];
}

export interface CategoryProps {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  isActive: boolean;
  isFeatured: boolean;
  sortOrder: number;
  products: ProductCardProps[];
  createdAt: Date;
  updatedAt: Date;
}

export interface TableRowProps {
  product: ProductCardProps;
}

export type CityCategory = "cairo" | "giza" | "other";

export interface AddressProps {
  _id: string;
  name: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  cityCategory?: CityCategory;
}

export enum PromoCodeState {
  ACTIVE = "active",
  INACTIVE = "inactive",
  EXPIRED = "expired",
}

// export interface ShippingFromProps {
//   handleInputChange(e: React.ChangeEvent<HTMLInputElement>): void;
//   formData: {
//     name: string;
//     phone: string;
//     pinCode: string;
//     address: string;
//     city: string;
//     state: string;
//   };
// }
