export interface OrderProduct {
  _id?: string;
  name: string;
  price: number;
  images?: string[];
  [key: string]: unknown;
}

export interface OrderAddress {
  name?: string;
  address?: string;
  city?: string;
  state?: string;
  phone?: string;
  [key: string]: unknown;
}

export type OrderState =
  | "Pending"
  | "Processing"
  | "Shipped"
  | "Delivered"
  | "Cancelled";
export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

export interface Order {
  _id: string;
  orderNumber: string;
  date: string | Date;
  totalPrice: number;
  orderState: OrderState;
  paymentStatus: string;
  paymentMethod: string;
  userId: string;
  userName: string;
  userEmail: string;
  address?: OrderAddress;
  products?: OrderProduct[];
  trackingNumber?: string;
  estimatedDeliveryDate?: string | Date;
  shippedDate?: string | Date;
  deliveredDate?: string | Date;
  promoCode?: string;
  discountAmount?: number;
  discountPercentage?: number;
}

export interface OrderFormData {
  orderState?: OrderState;
  paymentStatus?: PaymentStatus;
  trackingNumber?: string;
  estimatedDeliveryDate?: string;
}

export interface OrdersPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface OrdersResponse {
  orders: Order[];
  pagination: OrdersPagination;
}
